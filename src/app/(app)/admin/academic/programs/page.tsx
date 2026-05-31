"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { programsApi, departmentsApi } from "@/services/admin"
import {
  PageHeader, DataTable, FilterBar, StatusBadge, Btn, Modal, FormField, Input, Select,
  ConfirmDialog, SelectFilter,
} from "@/components/ui/admin"
import { Plus, Edit2, GraduationCap, BookOpen } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const PROGRAM_TYPES = ["ug", "pg", "diploma", "certificate", "phd"]

const schema = z.object({
  department_id: z.coerce.number().min(1, "Select a department"),
  name: z.string().min(2, "Name required"),
  code: z.string().min(1, "Code required"),
  type: z.string().min(1, "Type required"),
  duration_years: z.coerce.number().min(1).max(10),
  total_semesters: z.coerce.number().min(1).max(20),
  total_credits: z.coerce.number().min(1),
  intake_capacity: z.coerce.number().optional().nullable(),
  is_nba_accredited: z.boolean().default(false),
  is_active: z.boolean().default(true),
})
type Form = z.infer<typeof schema>

export default function ProgramsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs", deptFilter],
    queryFn: () => programsApi.list(deptFilter ? { department_id: Number(deptFilter) } : undefined),
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list({ is_active: true }),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(schema),
    defaultValues: { duration_years: 4, total_semesters: 8, total_credits: 160, is_active: true },
  })

  const mut = useMutation({
    mutationFn: (data: any) => editing ? programsApi.update(editing.id, data) : programsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["programs"] }); closeModal() },
  })

  const openCreate = () => { reset({ duration_years: 4, total_semesters: 8, total_credits: 160, is_active: true }); setEditing(null); setModalOpen(true) }
  const openEdit = (p: any) => { setEditing(p); reset({ ...p }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const filtered = programs.filter((p: any) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: "name", label: "Program", sortable: true,
      render: (row: any) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{row.name}</div>
          <div className="text-xs font-mono text-[#94A3B8]">{row.code}</div>
        </div>
      ),
    },
    { key: "department_name", label: "Department", sortable: true },
    {
      key: "type", label: "Type",
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#6366F1]/10 text-[#6366F1] uppercase">
          {row.type}
        </span>
      ),
    },
    { key: "duration_years", label: "Duration", render: (row: any) => `${row.duration_years} years` },
    { key: "total_semesters", label: "Semesters" },
    { key: "student_count", label: "Students", sortable: true },
    {
      key: "is_nba_accredited", label: "NBA",
      render: (row: any) => row.is_nba_accredited
        ? <span className="text-xs font-bold text-emerald-600">✓ Accredited</span>
        : <span className="text-xs text-[#94A3B8]">—</span>,
    },
    { key: "is_active", label: "Status", render: (row: any) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <Btn size="sm" variant="secondary" icon={Edit2} onClick={(e) => { e.stopPropagation(); openEdit(row) }}>Edit</Btn>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Programs"
        subtitle={`${programs.length} programs configured`}
        actions={<Btn icon={Plus} onClick={openCreate}>Add Program</Btn>}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search programs…"
        filters={
          <SelectFilter
            value={deptFilter}
            onChange={setDeptFilter}
            options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))}
            placeholder="All Departments"
          />
        }
      />

      <DataTable columns={columns} data={filtered} loading={isLoading} rowKey={(r) => r.id} />

      <Modal open={modalOpen} title={editing ? "Edit Program" : "Add Program"} onClose={closeModal} width="max-w-xl">
        <form onSubmit={handleSubmit((d) => mut.mutate(d as any))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Program Name" required error={errors.name?.message}>
                <Input {...register("name")} placeholder="Bachelor of Engineering - CSE" />
              </FormField>
            </div>
            <FormField label="Code" required error={errors.code?.message}>
              <Input {...register("code")} placeholder="BE-CSE" className="font-mono" />
            </FormField>
            <FormField label="Department" required error={errors.department_id?.message}>
              <Select {...register("department_id")}>
                <option value="">— Select —</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Type" required error={errors.type?.message}>
              <Select {...register("type")}>
                <option value="">— Select —</option>
                {PROGRAM_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </Select>
            </FormField>
            <FormField label="Duration (years)" error={errors.duration_years?.message}>
              <Input {...register("duration_years")} type="number" min={1} max={10} />
            </FormField>
            <FormField label="Total Semesters" error={errors.total_semesters?.message}>
              <Input {...register("total_semesters")} type="number" min={1} max={20} />
            </FormField>
            <FormField label="Total Credits" error={errors.total_credits?.message}>
              <Input {...register("total_credits")} type="number" min={1} />
            </FormField>
            <FormField label="Intake Capacity" error={errors.intake_capacity?.message}>
              <Input {...register("intake_capacity")} type="number" placeholder="60" />
            </FormField>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("is_nba_accredited")} className="rounded" />
                <span className="text-[#374151] font-medium">NBA Accredited</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("is_active")} className="rounded" defaultChecked />
                <span className="text-[#374151] font-medium">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={mut.isPending} className="flex-1">
              {editing ? "Save Changes" : "Create Program"}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}

