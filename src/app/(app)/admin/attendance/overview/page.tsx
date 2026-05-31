"use client"

import { useQuery } from "@tanstack/react-query"
import { attendanceApi, departmentsApi, semestersApi } from "@/services/admin"
import { PageHeader, SelectFilter, LoadingPage } from "@/components/ui/admin"
import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts"
import { Users, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

function HeatCell({ pct }: { pct: number }) {
  const bg = pct >= 85 ? "#10B981" : pct >= 75 ? "#84CC16" : pct >= 60 ? "#F59E0B" : "#EF4444"
  return (
    <div
      className="rounded-xl p-3 text-white font-bold text-sm text-center shadow-sm"
      style={{ background: bg }}
    >
      {pct}%
    </div>
  )
}

export default function AttendanceOverviewPage() {
  const [semesterFilter, setSemesterFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")

  const params = {
    semester_id: semesterFilter ? Number(semesterFilter) : undefined,
    department_id: deptFilter ? Number(deptFilter) : undefined,
  }

  const { data: heatmap = [], isLoading: loadingHeat } = useQuery({
    queryKey: ["attendance-heatmap", semesterFilter, deptFilter],
    queryFn: () => attendanceApi.getDeptHeatmap(params),
    staleTime: 60_000,
  })

  const { data: trends = [], isLoading: loadingTrend } = useQuery({
    queryKey: ["attendance-trends", semesterFilter, deptFilter],
    queryFn: () => attendanceApi.getTrends(params),
    staleTime: 60_000,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list({ is_active: true }),
  })

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: () => semestersApi.list({ status: "ongoing" }),
  })

  const totalStudents = heatmap.reduce((acc: number, d: any) => acc + (d.total_students || 0), 0)
  const totalDefaulters = heatmap.reduce((acc: number, d: any) => acc + (d.defaulters || 0), 0)
  const avgPct = heatmap.length
    ? (heatmap.reduce((acc: number, d: any) => acc + Number(d.avg_pct || 0), 0) / heatmap.length).toFixed(1)
    : "—"
  const aboveThreshold = heatmap.filter((d: any) => d.avg_pct >= 75).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance Overview"
        subtitle="Real-time attendance monitoring across departments and semesters"
        actions={
          <div className="flex gap-2">
            <SelectFilter value={semesterFilter} onChange={setSemesterFilter}
              options={semesters.map((s: any) => ({ value: String(s.id), label: `${s.program_name} - Sem ${s.semester_number}` }))}
              placeholder="All Semesters" />
            <SelectFilter value={deptFilter} onChange={setDeptFilter}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))}
              placeholder="All Departments" />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: totalStudents, icon: Users, color: "#6366F1" },
          { label: "Avg Attendance", value: `${avgPct}%`, icon: CheckCircle, color: "#10B981" },
          { label: "Defaulters (<75%)", value: totalDefaulters, icon: TrendingDown, color: "#EF4444" },
          { label: "Depts ≥75%", value: aboveThreshold, icon: AlertTriangle, color: "#F59E0B" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${card.color}18` }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0F172A]">{card.value}</div>
              <div className="text-xs text-[#94A3B8] font-medium">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Department Heatmap */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Department Attendance Heatmap</h3>
          <Link href="/admin/attendance/defaulters" className="text-xs font-semibold text-[#6366F1] hover:underline">
            View Defaulters →
          </Link>
        </div>
        {loadingHeat ? (
          <div className="text-sm text-[#94A3B8] py-4">Loading…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {heatmap.map((dept: any) => (
              <div key={dept.department_id} className="flex flex-col gap-1">
                <HeatCell pct={Number(dept.avg_pct)} />
                <div className="text-xs font-semibold text-[#334155] text-center truncate">{dept.dept_code}</div>
                <div className="text-xs text-[#94A3B8] text-center">{dept.defaulters} defaulters</div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#F1F5F9]">
          {[
            { color: "#EF4444", label: "< 60%" },
            { color: "#F59E0B", label: "60-75%" },
            { color: "#84CC16", label: "75-85%" },
            { color: "#10B981", label: "≥ 85%" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: l.color }} />
              <span className="text-xs text-[#64748B]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department bar chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Attendance by Department</h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmap} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dept_code" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Avg Attendance"]} />
              <Bar dataKey="avg_pct" name="Avg Attendance" radius={[6, 6, 0, 0]} maxBarSize={36} fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend line */}
      {trends.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Monthly Attendance Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance_pct" stroke="#6366F1" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366F1" }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
