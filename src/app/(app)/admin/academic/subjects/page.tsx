"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { subjectsApi, departmentsApi, programsApi } from "@/services/admin"
import {
  PageHeader, DataTable, FilterBar, StatusBadge, Btn, Modal, FormField, Input, Select,
  SelectFilter, ConfirmDialog,
} from "@/components/ui/admin"
import { Plus, Edit2, Trash2, BookOpen, FlaskConical, Presentation } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const SUBJECT_TYPES = [
  { value: "theory", label: "Theory" },
  { value: "practical", label: "Practical" },
  { value: "theory_cum_practical", label: "Theory + Practical" },
  { value: "project", label: "Project" },
  { value: "seminar", label: "Seminar" },
  { value: "internship", label: "Internship" },
  { value: "mooc", label: "MOOC" },
  { value: "audit_course", label: "Audit Course" },
]

const subjectTypeIcon: Record<string, React.ElementType> = {
  theory: BookOpen,
  practical: FlaskConical,
  theory_cum_practical: Presentation,
  project: Presentation,
  seminar: Presentation,
  internship: BookOpen,
  mooc: BookOpen,
  audit_course: BookOpen,
}

const schema = z.object({
  department_id: z.coerce.number().min(1, "Select department"),
  program_id: z.coerce.number().min(1, "Select program"),
  code: z.string().min(1, "Required"),
  name: z.string().min(2, "Required"),
  type: z.string().default("theory"),
  semester_number: z.coerce.number().min(1).max(12),
  credits: z.coerce.number().min(0).max(10),
  lecture_hours: z.coerce.number().min(0).default(3),
  tutorial_hours: z.coerce.number().min(0).default(1),
  practical_hours: z.coerce.number().min(0).default(0),
  is_elective: z.boolean().default(false),
  regulations: z.string().optional(),
  is_active: z.boolean().default(true),
})
type Form = z.infer<typeof schema>

export default function SubjectsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [semFilter, setSemFilter] = useState("")

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", deptFilter, semFilter, search],
    queryFn: () => subjectsApi.list({
      department_id: deptFilter ? Number(deptFilter) : undefined,
      semester_number: semFilter ? Number(semFilter) : undefined,
      search: search || undefined,
    }),
  })

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: () => departmentsApi.list({ is_active: true }) })
  const { data: programs = [] } = useQuery({ queryKey: ["programs"], queryFn: () => programsApi.list(deptFilter ? { department_id: Number(deptFilter) } : undefined) })

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<Form>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(schema),
    defaultValues: { type: "theory", credits: 3, lecture_hours: 3, tutorial_hours: 1, practical_hours: 0, is_active: true },
  })

  const mut = useMutation({
    mutationFn: (data: any) => editing ? subjectsApi.update(editing.id, data) : subjectsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); closeModal() },
  })

  const deactivateMut = useMutation({
    mutationFn: (id: number) => subjectsApi.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); setDeactivateTarget(null) },
  })

  const openCreate = () => { reset(); setEditing(null); setModalOpen(true) }
  const openEdit = (s: any) => { setEditing(s); reset({ ...s }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const columns = [
    {
      key: "name", label: "Subject",
      render: (row: any) => {
        const Icon = subjectTypeIcon[row.type] || BookOpen
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
              <Icon size={15} className="text-[#6366F1]" />
            </div>
            <div>
              <div className="font-semibold text-[#0F172A] text-sm">{row.name}</div>
              <div className="text-xs font-mono text-[#94A3B8]">{row.code}</div>
            </div>
          </div>
        )
      },
    },
    { key: "department_name", label: "Department" },
    {
      key: "type", label: "Type",
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] capitalize">
          {row.type?.replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "semester_number", label: "Sem", render: (row: any) => <span className="font-bold">{row.semester_number}</span> },
    { key: "credits", label: "Credits", render: (row: any) => <span className="font-semibold text-[#6366F1]">{row.credits}</span> },
    {
      key: "total_hours", label: "Hours/week",
      render: (row: any) => <span className="text-xs">{row.total_hours}h ({row.lecture_hours}L+{row.tutorial_hours}T+{row.practical_hours}P)</span>,
    },
    { key: "faculty_count", label: "Faculty", render: (row: any) => row.faculty_count || <span className="text-[#CBD5E1] text-xs">Unassigned</span> },
    { key: "is_elective", label: "Elective", render: (row: any) => row.is_elective ? <span className="text-xs font-semibold text-amber-600">Elective</span> : <span className="text-xs text-[#94A3B8]">Core</span> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant="secondary" icon={Edit2} onClick={() => openEdit(row)}>Edit</Btn>
          <Btn size="sm" variant="danger" icon={Trash2} onClick={() => setDeactivateTarget(row)}>Remove</Btn>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={`${subjects.length} subjects in the catalog`}
        actions={<Btn icon={Plus} onClick={openCreate}>Add Subject</Btn>}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search subjects…"
        filters={
          <>
            <SelectFilter value={deptFilter} onChange={setDeptFilter}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))} placeholder="All Departments" />
            <SelectFilter value={semFilter} onChange={setSemFilter}
              options={[1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Sem ${n}` }))} placeholder="All Semesters" />
          </>
        }
      />

      <DataTable columns={columns} data={subjects} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No subjects found." />

      <Modal open={modalOpen} title={editing ? "Edit Subject" : "Add Subject"} onClose={closeModal} width="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mut.mutate(d as any))} className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Subject Name" required error={errors.name?.message}>
                <Input {...register("name")} placeholder="Data Structures and Algorithms" />
              </FormField>
            </div>
            <FormField label="Subject Code" required error={errors.code?.message}>
              <Input {...register("code")} placeholder="CS3201" className="font-mono" />
            </FormField>
            <FormField label="Type" required error={errors.type?.message}>
              <Select {...register("type")}>
                {SUBJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Department" required error={errors.department_id?.message}>
              <Select {...register("department_id")}>
                <option value="">— Select —</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Program" required error={errors.program_id?.message}>
              <Select {...register("program_id")}>
                <option value="">— Select —</option>
                {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Semester" required error={errors.semester_number?.message}>
              <Input {...register("semester_number")} type="number" min={1} max={12} />
            </FormField>
            <FormField label="Credits" required error={errors.credits?.message}>
              <Input {...register("credits")} type="number" min={0} max={10} />
            </FormField>
            <FormField label="Lecture Hours/week" error={errors.lecture_hours?.message}>
              <Input {...register("lecture_hours")} type="number" min={0} />
            </FormField>
            <FormField label="Tutorial Hours/week" error={errors.tutorial_hours?.message}>
              <Input {...register("tutorial_hours")} type="number" min={0} />
            </FormField>
            <FormField label="Practical Hours/week" error={errors.practical_hours?.message}>
              <Input {...register("practical_hours")} type="number" min={0} />
            </FormField>
            <FormField label="Regulations" error={errors.regulations?.message}>
              <Input {...register("regulations")} placeholder="R2021" />
            </FormField>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("is_elective")} className="rounded" />
                <span className="text-[#374151] font-medium">Elective Subject</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("is_active")} className="rounded" defaultChecked />
                <span className="text-[#374151] font-medium">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={mut.isPending} className="flex-1">{editing ? "Save Changes" : "Create Subject"}</Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate Subject?"
        message={`Remove "${deactivateTarget?.name}" (${deactivateTarget?.code}) from the catalog? This sets it as inactive.`}
        confirmLabel="Deactivate"
        danger
        onConfirm={() => deactivateMut.mutate(deactivateTarget.id)}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}

