"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { examsApi, semestersApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Btn, Modal, StatusBadge } from "@/components/ui/admin"
import { Plus, CalendarDays, Clock } from "lucide-react"
import { useState } from "react"

const EXAM_TYPES = [
  "cia1", "cia2", "cia3", "model", "semester_end", "practical", "viva", "assignment", "quiz", "project_review"
]

const TYPE_COLORS: Record<string, string> = {
  semester_end: "danger", model: "warning", cia1: "default", cia2: "default", cia3: "default",
  practical: "success", viva: "purple",
}

export default function ExamSchedulesPage() {
  const [semFilter, setSemFilter] = useState("")
  const [examTypeFilter, setExamTypeFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  const qc = useQueryClient()

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["exam-schedules", semFilter, examTypeFilter],
    queryFn: () => examsApi.listSchedules({
      semester_id: semFilter ? Number(semFilter) : undefined,
      exam_type: examTypeFilter || undefined,
    }),
    staleTime: 30_000,
  })

  const { data: semesters = [] } = useQuery({ queryKey: ["semesters"], queryFn: () => semestersApi.list() })

  const createMut = useMutation({
    mutationFn: (data: any) => examsApi.createSchedule(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exam-schedules"] }); setModalOpen(false) },
  })

  const cancelMut = useMutation({
    mutationFn: (id: number) => examsApi.cancelSchedule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exam-schedules"] }),
  })

  const columns = [
    {
      key: "subject_code", label: "Subject",
      render: (r: any) => (
        <div>
          <div className="font-bold font-mono text-sm text-[#6366F1]">{r.subject_code}</div>
          <div className="text-xs text-[#94A3B8]">{r.subject_name}</div>
        </div>
      ),
    },
    { key: "department_name", label: "Department" },
    {
      key: "exam_type", label: "Exam",
      render: (r: any) => (
        <StatusBadge status={TYPE_COLORS[r.exam_type] || "default"} label={r.exam_type.toUpperCase()} />
      ),
    },
    {
      key: "exam_date", label: "Date",
      render: (r: any) => (
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} className="text-[#94A3B8]" />
          <span className="text-sm">{r.exam_date ? new Date(r.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
        </div>
      ),
    },
    {
      key: "time", label: "Time",
      render: (r: any) => r.start_time ? (
        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <Clock size={11} /> {r.start_time} – {r.end_time || "?"}
        </div>
      ) : <span className="text-[#94A3B8]">—</span>,
    },
    { key: "venue", label: "Venue", render: (r: any) => r.venue || "—" },
    {
      key: "marks", label: "Marks",
      render: (r: any) => <span className="font-mono text-xs">{r.pass_marks}/{r.total_marks}</span>,
    },
    {
      key: "status", label: "Status",
      render: (r: any) => (
        <StatusBadge status={r.is_cancelled ? "danger" : "success"} label={r.is_cancelled ? "Cancelled" : "Scheduled"} />
      ),
    },
    {
      key: "actions", label: "",
      render: (r: any) => !r.is_cancelled && (
        <button onClick={() => cancelMut.mutate(r.id)}
          className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 transition font-medium">
          Cancel
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Exam Schedules"
        subtitle="Manage examination calendar across semesters and subjects"
        badge={`${schedules.length} scheduled`}
        actions={<Btn variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Add Schedule</Btn>}
      />

      <FilterBar
        filters={
          <>
            <SelectFilter value={semFilter} onChange={setSemFilter}
              options={semesters.map((s: any) => ({ value: String(s.id), label: `${s.program_name} - Sem ${s.semester_number}` }))} placeholder="All Semesters" />
            <SelectFilter value={examTypeFilter} onChange={setExamTypeFilter}
              options={EXAM_TYPES.map(t => ({ value: t, label: t.toUpperCase() }))} placeholder="All Types" />
          </>
        }
      />

      <DataTable columns={columns} data={schedules} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No exam schedules found." />

      <Modal open={modalOpen} title="Add Exam Schedule" onClose={() => setModalOpen(false)}>
        <form onSubmit={(e: any) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          createMut.mutate({
            semester_id: Number(fd.get("semester_id")),
            subject_id: Number(fd.get("subject_id")),
            exam_type: fd.get("exam_type"),
            exam_date: fd.get("exam_date"),
            start_time: fd.get("start_time"),
            end_time: fd.get("end_time"),
            venue: fd.get("venue"),
            total_marks: Number(fd.get("total_marks")),
            pass_marks: Number(fd.get("pass_marks")),
          })
        }} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-[#374151]">Semester *</label>
              <select name="semester_id" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                <option value="">— Select Semester —</option>
                {semesters.map((s: any) => <option key={s.id} value={s.id}>{s.program_name} - Sem {s.semester_number}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Subject ID *</label>
              <input name="subject_id" type="number" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Exam Type *</label>
              <select name="exam_type" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-[#374151]">Exam Date *</label>
              <input name="exam_date" type="date" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Start Time</label>
              <input name="start_time" type="time" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">End Time</label>
              <input name="end_time" type="time" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Venue</label>
              <input name="venue" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Total Marks</label>
              <input name="total_marks" type="number" defaultValue={100} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Pass Marks</label>
              <input name="pass_marks" type="number" defaultValue={50} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setModalOpen(false)} type="button" className="flex-1">Cancel</Btn>
            <Btn variant="primary" type="submit" isLoading={createMut.isPending} className="flex-1">Save Schedule</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
