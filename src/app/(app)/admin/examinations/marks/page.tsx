"use client"

import { useQuery } from "@tanstack/react-query"
import { examsApi, semestersApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination } from "@/components/ui/admin"
import { useState } from "react"

const EXAM_TYPES = [
  "cia1", "cia2", "cia3", "model", "semester_end", "practical", "viva", "assignment", "quiz", "project_review"
]

export default function MarksPage() {
  const [page, setPage] = useState(1)
  const [semFilter, setSemFilter] = useState("")
  const [examTypeFilter, setExamTypeFilter] = useState("")

  const { data: result, isLoading } = useQuery({
    queryKey: ["exam-marks", page, semFilter, examTypeFilter],
    queryFn: () => examsApi.listMarks({
      page, page_size: 50,
      semester_id: semFilter ? Number(semFilter) : undefined,
      exam_type: examTypeFilter || undefined,
    }),
    staleTime: 30_000,
  })

  const { data: semesters = [] } = useQuery({ queryKey: ["semesters"], queryFn: () => semestersApi.list() })

  const marks = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "student", label: "Student",
      render: (r: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{r.student_name}</div>
          <div className="text-xs text-[#94A3B8]">{r.roll_number}</div>
        </div>
      ),
    },
    { key: "program", label: "Program", render: (r: any) => <span className="font-mono text-xs">{r.program_code}</span> },
    {
      key: "subject", label: "Subject",
      render: (r: any) => (
        <div>
          <div className="font-bold text-sm text-[#6366F1] font-mono">{r.subject_code}</div>
          <div className="text-xs text-[#94A3B8] line-clamp-1">{r.subject_name}</div>
        </div>
      ),
    },
    { key: "exam_type", label: "Exam Type", render: (r: any) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1]">{r.exam_type.toUpperCase()}</span> },
    { key: "marks", label: "Marks Obtained", render: (r: any) => <span className="font-bold text-sm">{r.marks_obtained ?? "—"}</span> },
    { key: "total_marks", label: "Max Marks", render: (r: any) => <span className="text-[#64748B]">{r.total_marks ?? "—"}</span> },
    {
      key: "grade", label: "Grade",
      render: (r: any) => r.grade ? <span className="font-bold font-mono">{r.grade}</span> : <span className="text-[#94A3B8]">—</span>,
    },
    {
      key: "status", label: "Status",
      render: (r: any) => {
        if (r.is_absent) return <span className="text-xs font-bold text-orange-500">Absent</span>
        if (r.marks_obtained !== null && r.pass_marks !== null) {
          const pass = r.marks_obtained >= r.pass_marks
          return <span className={`text-xs font-bold ${pass ? "text-green-600" : "text-red-500"}`}>{pass ? "Pass" : "Fail"}</span>
        }
        return <span className="text-[#94A3B8]">—</span>
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Exam Marks Directory" subtitle="View and search all examination marks" badge={`${total} records`} />

      <FilterBar
        filters={
          <>
            <SelectFilter value={semFilter} onChange={(v) => { setSemFilter(v); setPage(1) }} options={semesters.map((s: any) => ({ value: String(s.id), label: `${s.program_name} - Sem ${s.semester_number}` }))} placeholder="All Semesters" />
            <SelectFilter value={examTypeFilter} onChange={(v) => { setExamTypeFilter(v); setPage(1) }} options={EXAM_TYPES.map(t => ({ value: t, label: t.toUpperCase() }))} placeholder="All Exam Types" />
          </>
        }
      />

      <DataTable columns={columns} data={marks} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No marks found." />
      <Pagination page={page} pageSize={50} total={total} onChange={setPage} />
    </div>
  )
}
