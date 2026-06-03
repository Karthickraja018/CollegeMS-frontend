"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield, Search, ArrowLeft, ChevronRight,
  CheckCircle, AlertCircle, Users, Activity, TrendingUp
} from "lucide-react"
import { useHodList, type HodMetric } from "@/queries/principal/usePrincipalIntelligence"

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

function HodRow({ hod, index }: { hod: HodMetric; index: number }) {
  const badge = GRADE_BADGE[hod.hod_color] ?? GRADE_BADGE.gray
  const score = hod.dept_health_score ?? 0
  const compliance = hod.faculty_compliance_rate ?? 0

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group"
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center font-bold text-purple-600 text-sm flex-shrink-0">
            {hod.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{hod.full_name}</p>
            <p className="text-xs text-slate-400">{hod.employee_id || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-bold text-slate-800">{hod.dept_name}</p>
        <p className="text-xs text-slate-400">{hod.dept_code}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{
              width: `${Math.min(100, score)}%`,
              background: score >= 80 ? "#10B981" : score >= 65 ? "#4F46E5" : score >= 50 ? "#F59E0B" : "#EF4444"
            }} />
          </div>
          <span className="text-sm font-black" style={{ color: score >= 80 ? "#10B981" : score >= 65 ? "#4F46E5" : score >= 50 ? "#F59E0B" : "#EF4444" }}>
            {score ? score.toFixed(0) : "—"}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`text-sm font-bold ${compliance >= 85 ? 'text-emerald-600' : compliance >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
          {compliance ? `${compliance}%` : "—"}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`text-sm font-bold ${hod.student_risk_count > 10 ? 'text-rose-600' : hod.student_risk_count > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {hod.student_risk_count}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{hod.faculty_count} faculty</span>
          <span className="text-slate-300">·</span>
          <span>{hod.student_count} students</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.text }}>
          {hod.hod_grade}
        </span>
      </td>
      <td className="px-4 py-4">
        <Link href={`/principal/hod/${hod.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
          View Profile <ChevronRight size={12} />
        </Link>
      </td>
    </motion.tr>
  )
}

export default function HodListPage() {
  const { data: hods, isLoading } = useHodList()
  const [search, setSearch] = useState("")
  const [filterGrade, setFilterGrade] = useState("all")

  const filtered = (hods || []).filter(h => {
    const matchSearch = !search ||
      h.full_name.toLowerCase().includes(search.toLowerCase()) ||
      h.dept_name.toLowerCase().includes(search.toLowerCase())
    const matchGrade = filterGrade === "all" || h.hod_color === filterGrade
    return matchSearch && matchGrade
  })

  const excellentCount = (hods || []).filter(h => h.hod_color === "green").length
  const needsAttentionCount = (hods || []).filter(h => ["amber", "red"].includes(h.hod_color)).length
  const avgHealth = hods && hods.length
    ? (hods.reduce((sum, h) => sum + (h.dept_health_score ?? 0), 0) / hods.length).toFixed(1)
    : "—"

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">HOD Performance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department leadership intelligence · All HODs</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total HODs", value: hods?.length ?? "—", color: "#8B5CF6", icon: Shield },
          { label: "Excellent", value: excellentCount || "—", color: "#10B981", icon: CheckCircle },
          { label: "Needs Attention", value: needsAttentionCount || "—", color: "#F59E0B", icon: AlertCircle },
          { label: "Avg Health Score", value: avgHealth, color: "#4F46E5", icon: Activity },
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
            placeholder="Search HOD name or department..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">All Grades</option>
          <option value="green">Excellent</option>
          <option value="blue">Good</option>
          <option value="amber">Needs Attention</option>
          <option value="red">Critical</option>
        </select>
      </div>

      {/* HOD Table */}
      <BentoCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">
            {filtered.length} HOD{filtered.length !== 1 ? "s" : ""}
            {search || filterGrade !== "all" ? " (filtered)" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["HOD", "Department", "Dept Health Score", "Faculty Compliance", "At-Risk Students", "Team Size", "Grade", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-slate-400">No HODs match your filters</td></tr>
              ) : (
                filtered.map((h, i) => <HodRow key={h.id} hod={h} index={i} />)
              )}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  )
}
