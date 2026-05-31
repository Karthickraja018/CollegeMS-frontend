"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { semestersApi, programsApi, academicYearsApi } from "@/services/admin"
import {
  PageHeader, DataTable, FilterBar, StatusBadge, Btn, Modal, FormField, Input, Select,
  SelectFilter, ConfirmDialog,
} from "@/components/ui/admin"
import { Plus, Edit2, Play, Square } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  academic_year_id: z.coerce.number().min(1, "Select academic year"),
  program_id: z.coerce.number().min(1, "Select program"),
  semester_number: z.coerce.number().min(1).max(12),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required"),
  status: z.string().default("upcoming"),
  working_days: z.coerce.number().optional().nullable(),
})
type Form = z.infer<typeof schema>

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "results_published", label: "Results Published" },
]

export default function SemestersPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [statusTarget, setStatusTarget] = useState<{ sem: any; newStatus: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState("")

  const { data: semesters = [], isLoading } = useQuery({
    queryKey: ["semesters", statusFilter],
    queryFn: () => semestersApi.list(statusFilter ? { status: statusFilter } : undefined),
  })

  const { data: programs = [] } = useQuery({ queryKey: ["programs"], queryFn: () => programsApi.list() })
  const { data: years = [] } = useQuery({ queryKey: ["academic-years"], queryFn: academicYearsApi.list })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(schema),
    defaultValues: { status: "upcoming" },
  })

  const createMut = useMutation({
    mutationFn: (data: any) => semestersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["semesters"] }); closeModal() },
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => semestersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["semesters"] }); setStatusTarget(null) },
  })

  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const columns = [
    {
      key: "program_name", label: "Program / Semester",
      render: (row: any) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{row.program_name}</div>
          <div className="text-xs text-[#94A3B8]">{row.department_name} · Semester {row.semester_number}</div>
        </div>
      ),
    },
    { key: "academic_year", label: "Academic Year", render: (row: any) => <span className="font-mono font-semibold">{row.academic_year}</span> },
    {
      key: "start_date", label: "Duration",
      render: (row: any) => (
        <div className="text-xs">
          <div>{new Date(row.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
          <div className="text-[#94A3B8]">→ {new Date(row.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
      ),
    },
    { key: "enrolled_students", label: "Students", render: (row: any) => <span className="font-semibold">{row.enrolled_students || 0}</span> },
    { key: "working_days", label: "Working Days", render: (row: any) => row.working_days || "—" },
    { key: "status", label: "Status", render: (row: any) => <StatusBadge value={row.status} /> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status === "upcoming" && (
            <Btn size="sm" icon={Play} onClick={() => setStatusTarget({ sem: row, newStatus: "ongoing" })}>Start</Btn>
          )}
          {row.status === "ongoing" && (
            <Btn size="sm" variant="secondary" icon={Square} onClick={() => setStatusTarget({ sem: row, newStatus: "completed" })}>Complete</Btn>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Semesters"
        subtitle="Running semesters tied to academic years and programs"
        badge={`${semesters.filter((s: any) => s.status === "ongoing").length} active`}
        actions={<Btn icon={Plus} onClick={() => { reset(); setModalOpen(true) }}>Add Semester</Btn>}
      />

      <FilterBar
        filters={
          <SelectFilter value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All Statuses" />
        }
      />

      <DataTable columns={columns} data={semesters} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No semesters found." />

      <Modal open={modalOpen} title="Add Semester" onClose={closeModal}>
        <form onSubmit={handleSubmit((d) => createMut.mutate(d as any))} className="flex flex-col gap-4">
          <FormField label="Academic Year" required error={errors.academic_year_id?.message}>
            <Select {...register("academic_year_id")}>
              <option value="">— Select —</option>
              {years.map((y: any) => <option key={y.id} value={y.id}>{y.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Program" required error={errors.program_id?.message}>
            <Select {...register("program_id")}>
              <option value="">— Select —</option>
              {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Semester No." required error={errors.semester_number?.message}>
              <Input {...register("semester_number")} type="number" min={1} max={12} />
            </FormField>
            <FormField label="Working Days" error={errors.working_days?.message}>
              <Input {...register("working_days")} type="number" placeholder="90" />
            </FormField>
            <FormField label="Start Date" required error={errors.start_date?.message}>
              <Input {...register("start_date")} type="date" />
            </FormField>
            <FormField label="End Date" required error={errors.end_date?.message}>
              <Input {...register("end_date")} type="date" />
            </FormField>
          </div>
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={createMut.isPending} className="flex-1">Create Semester</Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.newStatus === "ongoing" ? "Start Semester?" : "Mark as Completed?"}
        message={`Change status of "${statusTarget?.sem?.program_name} - Semester ${statusTarget?.sem?.semester_number}" to "${statusTarget?.newStatus}"?`}
        confirmLabel="Confirm"
        onConfirm={() => statusMut.mutate({ id: statusTarget!.sem.id, status: statusTarget!.newStatus })}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  )
}

