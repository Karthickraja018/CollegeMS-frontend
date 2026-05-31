"use client"

import { useQuery } from "@tanstack/react-query"
import { attendanceApi, departmentsApi, semestersApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, Btn } from "@/components/ui/admin"
import { Download, AlertTriangle } from "lucide-react"
import { useState } from "react"

export default function AttendanceDefaultersPage() {
  const [page, setPage] = useState(1)
  const [deptFilter, setDeptFilter] = useState("")
  const [semFilter, setSemFilter] = useState("")
  const [threshold, setThreshold] = useState("75")

  const { data: result, isLoading } = useQuery({
    queryKey: ["attendance-defaulters", page, deptFilter, semFilter, threshold],
    queryFn: () => attendanceApi.getDefaulters({
      page,
      page_size: 30,
      department_id: deptFilter ? Number(deptFilter) : undefined,
      semester_id: semFilter ? Number(semFilter) : undefined,
      threshold: Number(threshold),
    }),
    staleTime: 30_000,
  })

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: () => departmentsApi.list({ is_active: true }) })
  const { data: semesters = [] } = useQuery({ queryKey: ["semesters"], queryFn: () => semestersApi.list() })

  const defaulters = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "student_name", label: "Student",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
            {row.name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#0F172A] text-sm">{row.name}</div>
            <div className="text-xs font-mono text-[#94A3B8]">{row.roll_number}</div>
          </div>
        </div>
      ),
    },
    { key: "department_name", label: "Department" },
    {
      key: "program_code", label: "Program",
      render: (row: any) => <span className="font-mono text-xs">{row.program_code}</span>,
    },
    { key: "batch", label: "Batch", render: (row: any) => <span className="font-mono text-xs">{row.batch}</span> },
    { key: "subject_code", label: "Subject", render: (row: any) => <span className="font-mono text-xs font-semibold">{row.subject_code}</span> },
    { key: "subject_name", label: "Subject Name" },
    {
      key: "attendance_pct", label: "Attendance",
      render: (row: any) => {
        const pct = Number(row.attendance_pct)
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct < 50 ? "#EF4444" : pct < 65 ? "#F97316" : "#F59E0B" }} />
            </div>
            <span className={`text-sm font-bold ${pct < 50 ? "text-red-600" : pct < 65 ? "text-orange-500" : "text-amber-500"}`}>
              {pct}%
            </span>
          </div>
        )
      },
    },
    {
      key: "classes", label: "Classes",
      render: (row: any) => (
        <span className="text-xs text-[#64748B]">{row.present_count}P / {row.absent_count}A / {row.total_classes}T</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Attendance Defaulters"
        subtitle={`Students below the attendance threshold`}
        badge={`${total} defaulters`}
        actions={<Btn variant="secondary" icon={Download}>Export CSV</Btn>}
      />

      {/* Risk summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "< 50% (Critical)", color: "#EF4444", count: defaulters.filter((d: any) => d.attendance_pct < 50).length },
          { label: "50–65% (High)", color: "#F97316", count: defaulters.filter((d: any) => d.attendance_pct >= 50 && d.attendance_pct < 65).length },
          { label: "65–75% (Borderline)", color: "#F59E0B", count: defaulters.filter((d: any) => d.attendance_pct >= 65 && d.attendance_pct < 75).length },
        ].map(b => (
          <div key={b.label} className="rounded-2xl p-4 flex items-center gap-3 border border-[#E2E8F0] bg-white shadow-sm">
            <AlertTriangle size={18} style={{ color: b.color }} />
            <div>
              <div className="text-xl font-bold" style={{ color: b.color }}>{b.count}</div>
              <div className="text-xs text-[#64748B]">{b.label}</div>
            </div>
          </div>
        ))}
      </div>

      <FilterBar
        filters={
          <>
            <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))} placeholder="All Departments" />
            <SelectFilter value={semFilter} onChange={(v) => { setSemFilter(v); setPage(1) }}
              options={semesters.map((s: any) => ({ value: String(s.id), label: `${s.program_name} - Sem ${s.semester_number}` }))} placeholder="All Semesters" />
            <select
              value={threshold}
              onChange={e => { setThreshold(e.target.value); setPage(1) }}
              className="text-sm px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[#374151] outline-none focus:ring-2 focus:ring-[#6366F1]/30"
            >
              <option value="75">Below 75%</option>
              <option value="65">Below 65%</option>
              <option value="50">Below 50%</option>
            </select>
          </>
        }
      />

      <DataTable columns={columns} data={defaulters} loading={isLoading} rowKey={(r) => `${r.id}-${r.subject_code}`} emptyMessage="No defaulters found with current filters." />
      <Pagination page={page} pageSize={30} total={total} onChange={setPage} />
    </div>
  )
}
