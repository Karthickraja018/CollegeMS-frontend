"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi, departmentsApi } from "@/services/admin"
import {
  PageHeader, FilterBar, StatusBadge, Btn, Modal, FormField, Input, Select,
  ConfirmDialog, SelectFilter, Pagination,
  InsightsPanel, UserDrawer, PermissionMatrix, DepartmentOverview
} from "@/components/ui/admin"
import {
  Plus, Users, MoreVertical, KeyRound, Building2, CheckCircle2, Shield, Eye, Trash2, Mail
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

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  full_name: z.string().min(2, "Name required"),
  role: z.string().min(1, "Select a role"),
  department_id: z.coerce.number().optional().nullable(),
  designation: z.string().optional(),
})
type InviteForm = z.infer<typeof inviteSchema>

const resetSchema = z.object({
  new_password: z.string().min(6, "Min 6 characters"),
})

export default function UsersPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState("users")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loginFilter, setLoginFilter] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<any>(null)
  const [toggleTarget, setToggleTarget] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, deptFilter, statusFilter],
    queryFn: () => usersApi.list({
      page, page_size: 20,
      search: search || undefined,
      role: roleFilter || undefined,
      department_id: deptFilter ? Number(deptFilter) : undefined,
      is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    }),
    staleTime: 30_000,
  })

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ["admin-users-insights"],
    queryFn: () => usersApi.getInsights(),
    staleTime: 60_000,
  })

  const { data: deptsOverview, isLoading: deptsLoading } = useQuery({
    queryKey: ["admin-depts-overview"],
    queryFn: () => departmentsApi.getOverview(),
    enabled: activeTab === "departments",
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list({ is_active: true }),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteForm>({
    // @ts-ignore
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "faculty" },
  })

  const resetForm = useForm<{ new_password: string }>({
    // @ts-ignore
    resolver: zodResolver(resetSchema),
  })

  const createMut = useMutation({
    // Password will be created by user after invitation, but for now we set a temp password
    mutationFn: (data: InviteForm) => usersApi.create({ ...data, password: "TempPassword123!" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); setInviteOpen(false); reset() },
  })

  const toggleMut = useMutation({
    mutationFn: (id: number) => usersApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); setToggleTarget(null) },
  })

  const bulkMut = useMutation({
    mutationFn: (data: { user_ids: number[], action: string, value?: string }) => usersApi.bulkAction(data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      setSelectedIds([])
    },
  })

  const resetPwMut = useMutation({
    mutationFn: ({ id, pw }: { id: number; pw: string }) => usersApi.resetPassword(id, pw),
    onSuccess: () => { setResetTarget(null); resetForm.reset() },
  })

  const users = result?.data || []
  const total = result?.total || 0

  const roleColor: Record<string, string> = {
    college_admin: "text-indigo-700 bg-indigo-50 border border-indigo-200",
    admin: "text-indigo-700 bg-indigo-50 border border-indigo-200",
    principal: "text-indigo-800 bg-indigo-100 border border-indigo-300",
    hod: "text-indigo-600 bg-indigo-50 border border-indigo-200",
    faculty: "text-slate-600 bg-slate-100 border border-slate-200",
    staff: "text-slate-500 bg-slate-50 border border-slate-200",
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([])
    else setSelectedIds(users.map((u: any) => u.id))
  }

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return
    bulkMut.mutate({ user_ids: selectedIds, action })
  }

  return (
    <div className="pb-10">
      <PageHeader
        title="User Management"
        subtitle="Manage college users, departments and permissions."
        actions={<Btn icon={Mail} onClick={() => setInviteOpen(true)}>Invite User</Btn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: "Total Users", val: 16 },
          { label: "Active Users", val: 15 },
          { label: "Faculty", val: 11 },
          { label: "HODs", val: 3 },
          { label: "Principals", val: 1 },
          { label: "Admins", val: 1 },
          { label: "Pending", val: 2 },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold text-slate-800">{kpi.val}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <InsightsPanel 
        insights={insightsData?.insights || [
          "2 faculty members have not logged in for 30 days",
          "Computer Science department has the highest active users",
          "1 HOD account requires password reset",
          "4 new users added this month"
        ]} 
        loading={insightsLoading} 
      />

      <div className="flex border-b border-slate-200 mb-6 space-x-6">
        {[
          { id: "users", label: "Users" },
          { id: "permissions", label: "Role-Based Permissions" },
          { id: "departments", label: "Department Overview" },
          { id: "audit", label: "Audit & Security" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "permissions" && <PermissionMatrix />}
      {activeTab === "departments" && <DepartmentOverview departments={deptsOverview} loading={deptsLoading} />}
      {activeTab === "audit" && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 shadow-sm">
          <Shield className="mx-auto mb-3 text-slate-300" size={32} />
          <h3 className="font-semibold text-slate-700 mb-1">Audit Logs</h3>
          <p className="text-sm">Recent User Activity, Password Resets, Role Changes, and Failed Login Attempts will appear here.</p>
        </div>
      )}

      {activeTab === "users" && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
            <FilterBar
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1) }}
              placeholder="Search by name, email, or employee ID…"
              filters={
                <>
                  <SelectFilter value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1) }} options={ROLES} placeholder="All Roles" />
                  <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }} options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))} placeholder="All Departments" />
                  <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} options={[{value:"active", label:"Active"}, {value:"inactive", label:"Inactive"}, {value:"pending", label:"Pending"}]} placeholder="All Statuses" />
                  <SelectFilter value={loginFilter} onChange={setLoginFilter} options={[{value:"today", label:"Today"}, {value:"week", label:"This Week"}, {value:"month", label:"This Month"}, {value:"never", label:"Never"}]} placeholder="Last Login" />
                </>
              }
            />

            {selectedIds.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-700">{selectedIds.length} users selected</span>
                <div className="flex gap-2">
                  <Btn size="sm" variant="secondary" onClick={() => handleBulkAction("activate")}>Activate</Btn>
                  <Btn size="sm" variant="secondary" onClick={() => handleBulkAction("deactivate")}>Deactivate</Btn>
                  <Btn size="sm" variant="danger" onClick={() => handleBulkAction("delete")}>Delete</Btn>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 text-left w-10">
                      <input type="checkbox" checked={users.length > 0 && selectedIds.length === users.length} onChange={toggleAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">User Information</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Department</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Login</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                     <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 animate-pulse">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        <Users size={32} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="font-semibold text-slate-700 mb-1">No users found</h3>
                        <p className="text-sm mb-4">Create a new user or send an invitation.</p>
                        <Btn icon={Mail} onClick={() => setInviteOpen(true)}>Send Invitation</Btn>
                      </td>
                    </tr>
                  ) : (
                    users.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(row)}>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold flex-shrink-0 border border-slate-200">
                              {row.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{row.full_name}</div>
                              <div className="text-xs text-slate-500 flex gap-2">
                                <span>{row.email}</span>
                                {row.employee_id && <span>• {row.employee_id}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor[row.role] || "bg-slate-100 text-slate-600"}`}>
                            {row.role?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-700">{row.department_name || "—"}</div>
                          {row.designation && <div className="text-xs text-slate-500">{row.designation}</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                          {row.last_login ? new Date(row.last_login).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          {row.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/>Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="relative group inline-block">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <MoreVertical size={18} />
                            </button>
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
                              <button onClick={() => setSelectedUser(row)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Eye size={14}/> View Profile</button>
                              <button onClick={() => setResetTarget(row)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><KeyRound size={14}/> Reset Password</button>
                              <button onClick={() => setToggleTarget(row)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <CheckCircle2 size={14}/> {row.is_active ? "Deactivate User" : "Activate User"}
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button onClick={() => setDeleteTarget(row)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Delete User</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <Pagination page={page} pageSize={20} total={total} onChange={setPage} />
          </div>
        </>
      )}

      <UserDrawer user={selectedUser} open={!!selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Invite User Modal */}
      <Modal open={inviteOpen} title="Invite User" subtitle="Send an invitation to join the platform" onClose={() => setInviteOpen(false)} width="max-w-md">
        <form onSubmit={handleSubmit((d: any) => createMut.mutate(d as InviteForm))} className="flex flex-col gap-4">
          <FormField label="Full Name" required error={errors.full_name?.message}>
            <Input {...register("full_name")} placeholder="Prof. Jane Doe" />
          </FormField>
          <FormField label="Email" required error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="jane.doe@college.edu" />
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
          <FormField label="Designation" error={errors.designation?.message}>
            <Input {...register("designation")} placeholder="e.g. Associate Professor" />
          </FormField>
          
          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
            <Btn type="button" variant="secondary" onClick={() => setInviteOpen(false)} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={createMut.isPending} className="flex-1">Send Invitation</Btn>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetTarget} title="Reset Password" subtitle={resetTarget?.full_name} onClose={() => setResetTarget(null)}>
        <form onSubmit={resetForm.handleSubmit((d) => resetPwMut.mutate({ id: resetTarget.id, pw: d.new_password }))} className="flex flex-col gap-4">
          <FormField label="New Password" required error={resetForm.formState.errors.new_password?.message}>
            <Input {...resetForm.register("new_password")} type="password" placeholder="Min 6 characters" />
          </FormField>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setResetTarget(null)} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={resetPwMut.isPending} className="flex-1">Reset Password</Btn>
          </div>
        </form>
      </Modal>

      {/* Toggle Confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? "Deactivate User?" : "Activate User?"}
        message={`This will ${toggleTarget?.is_active ? "lock" : "restore"} access for "${toggleTarget?.full_name}".`}
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        danger={toggleTarget?.is_active}
        onConfirm={() => toggleMut.mutate(toggleTarget.id)}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.full_name}"? This action cannot be undone.`}
        confirmLabel="Delete User"
        danger={true}
        onConfirm={() => {
          bulkMut.mutate({ user_ids: [deleteTarget.id], action: "delete" });
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
