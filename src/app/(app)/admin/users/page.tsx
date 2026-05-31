"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi, departmentsApi } from "@/services/admin"
import {
  PageHeader, DataTable, FilterBar, StatusBadge, Btn, Modal, FormField, Input, Select,
  ConfirmDialog, SelectFilter, Pagination,
} from "@/components/ui/admin"
import {
  Plus, Edit2, ToggleLeft, ToggleRight, KeyRound, Users, Eye,
  Mail, Phone, Shield, Building2, ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

const ROLES = [
  { value: "college_admin", label: "Admin" },
  { value: "principal", label: "Principal" },
  { value: "hod", label: "HOD" },
  { value: "faculty", label: "Faculty" },
  { value: "staff", label: "Staff" },
]

const createSchema = z.object({
  email: z.string().email("Invalid email"),
  full_name: z.string().min(2, "Name required"),
  password: z.string().min(6, "Min 6 characters"),
  role: z.string().min(1, "Select a role"),
  department_id: z.coerce.number().optional().nullable(),
  employee_id: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  experience_years: z.coerce.number().optional().nullable(),
})
type CreateForm = z.infer<typeof createSchema>

const resetSchema = z.object({
  new_password: z.string().min(6, "Min 6 characters"),
})

export default function UsersPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<any>(null)
  const [toggleTarget, setToggleTarget] = useState<any>(null)

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, deptFilter],
    queryFn: () => usersApi.list({
      page, page_size: 20,
      search: search || undefined,
      role: roleFilter || undefined,
      department_id: deptFilter ? Number(deptFilter) : undefined,
    }),
    staleTime: 30_000,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list({ is_active: true }),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateForm>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(createSchema),
    defaultValues: { role: "faculty" },
  })

  const resetForm = useForm<{ new_password: string }>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(resetSchema),
  })

  const createMut = useMutation({
    mutationFn: (data: CreateForm) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); setCreateOpen(false); reset() },
  })

  const toggleMut = useMutation({
    mutationFn: (id: number) => usersApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); setToggleTarget(null) },
  })

  const resetPwMut = useMutation({
    mutationFn: ({ id, pw }: { id: number; pw: string }) => usersApi.resetPassword(id, pw),
    onSuccess: () => { setResetTarget(null); resetForm.reset() },
  })

  const users = result?.data || []
  const total = result?.total || 0

  const roleColor: Record<string, string> = {
    college_admin: "text-violet-700 bg-violet-50",
    principal: "text-indigo-700 bg-indigo-50",
    hod: "text-blue-700 bg-blue-50",
    faculty: "text-sky-700 bg-sky-50",
    staff: "text-slate-600 bg-slate-100",
  }

  const columns = [
    {
      key: "full_name", label: "User", sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.full_name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#0F172A] text-sm">{row.full_name}</div>
            <div className="text-xs text-[#94A3B8]">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role", label: "Role",
      render: (row: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor[row.role] || "bg-slate-100 text-slate-600"}`}>
          {row.role?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "department_name", label: "Department",
      render: (row: any) => row.department_name || <span className="text-[#CBD5E1] text-xs">—</span>,
    },
    { key: "employee_id", label: "Employee ID", render: (row: any) => <span className="font-mono text-xs">{row.employee_id || "—"}</span> },
    { key: "designation", label: "Designation", render: (row: any) => row.designation || "—" },
    {
      key: "last_login", label: "Last Login",
      render: (row: any) => row.last_login
        ? new Date(row.last_login).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : <span className="text-[#CBD5E1] text-xs">Never</span>,
    },
    { key: "is_active", label: "Status", render: (row: any) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant="secondary" icon={KeyRound} onClick={() => setResetTarget(row)}>Reset PW</Btn>
          <Btn
            size="sm" variant={row.is_active ? "danger" : "primary"}
            onClick={() => setToggleTarget(row)}
          >
            {row.is_active ? "Deactivate" : "Activate"}
          </Btn>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all staff accounts and permissions"
        badge={`${total} users`}
        actions={<Btn icon={Plus} onClick={() => setCreateOpen(true)}>Create User</Btn>}
      />

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search by name, email, or employee ID…"
        filters={
          <>
            <SelectFilter
              value={roleFilter}
              onChange={(v) => { setRoleFilter(v); setPage(1) }}
              options={ROLES}
              placeholder="All Roles"
            />
            <SelectFilter
              value={deptFilter}
              onChange={(v) => { setDeptFilter(v); setPage(1) }}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))}
              placeholder="All Departments"
            />
          </>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage="No users found"
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/users/${r.id}`)}
      />
      <Pagination page={page} pageSize={20} total={total} onChange={setPage} />

      {/* Create User Modal */}
      <Modal open={createOpen} title="Create User" subtitle="Add a new staff account" onClose={() => setCreateOpen(false)} width="max-w-xl">
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Full Name" required error={errors.full_name?.message}>
                <Input {...register("full_name")} placeholder="Dr. John Smith" />
              </FormField>
            </div>
            <FormField label="Email" required error={errors.email?.message}>
              <Input {...register("email")} type="email" placeholder="john@college.edu" />
            </FormField>
            <FormField label="Password" required error={errors.password?.message}>
              <Input {...register("password")} type="password" placeholder="Min 6 chars" />
            </FormField>
            <FormField label="Role" required error={errors.role?.message}>
              <Select {...register("role")}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Department" error={errors.department_id?.message}>
              <Select {...register("department_id")}>
                <option value="">— None —</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Employee ID" error={errors.employee_id?.message}>
              <Input {...register("employee_id")} placeholder="EMP001" className="font-mono" />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="+91 9876543210" />
            </FormField>
            <FormField label="Designation" error={errors.designation?.message}>
              <Input {...register("designation")} placeholder="Associate Professor" />
            </FormField>
            <FormField label="Qualification" error={errors.qualification?.message}>
              <Input {...register("qualification")} placeholder="Ph.D., M.E." />
            </FormField>
            <FormField label="Experience (years)" error={errors.experience_years?.message}>
              <Input {...register("experience_years")} type="number" placeholder="5" />
            </FormField>
          </div>
          <div className="flex gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={createMut.isPending} className="flex-1">Create User</Btn>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetTarget} title="Reset Password" subtitle={resetTarget?.full_name} onClose={() => setResetTarget(null)}>
        <form onSubmit={resetForm.handleSubmit((d) => resetPwMut.mutate({ id: resetTarget.id, pw: d.new_password }))} className="flex flex-col gap-4">
          <FormField label="New Password" required error={resetForm.formState.errors.new_password?.message}>
            <Input {...resetForm.register("new_password")} type="password" placeholder="Min 6 characters" />
          </FormField>
          <div className="flex gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={() => setResetTarget(null)} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={resetPwMut.isPending} className="flex-1">Reset Password</Btn>
          </div>
        </form>
      </Modal>

      {/* Toggle Confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? "Deactivate User?" : "Activate User?"}
        message={`This will ${toggleTarget?.is_active ? "block" : "restore"} access for "${toggleTarget?.full_name}".`}
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        danger={toggleTarget?.is_active}
        onConfirm={() => toggleMut.mutate(toggleTarget.id)}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}

