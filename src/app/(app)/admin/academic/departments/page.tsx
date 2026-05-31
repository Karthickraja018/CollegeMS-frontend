"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { departmentsApi, academicYearsApi, programsApi, semestersApi, usersApi } from "@/services/admin"
import {
  PageHeader, DataTable, FilterBar, StatusBadge, Btn, Modal, FormField, Input, Select,
  ConfirmDialog, EmptyState, SelectFilter, Pagination, LoadingPage,
} from "@/components/ui/admin"
import { Plus, Building2, Edit2, ToggleLeft, ToggleRight, Users, GraduationCap } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"

const deptSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(1, "Code is required").max(20),
  hod_id: z.coerce.number().optional().nullable(),
  phone_ext: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  established_year: z.coerce.number().optional().nullable(),
  is_active: z.boolean().default(true),
})
type DeptForm = z.infer<typeof deptSchema>

export default function DepartmentsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [toggleTarget, setToggleTarget] = useState<any>(null)
  const [search, setSearch] = useState("")

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list(),
  })

  const { data: facultyUsers = [] } = useQuery({
    queryKey: ["users-hod"],
    queryFn: () => usersApi.list({ role: "hod", is_active: true, page_size: 100 }).then((r: any) => r.data),
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<DeptForm>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(deptSchema),
  })

  const mut = useMutation({
    mutationFn: (data: any) => editing
      ? departmentsApi.update(editing.id, data)
      : departmentsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); closeModal() },
  })

  const toggleMut = useMutation({
    mutationFn: (id: number) => departmentsApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); setToggleTarget(null) },
  })

  const openCreate = () => { reset({ is_active: true }); setEditing(null); setModalOpen(true) }
  const openEdit = (dept: any) => {
    setEditing(dept)
    reset({
      name: dept.name, code: dept.code, hod_id: dept.hod_id,
      phone_ext: dept.phone_ext || "", email: dept.email || "",
      established_year: dept.established_year, is_active: dept.is_active,
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null); reset() }

  const filtered = departments.filter((d: any) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: "name", label: "Department", sortable: true,
      render: (row: any) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{row.name}</div>
          <div className="text-xs text-[#94A3B8] font-mono">{row.code}</div>
        </div>
      ),
    },
    {
      key: "hod_name", label: "HOD",
      render: (row: any) => row.hod_name
        ? <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] text-xs font-bold">{row.hod_name.charAt(0)}</div><span className="text-sm">{row.hod_name}</span></div>
        : <span className="text-[#94A3B8] text-xs">Not assigned</span>,
    },
    { key: "program_count", label: "Programs", sortable: true, render: (row: any) => <span className="font-semibold">{row.program_count}</span> },
    { key: "student_count", label: "Students", sortable: true, render: (row: any) => <span className="font-semibold">{row.student_count}</span> },
    { key: "established_year", label: "Est. Year", render: (row: any) => row.established_year || "—" },
    { key: "is_active", label: "Status", render: (row: any) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant="secondary" icon={Edit2} onClick={() => openEdit(row)}>Edit</Btn>
          <Btn
            size="sm" variant={row.is_active ? "danger" : "primary"}
            icon={row.is_active ? ToggleLeft : ToggleRight}
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
        title="Departments"
        subtitle={`${departments.length} departments configured`}
        badge={`${departments.filter((d: any) => d.is_active).length} active`}
        actions={<Btn icon={Plus} onClick={openCreate}>Add Department</Btn>}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search departments…"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No departments found. Create your first department."
        rowKey={(row) => row.id}
      />

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editing ? "Edit Department" : "Add Department"}
        subtitle={editing ? `Editing ${editing.name}` : "Create a new department"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit((d) => mut.mutate(d as any))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Department Name" required error={errors.name?.message}>
                <Input {...register("name")} placeholder="Computer Science & Engineering" />
              </FormField>
            </div>
            <FormField label="Short Code" required error={errors.code?.message}>
              <Input {...register("code")} placeholder="CSE" className="font-mono" />
            </FormField>
            <FormField label="Established Year" error={errors.established_year?.message}>
              <Input {...register("established_year")} type="number" placeholder="1985" />
            </FormField>
            <FormField label="HOD" error={errors.hod_id?.message}>
              <Select {...register("hod_id")}>
                <option value="">— Select HOD —</option>
                {facultyUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Phone Extension" error={errors.phone_ext?.message}>
              <Input {...register("phone_ext")} placeholder="101" />
            </FormField>
            <div className="col-span-2">
              <FormField label="Email" error={errors.email?.message}>
                <Input {...register("email")} type="email" placeholder="cse@college.edu" />
              </FormField>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={mut.isPending} className="flex-1">

              {editing ? "Save Changes" : "Create Department"}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Toggle Confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? "Deactivate Department?" : "Activate Department?"}
        message={`This will ${toggleTarget?.is_active ? "deactivate" : "activate"} "${toggleTarget?.name}".`}
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        danger={toggleTarget?.is_active}
        onConfirm={() => toggleMut.mutate(toggleTarget.id)}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}

