"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users, Search, Filter, ChevronRight, ArrowLeft,
  AlertCircle, CheckCircle, TrendingUp, BookOpen, Star
} from "lucide-react"
import { useFacultyList, useFacultyCompliance, type FacultyMetric } from "@/queries/principal/usePrincipalIntelligence"

const GRADE_BADGE: Record<string, { bg: string; text: string }> = {
  green: { bg: "#ECFDF5", text: "#059669" },
  blue: { bg: "#EEF2FF", text: "#4F46E5" },
  amber: { bg: "#FFFBEB", text: "#D97706" },
  red: { bg: "#FEF2F2", text: "#DC2626" },
  gray: { bg: "#F1F5F9", text: "#64748B" },
}

function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function FacultyRow({ faculty, index }: { faculty: FacultyMetric; index: number }) {
  const badge = GRADE_BADGE[faculty.performance_color] ?? GRADE_BADGE.gray
  const passRate = faculty.live_pass_rate ?? faculty.metric_pass_rate ?? 0
  const attSub = faculty.attendance_submission_pct ?? 0
  const marksSub = faculty.marks_submission_pct ?? 0
  const compliance = faculty.compliance_score

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group"
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
            {faculty.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{faculty.full_name}</p>
            <p className="text-xs text-slate-400">{faculty.employee_id || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-slate-700">{faculty.dept_name}</p>
        <p className="text-xs text-slate-400">{faculty.designation || faculty.role}</p>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-bold" style={{ color: passRate >= 70 ? "#10B981" : passRate >= 55 ? "#D97706" : "#EF4444" }}>
          {passRate ? `${passRate}%` : "—"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-14">Att. Sub</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, attSub)}%`,
                background: attSub >= 85 ? "#10B981" : attSub >= 70 ? "#F59E0B" : "#EF4444"
              }} />
            </div>
            <span className="text-xs font-bold text-slate-600 w-8">{attSub ? `${attSub}%` : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-14">Marks Sub</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, marksSub)}%`,
                background: marksSub >= 85 ? "#10B981" : marksSub >= 70 ? "#F59E0B" : "#EF4444"
              }} />
            </div>
            <span className="text-xs font-bold text-slate-600 w-8">{marksSub ? `${marksSub}%` : "—"}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`text-sm font-bold ${(compliance ?? 0) >= 85 ? 'text-emerald-600' : (compliance ?? 0) >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
          {compliance != null ? `${compliance}%` : "—"}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.text }}>
          {faculty.performance_grade}
        </span>
      </td>
      <td className="px-4 py-4">
        <Link href={`/principal/faculty/${faculty.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
          View Profile <ChevronRight size={12} />
        </Link>
      </td>
    </motion.tr>
  )
}

export default function FacultyListPage() {
  const { data: faculty, isLoading } = useFacultyList()
  const { data: compliance } = useFacultyCompliance()
  const [search, setSearch] = useState("")
  const [filterDept, setFilterDept] = useState("all")
  const [filterGrade, setFilterGrade] = useState("all")

  const depts = Array.from(new Set((faculty || []).map(f => f.dept_name))).sort()

  const filtered = (faculty || []).filter(f => {
    const matchSearch = !search || f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (f.employee_id || "").toLowerCase().includes(search.toLowerCase())
    const matchDept = filterDept === "all" || f.dept_name === filterDept
    const matchGrade = filterGrade === "all" || f.performance_color === filterGrade
    return matchSearch && matchDept && matchGrade
  })

  const nonCompliantCount = (compliance as any[])?.length ?? 0

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Faculty Performance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Institutional-level faculty intelligence · All departments</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Faculty", value: faculty?.length ?? "—", color: "#4F46E5", icon: Users },
          { label: "Top Performers", value: (faculty || []).filter(f => f.performance_color === "green").length || "—", color: "#10B981", icon: CheckCircle },
          { label: "Needs Attention", value: (faculty || []).filter(f => ["amber", "red"].includes(f.performance_color)).length || "—", color: "#F59E0B", icon: AlertCircle },
          { label: "Non-Compliant", value: nonCompliantCount || "—", color: "#EF4444", icon: AlertCircle },
        ].map(c => (
          <BentoCard key={c.label} className="p-5">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{c.label}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}15` }}>
                  <c.icon size={18} style={{ color: c.color }} />
                </div>
              </div>
            )}
          </BentoCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search faculty name or ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">All Departments</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">All Grades</option>
          <option value="green">Excellent</option>
          <option value="blue">Good</option>
          <option value="amber">Needs Attention</option>
          <option value="red">Critical</option>
        </select>
      </div>

      {/* Faculty Table */}
      <BentoCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">
            {filtered.length} faculty member{filtered.length !== 1 ? "s" : ""}
            {search || filterDept !== "all" || filterGrade !== "all" ? " (filtered)" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Faculty", "Department", "Pass Rate", "Submission Compliance", "Overall Compliance", "Grade", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-slate-400">No faculty match your filters</td></tr>
              ) : (
                filtered.map((f, i) => <FacultyRow key={f.id} faculty={f} index={i} />)
              )}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  )
}
