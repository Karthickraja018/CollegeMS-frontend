"use client"

import { useQuery } from "@tanstack/react-query"
import { studentsAdminApi, departmentsApi } from "@/services/admin"
import {
  PageHeader, FilterBar, StatusBadge, RiskBadge, SelectFilter, DataTable, LoadingPage,
} from "@/components/ui/admin"
import {
  AlertTriangle, Users, TrendingDown, Activity, ArrowRight,
} from "lucide-react"
import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import Link from "next/link"
import { motion } from "framer-motion"

const RISK_LEVELS = [
  { value: "", label: "All Risk Levels" },
  { value: "critical", label: "Critical (80+)" },
  { value: "high", label: "High (60–80)" },
  { value: "medium", label: "Medium (40–60)" },
]

const riskColors = {
  critical: { bg: "bg-red-500", light: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  high: { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  medium: { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
}

export default function AtRiskPage() {
  const [deptFilter, setDeptFilter] = useState("")
  const [riskFilter, setRiskFilter] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["at-risk-dashboard", deptFilter, riskFilter],
    queryFn: () => studentsAdminApi.getAtRiskDashboard({
      department_id: deptFilter ? Number(deptFilter) : undefined,
      risk_level: riskFilter || undefined,
    }),
    staleTime: 60_000,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list({ is_active: true }),
  })

  const agg = data?.aggregates || {}
  const students = data?.students || []
  const byDept = data?.by_department || []

  const riskCards = [
    { key: "critical_count", label: "Critical", desc: "Risk score ≥ 80", color: riskColors.critical },
    { key: "high_count", label: "High", desc: "Risk score 60–80", color: riskColors.high },
    { key: "medium_count", label: "Medium", desc: "Risk score 40–60", color: riskColors.medium },
    { key: "low_count", label: "Low Risk", desc: "Risk score < 40", color: riskColors.low },
  ]

  const columns = [
    {
      key: "name", label: "Student",
      render: (row: any) => (
        <Link href={`/admin/students/${row.id}`} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#6366F1] text-xs font-bold flex-shrink-0">
            {row.name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#0F172A] text-sm group-hover:text-[#6366F1] transition-colors">{row.name}</div>
            <div className="text-xs font-mono text-[#94A3B8]">{row.roll_number}</div>
          </div>
        </Link>
      ),
    },
    { key: "department_name", label: "Department" },
    { key: "program_name", label: "Program" },
    { key: "batch", label: "Batch", render: (row: any) => <span className="font-mono text-xs">{row.batch}</span> },
    { key: "current_semester", label: "Sem", render: (row: any) => <span className="font-semibold">{row.current_semester}</span> },
    {
      key: "avg_attendance", label: "Attendance",
      render: (row: any) => (
        <span className={Number(row.avg_attendance) < 75 ? "text-red-600 font-bold" : "text-emerald-600 font-semibold"}>
          {row.avg_attendance || "—"}%
        </span>
      ),
    },
    { key: "arrear_count", label: "Arrears", render: (row: any) => <span className={row.arrear_count > 0 ? "text-red-600 font-bold" : "text-[#94A3B8]"}>{row.arrear_count || 0}</span> },
    { key: "risk_score", label: "Risk Score", sortable: true, render: (row: any) => <RiskBadge score={row.risk_score || 0} /> },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <Link href={`/admin/students/${row.id}`}>
          <button className="flex items-center gap-1 text-xs font-semibold text-[#6366F1] hover:underline">
            View <ArrowRight size={12} />
          </button>
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="At-Risk Students"
        subtitle="Students flagged by the AI performance agent based on attendance, marks, and historical patterns"
        badge={`${students.length} students`}
        actions={
          <div className="flex gap-2">
            <SelectFilter value={deptFilter} onChange={setDeptFilter}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))} placeholder="All Departments" />
            <SelectFilter value={riskFilter} onChange={setRiskFilter} options={RISK_LEVELS.slice(1)} placeholder="All Risk Levels" />
          </div>
        }
      />

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {riskCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl p-5 border ${card.color.light} ${card.color.border}`}
          >
            <div className={`text-3xl font-bold ${card.color.text}`}>{agg[card.key] ?? 0}</div>
            <div className={`text-sm font-semibold ${card.color.text} mt-1`}>{card.label}</div>
            <div className={`text-xs mt-0.5 opacity-70 ${card.color.text}`}>{card.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Department breakdown chart */}
      {byDept.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Risk by Department</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="critical" name="Critical" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={20} stackId="a" />
                <Bar dataKey="high" name="High" fill="#F97316" radius={[0, 0, 0, 0]} maxBarSize={20} stackId="a" />
                <Bar dataKey="medium" name="Medium" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={20} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Students table */}
      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage="No at-risk students found"
        rowKey={(r) => r.id}
      />
    </div>
  )
}
