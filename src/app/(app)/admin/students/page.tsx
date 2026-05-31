"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { studentsAdminApi, departmentsApi, programsApi } from "@/services/admin"
import {
  PageHeader, DataTable, FilterBar, StatusBadge, RiskBadge, Btn,
  SelectFilter, Pagination, ConfirmDialog,
} from "@/components/ui/admin"
import {
  GraduationCap, AlertTriangle, TrendingUp, DollarSign,
  Eye, ArrowUpRight, Download,
} from "lucide-react"
import { useState } from "react"
import { useMutation as useM, useQueryClient as useQC } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"

const STUDENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "detained", label: "Detained" },
  { value: "arrear", label: "Arrear" },
  { value: "transferred_out", label: "Transferred" },
  { value: "passed_out", label: "Passed Out" },
  { value: "discontinued", label: "Discontinued" },
]
const RISK_LEVELS = [
  { value: "critical", label: "Critical (80+)" },
  { value: "high", label: "High (60-80)" },
  { value: "medium", label: "Medium (40-60)" },
  { value: "low", label: "Low (<40)" },
]

export default function StudentsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [riskFilter, setRiskFilter] = useState("")
  const [semFilter, setSemFilter] = useState("")
  const [promoteTarget, setPromoteTarget] = useState<any>(null)

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-students", page, search, deptFilter, statusFilter, riskFilter, semFilter],
    queryFn: () => studentsAdminApi.list({
      page, page_size: 25,
      search: search || undefined,
      department_id: deptFilter ? Number(deptFilter) : undefined,
      status: statusFilter || undefined,
      risk_level: riskFilter || undefined,
      current_semester: semFilter ? Number(semFilter) : undefined,
    }),
    staleTime: 30_000,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list({ is_active: true }),
  })

  const promoteMut = useMutation({
    mutationFn: (id: number) => studentsAdminApi.promote(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-students"] }); setPromoteTarget(null) },
  })

  const students = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "name", label: "Student", sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#6366F1] text-xs font-bold flex-shrink-0">
            {row.name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#0F172A] text-sm">{row.name}</div>
            <div className="text-xs font-mono text-[#94A3B8]">{row.roll_number}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department_name", label: "Department",
      render: (row: any) => (
        <div>
          <div className="text-sm text-[#334155]">{row.department_name}</div>
          <div className="text-xs text-[#94A3B8]">{row.program_code} · Sem {row.current_semester}</div>
        </div>
      ),
    },
    { key: "batch", label: "Batch", render: (row: any) => <span className="font-mono text-xs">{row.batch}</span> },
    {
      key: "avg_attendance", label: "Attendance",
      render: (row: any) => {
        const pct = row.avg_attendance
        if (pct === null || pct === undefined) return <span className="text-[#CBD5E1] text-xs">—</span>
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: pct >= 75 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444",
                }}
              />
            </div>
            <span className="text-xs font-semibold">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: "risk_score", label: "Risk",
      render: (row: any) => <RiskBadge score={row.risk_score || 0} />,
    },
    {
      key: "fee_status", label: "Fee",
      render: (row: any) => row.fee_status ? <StatusBadge value={row.fee_status} /> : <span className="text-[#CBD5E1] text-xs">—</span>,
    },
    { key: "status", label: "Status", render: (row: any) => <StatusBadge value={row.status} /> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant="secondary" icon={ArrowUpRight} onClick={() => setPromoteTarget(row)}>Promote</Btn>
          <Btn size="sm" variant="secondary" icon={Eye} onClick={() => router.push(`/admin/students/${row.id}`)}>
            View
          </Btn>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage student records, lifecycle, and academic health"
        badge={`${total} students`}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/students/at-risk">
              <Btn variant="secondary" icon={AlertTriangle}>At-Risk ({result?.data?.filter((s: any) => s.risk_score >= 60).length || 0})</Btn>
            </Link>
            <Btn variant="secondary" icon={Download}>Export</Btn>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active", value: total, color: "#10B981", icon: GraduationCap },
          { label: "At Risk", value: result?.data?.filter((s: any) => s.risk_score >= 60).length || 0, color: "#EF4444", icon: AlertTriangle },
          { label: "Avg Attendance", value: `${(result?.data?.reduce((acc: number, s: any) => acc + (s.avg_attendance || 0), 0) / Math.max(result?.data?.length || 1, 1)).toFixed(1)}%`, color: "#6366F1", icon: TrendingUp },
          { label: "Fee Overdue", value: result?.data?.filter((s: any) => s.fee_status === "overdue").length || 0, color: "#F59E0B", icon: DollarSign },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0F172A]">{item.value}</div>
              <div className="text-xs text-[#94A3B8] font-medium">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search by name, roll number, or email…"
        filters={
          <>
            <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))} placeholder="All Departments" />
            <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }}
              options={STUDENT_STATUSES} placeholder="All Statuses" />
            <SelectFilter value={riskFilter} onChange={(v) => { setRiskFilter(v); setPage(1) }}
              options={RISK_LEVELS} placeholder="All Risk Levels" />
            <SelectFilter value={semFilter} onChange={(v) => { setSemFilter(v); setPage(1) }}
              options={[1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Semester ${n}` }))} placeholder="All Semesters" />
          </>
        }
      />

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage="No students found matching your filters"
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/students/${r.id}`)}
      />
      <Pagination page={page} pageSize={25} total={total} onChange={setPage} />

      {/* Promote Confirm */}
      <ConfirmDialog
        open={!!promoteTarget}
        title="Promote Student?"
        message={`Promote ${promoteTarget?.name} from Semester ${promoteTarget?.current_semester} to ${(promoteTarget?.current_semester || 0) + 1}?`}
        confirmLabel="Promote"
        onConfirm={() => promoteMut.mutate(promoteTarget.id)}
        onCancel={() => setPromoteTarget(null)}
      />
    </div>
  )
}
