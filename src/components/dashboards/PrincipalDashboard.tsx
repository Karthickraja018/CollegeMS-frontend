"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, Building2, Award, Bot,
  TrendingUp, Users, Activity,
  Sparkles, GraduationCap, Zap, CheckCircle, Clock,
  ChevronRight, ArrowRight, UserCheck, Star, AlertCircle,
  Shield, BookOpen, Search
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, RadialBarChart, RadialBar
} from "recharts"

// ── Reuse EXISTING hooks ──────────────────────────────────────────────────────
import {
  useDashboardKPIs,
  useDashboardInsights,
  useDepartmentRankings,
  useAttendanceTrend,
  useDeptPerformance,
} from "@/queries/dashboard/useDashboard"

// ── NEW Principal Intelligence hooks ─────────────────────────────────────────
import {
  useFacultyList,
  useFacultyCompliance,
  useFacultyRankings,
  useHodList,
  useHodRankings,
  type FacultyMetric,
  type HodMetric,
} from "@/queries/principal/usePrincipalIntelligence"

import { useUserStore } from "@/store"
import { api } from "@/services/api"

// ── Color Maps ────────────────────────────────────────────────────────────────

const AHS_BADGE: Record<string, { bg: string; text: string }> = {
  green: { bg: "#ECFDF5", text: "#059669" },
  blue: { bg: "#EEF2FF", text: "#4F46E5" },
  amber: { bg: "#FFFBEB", text: "#D97706" },
  red: { bg: "#FEF2F2", text: "#DC2626" },
  gray: { bg: "#F1F5F9", text: "#64748B" },
}

const GRADE_BADGE = AHS_BADGE

// ── Shared UI Primitives ──────────────────────────────────────────────────────

function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function KPIStat({
  label, value, icon: Icon, color, trend, loading
}: {
  label: string; value: string | number; icon: React.ElementType
  color: string; trend?: number; loading?: boolean
}) {
  return (
    <BentoCard className="p-5">
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-8 bg-slate-100 rounded w-3/4" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-slate-900">{value}</span>
            {trend !== undefined && (
              <span className={`text-xs font-bold mb-1 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </>
      )}
    </BentoCard>
  )
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{typeof p.value === 'number' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: Executive Dashboard
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveDashboardTab() {
  const { data: kpis, isLoading } = useDashboardKPIs()
  const { data: trend, isLoading: trendLoading } = useAttendanceTrend(6)
  const { data: rankings, isLoading: rankLoading } = useDepartmentRankings()

  const ahs = kpis?.academic_health
  const ahsScore = typeof ahs === 'object' ? ahs.score : (ahs ?? 0)

  return (
    <div className="space-y-6">
      {/* AHS + KPIs row */}
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
        {/* AHS Circle */}
        <BentoCard className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
          {isLoading ? (
            <div className="w-32 h-32 rounded-full bg-slate-100 animate-pulse" />
          ) : (
            <>
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-white border-8 border-indigo-100 shadow-inner mb-4">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="52" fill="transparent" stroke="#E0E7FF" strokeWidth="8" />
                  <circle cx="64" cy="64" r="52" fill="transparent" stroke="#4F46E5" strokeWidth="8"
                    strokeDasharray="326.7"
                    strokeDashoffset={326.7 - (326.7 * ahsScore) / 100}
                    strokeLinecap="round" />
                </svg>
                <span className="text-3xl font-black text-indigo-600">{ahsScore}</span>
              </div>
              <div className="text-sm font-bold text-slate-900">Academic Health Score</div>
              {typeof ahs === 'object' && (
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold`}
                  style={GRADE_BADGE[ahs.color] ? { background: GRADE_BADGE[ahs.color].bg, color: GRADE_BADGE[ahs.color].text } : {}}>
                  {ahs.grade}
                </span>
              )}
            </>
          )}
        </BentoCard>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KPIStat label="Total Students" value={kpis?.total_students ?? "—"} icon={GraduationCap} color="#4F46E5" loading={isLoading} />
          <KPIStat label="Avg Attendance" value={kpis?.avg_attendance != null ? `${kpis.avg_attendance}%` : "—"} icon={Activity} color="#10B981" loading={isLoading} trend={kpis?.trends?.attendance} />
          <KPIStat label="Pass Rate" value={kpis?.pass_percentage != null ? `${kpis.pass_percentage}%` : "—"} icon={TrendingUp} color="#8B5CF6" loading={isLoading} trend={kpis?.trends?.pass_percentage} />
          <KPIStat label="At-Risk Students" value={kpis?.at_risk_students ?? "—"} icon={AlertCircle} color="#EF4444" loading={isLoading} />
          <KPIStat label="Total Faculty" value={kpis?.total_faculty ?? "—"} icon={Users} color="#F59E0B" loading={isLoading} />
          <KPIStat label="Departments" value={kpis?.total_departments ?? "—"} icon={Building2} color="#14B8A6" loading={isLoading} />
        </div>
      </div>

      {/* Attendance Trend Chart */}
      <BentoCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Attendance Trend</p>
            <p className="text-xs text-slate-400">Last 6 months — institution-wide</p>
          </div>
        </div>
        {trendLoading ? (
          <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
        ) : !trend || trend.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No trend data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<TrendTooltip />} />
              <Area type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={2} fill="url(#attGrad)" name="Attendance" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </BentoCard>

      {/* Department Rankings */}
      <BentoCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Department Health Rankings</p>
          <Link href="/intelligence/departments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Deep Analysis <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Rank", "Department", "AHS Score", "Attendance", "Pass Rate", "At-Risk"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankLoading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                ))}</tr>
              )) : !rankings || rankings.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">No department data available</td></tr>
              ) : rankings.map((dept, i) => {
                const badge = GRADE_BADGE[dept.ahs_color] ?? GRADE_BADGE.blue
                return (
                  <motion.tr key={dept.department_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">#{dept.rank}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{dept.department_name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.text }}>
                        {dept.ahs_score} · {dept.ahs_grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{dept.attendance_rate}%</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{dept.pass_rate}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dept.at_risk_count > 10 ? "bg-rose-50 text-rose-600" : dept.at_risk_count > 5 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {dept.at_risk_count}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: Department Intelligence (enhanced)
// ══════════════════════════════════════════════════════════════════════════════

function DepartmentIntelligenceTab() {
  const { data: rankings, isLoading } = useDepartmentRankings()
  const { data: deptPerf } = useDeptPerformance()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Department Health Matrix</h2>
        <Link href="/intelligence/departments"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Deep Analysis <ChevronRight size={14} />
        </Link>
      </div>

      {deptPerf && deptPerf.length > 0 && (
        <BentoCard className="p-5">
          <p className="text-sm font-bold text-slate-900 mb-4">Attendance by Department</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptPerf} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip formatter={(v: any) => [`${v}%`]} />
              <Bar dataKey="attendance" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {(deptPerf || []).map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#4F46E5" : i === 1 ? "#8B5CF6" : i === 2 ? "#10B981" : "#F59E0B"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>
      )}

      <BentoCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Rank", "Department", "AHS Score", "Attendance", "Pass Rate", "At-Risk Students", ""].map(h => (
                  <th key={h} className="py-4 px-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="py-4 px-5"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              )) : !rankings || rankings.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">No departments available</td></tr>
              ) : rankings.map((dept, i) => {
                const badge = GRADE_BADGE[dept.ahs_color] ?? GRADE_BADGE.blue
                return (
                  <tr key={dept.department_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">#{i + 1}</span>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">{dept.department_name}</td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.text }}>
                        {dept.ahs_score} — {dept.ahs_grade}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-700">{dept.attendance_rate}%</td>
                    <td className="py-4 px-5 font-medium text-slate-700">{dept.pass_rate}%</td>
                    <td className="py-4 px-5">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${dept.at_risk_count > 10 ? 'bg-rose-100 text-rose-700' : dept.at_risk_count > 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {dept.at_risk_count} students
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <Link href="/intelligence/departments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 whitespace-nowrap">
                        View <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </BentoCard>

      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-900">Full Department Analytics Available</p>
          <p className="text-xs text-indigo-600">Subject-wise analysis, faculty performance, risk distribution per department</p>
        </div>
        <Link href="/intelligence/departments" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Open →
        </Link>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: Faculty Intelligence (NEW — replaces Student Risk Center)
// ══════════════════════════════════════════════════════════════════════════════

function FacultyCard({ faculty }: { faculty: FacultyMetric }) {
  const badge = GRADE_BADGE[faculty.performance_color] ?? GRADE_BADGE.blue
  const passRate = faculty.live_pass_rate ?? faculty.metric_pass_rate ?? 0
  const attSub = faculty.attendance_submission_pct ?? 0
  const marksSub = faculty.marks_submission_pct ?? 0

  return (
    <Link href={`/principal/faculty/${faculty.id}`}
      className="block hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
          {faculty.full_name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{faculty.full_name}</p>
          <p className="text-xs text-slate-400">{faculty.dept_name} · {faculty.designation || faculty.role}</p>
        </div>

        {/* Metrics */}
        <div className="hidden md:flex items-center gap-6 text-xs">
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">Pass Rate</p>
            <p className={`font-bold ${passRate >= 70 ? 'text-emerald-600' : passRate >= 55 ? 'text-amber-600' : 'text-rose-600'}`}>
              {passRate ? `${passRate}%` : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">Att. Sub</p>
            <p className={`font-bold ${attSub >= 85 ? 'text-emerald-600' : attSub >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
              {attSub ? `${attSub}%` : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">Marks Sub</p>
            <p className={`font-bold ${marksSub >= 85 ? 'text-emerald-600' : marksSub >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
              {marksSub ? `${marksSub}%` : '—'}
            </p>
          </div>
        </div>

        {/* Grade badge */}
        <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
          style={{ background: badge.bg, color: badge.text }}>
          {faculty.performance_grade}
        </span>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
      </div>
    </Link>
  )
}

function FacultyIntelligenceTab() {
  const { data: faculty, isLoading } = useFacultyList()
  const { data: compliance } = useFacultyCompliance()
  const { data: rankings } = useFacultyRankings()

  const excellentCount = (faculty || []).filter(f => f.performance_color === 'green').length
  const needsAttentionCount = (faculty || []).filter(f => ['amber', 'red'].includes(f.performance_color)).length
  const nonCompliantCount = (compliance as any[])?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Faculty", value: faculty?.length ?? "—", color: "#4F46E5", bg: "bg-indigo-50 border-indigo-100" },
          { label: "Top Performers", value: excellentCount || "—", color: "#10B981", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Needs Attention", value: needsAttentionCount || "—", color: "#F59E0B", bg: "bg-amber-50 border-amber-100" },
          { label: "Non-Compliant", value: nonCompliantCount || "—", color: "#EF4444", bg: "bg-rose-50 border-rose-100" },
        ].map(c => (
          <BentoCard key={c.label} className={`p-5 border ${c.bg}`}>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-black mb-1" style={{ color: c.color }}>{c.value}</p>
                <p className="text-xs font-semibold text-slate-500">{c.label}</p>
              </>
            )}
          </BentoCard>
        ))}
      </div>

      {/* Non-compliant alerts */}
      {(compliance as any[])?.length > 0 && (
        <BentoCard className="border-amber-200 bg-amber-50">
          <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Faculty Compliance Alerts</p>
            <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {(compliance as any[]).length} flagged
            </span>
          </div>
          <div className="divide-y divide-amber-100">
            {(compliance as any[]).slice(0, 3).map((f: any) => (
              <Link key={f.id} href={`/principal/faculty/${f.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-amber-100/40 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                  {f.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{f.full_name}</p>
                  <p className="text-xs text-amber-700 truncate">{f.issues?.slice(0, 1).join(', ')}</p>
                </div>
                <span className="text-xs text-slate-400">{f.dept_name}</span>
                <ChevronRight size={12} className="text-amber-400 group-hover:text-amber-600" />
              </Link>
            ))}
          </div>
          {(compliance as any[]).length > 3 && (
            <div className="px-5 py-3 border-t border-amber-100">
              <Link href="/principal/faculty" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
                View all {(compliance as any[]).length} compliance issues →
              </Link>
            </div>
          )}
        </BentoCard>
      )}

      {/* Faculty List */}
      <BentoCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Faculty Performance Overview</p>
            <p className="text-xs text-slate-400">Click any faculty to view full profile & student outcomes</p>
          </div>
          <Link href="/principal/faculty" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            All Faculty <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : !faculty || faculty.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No faculty data available</div>
        ) : (
          <div>
            {faculty.slice(0, 8).map(f => <FacultyCard key={f.id} faculty={f} />)}
          </div>
        )}
        {(faculty?.length ?? 0) > 8 && (
          <div className="px-5 py-4 border-t border-slate-100 flex justify-center">
            <Link href="/principal/faculty" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View all {faculty!.length} faculty members →
            </Link>
          </div>
        )}
      </BentoCard>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4: HOD Intelligence (NEW)
// ══════════════════════════════════════════════════════════════════════════════

function HodCard({ hod }: { hod: HodMetric }) {
  const badge = GRADE_BADGE[hod.hod_color] ?? GRADE_BADGE.gray
  const score = hod.dept_health_score ?? 0

  return (
    <Link href={`/principal/hod/${hod.id}`}
      className="block hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center font-bold text-purple-600 text-sm flex-shrink-0">
          {hod.full_name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{hod.full_name}</p>
          <p className="text-xs text-slate-400">{hod.dept_name} · HOD</p>
        </div>

        {/* Score ring */}
        <div className="hidden md:flex items-center gap-6 text-xs">
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">Dept Health</p>
            <p className={`font-black text-base ${score >= 80 ? 'text-emerald-600' : score >= 65 ? 'text-blue-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {score ? score.toFixed(0) : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">Compliance</p>
            <p className={`font-bold ${(hod.faculty_compliance_rate ?? 0) >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {hod.faculty_compliance_rate ? `${hod.faculty_compliance_rate}%` : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">At-Risk</p>
            <p className={`font-bold ${hod.student_risk_count > 10 ? 'text-rose-600' : 'text-slate-700'}`}>
              {hod.student_risk_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 mb-0.5">Faculty</p>
            <p className="font-bold text-slate-700">{hod.faculty_count}</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
          style={{ background: badge.bg, color: badge.text }}>
          {hod.hod_grade}
        </span>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
      </div>
    </Link>
  )
}

function HodIntelligenceTab() {
  const { data: hods, isLoading } = useHodList()
  const { data: rankings } = useHodRankings()

  const excellentHods = (hods || []).filter(h => h.hod_color === 'green').length
  const needsAttentionHods = (hods || []).filter(h => ['amber', 'red'].includes(h.hod_color)).length

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total HODs", value: hods?.length ?? "—", color: "#8B5CF6", bg: "bg-purple-50 border-purple-100" },
          { label: "Excellent Depts", value: excellentHods || "—", color: "#10B981", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Needs Attention", value: needsAttentionHods || "—", color: "#F59E0B", bg: "bg-amber-50 border-amber-100" },
          { label: "Avg Health Score", value: hods && hods.length ? `${(hods.reduce((sum, h) => sum + (h.dept_health_score ?? 0), 0) / hods.length).toFixed(0)}` : "—", color: "#4F46E5", bg: "bg-indigo-50 border-indigo-100" },
        ].map(c => (
          <BentoCard key={c.label} className={`p-5 border ${c.bg}`}>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-black mb-1" style={{ color: c.color }}>{c.value}</p>
                <p className="text-xs font-semibold text-slate-500">{c.label}</p>
              </>
            )}
          </BentoCard>
        ))}
      </div>

      {/* HOD Rankings Chart */}
      {rankings && rankings.length > 0 && (
        <BentoCard className="p-5">
          <p className="text-sm font-bold text-slate-900 mb-4">Department Health Score by HOD</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={rankings} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="dept_code" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip formatter={(v: any) => [`${v}`]} labelFormatter={(label) => `Dept: ${label}`} />
              <Bar dataKey="dept_health_score" name="Health Score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {(rankings as any[]).map((h: any, i: number) => (
                  <Cell key={i} fill={
                    h.dept_health_score >= 85 ? "#10B981" :
                    h.dept_health_score >= 70 ? "#4F46E5" :
                    h.dept_health_score >= 55 ? "#F59E0B" : "#EF4444"
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>
      )}

      {/* HOD List */}
      <BentoCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">HOD Performance Overview</p>
            <p className="text-xs text-slate-400">Click any HOD to view full profile, faculty compliance & student risks</p>
          </div>
          <Link href="/principal/hod" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            All HODs <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : !hods || hods.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No HOD data available</div>
        ) : (
          <div>
            {hods.map(h => <HodCard key={h.id} hod={h} />)}
          </div>
        )}
      </BentoCard>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5: Accreditation
// ══════════════════════════════════════════════════════════════════════════════

function AccreditationTab() {
  const { data: kpis, isLoading } = useDashboardKPIs()

  const attendance = kpis?.avg_attendance ?? 0
  const passRate = kpis?.pass_percentage ?? 0
  const atRisk = kpis?.at_risk_students ?? 0
  const total = kpis?.total_students ?? 1
  const riskRatio = 1 - (atRisk / total)

  const naacReadiness = Math.min(100, Math.round(attendance * 0.40 + passRate * 0.40 + riskRatio * 100 * 0.20))
  const nbaReadiness = Math.min(100, Math.round(attendance * 0.35 + passRate * 0.50 + riskRatio * 100 * 0.15))
  const documentation = 76

  const metrics = [
    { label: "NAAC Readiness", value: naacReadiness, color: "#4F46E5", criteria: "Student Performance, Faculty, Infrastructure" },
    { label: "NBA Readiness", value: nbaReadiness, color: "#8B5CF6", criteria: "CO Attainment, PO Mapping, Attendance" },
    { label: "Documentation", value: documentation, color: "#10B981", criteria: "Reports, Forms, Evidence Records" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metrics.map(m => (
          <BentoCard key={m.label} className="p-6 text-center">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
              </div>
            ) : (
              <>
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="33" fill="transparent" stroke="#F1F5F9" strokeWidth="7" />
                    <circle cx="40" cy="40" r="33" fill="transparent" stroke={m.color} strokeWidth="7"
                      strokeDasharray="207.3"
                      strokeDashoffset={207.3 - (207.3 * m.value) / 100}
                      strokeLinecap="round" />
                  </svg>
                  <span className="text-xl font-black" style={{ color: m.color }}>{m.value}%</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{m.label}</h3>
                <p className="text-xs text-slate-400">{m.criteria}</p>
              </>
            )}
          </BentoCard>
        ))}
      </div>

      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-900">Full Accreditation Reports Available</p>
          <p className="text-xs text-indigo-600">Generate NAAC/NBA reports, download evidence packs</p>
        </div>
        <Link href="/accreditation" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Open Reports →
        </Link>
      </div>

      <BentoCard className="p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Readiness Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: "Student Performance (Attendance)", value: Math.round(attendance), target: 75 },
            { label: "Academic Results (Pass Rate)", value: Math.round(passRate), target: 70 },
            { label: "At-Risk Management", value: Math.round(riskRatio * 100), target: 80 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className={`font-bold ${item.value >= item.target ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.value}% {item.value >= item.target ? '✓' : `(target: ${item.target}%)`}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${Math.min(100, item.value)}%`,
                  background: item.value >= item.target ? "#10B981" : "#EF4444"
                }} />
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 6: AI Executive Brief
// ══════════════════════════════════════════════════════════════════════════════

function AIBriefTab() {
  const { data: insights, isLoading } = useDashboardInsights()
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.post("/principal/ai-query", { query })
      setResponse(res.data.response || "Query processed.")
    } catch {
      setResponse("Unable to process query. For full AI analysis, use the AI Copilot.")
    } finally {
      setLoading(false)
    }
  }

  const recommendations = insights?.recommendations ?? []
  const insightCards = insights?.insights ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <BentoCard className="p-5 bg-slate-900 border-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Bot size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-sm font-bold">Live Intelligence Brief</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3 relative z-10">
              {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-800 rounded animate-pulse" />)}
            </div>
          ) : insightCards.length === 0 ? (
            <p className="text-slate-400 text-sm relative z-10">Run the Performance Agent to generate insights.</p>
          ) : (
            <div className="space-y-4 relative z-10">
              {insightCards.slice(0, 3).map((ins: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${ins.type === 'critical' ? 'bg-rose-400' : ins.type === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-white">{ins.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ins.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BentoCard>

        <BentoCard className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={16} /> AI Recommendations
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : recommendations.length === 0 ? (
            <p className="text-sm text-slate-400">No recommendations available.</p>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 4).map((rec: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border text-sm ${rec.severity === 'critical' ? 'bg-rose-50 border-rose-200' : rec.severity === 'high' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className="font-bold text-slate-800 text-xs mb-1">{rec.problem}</p>
                  <p className="text-slate-600 text-xs">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </BentoCard>
      </div>

      <BentoCard className="flex flex-col p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Search className="text-slate-400" size={16} /> Principal Copilot
        </h2>
        <div className="flex-1 bg-slate-50 rounded-2xl p-5 mb-5 min-h-[220px] overflow-y-auto">
          {response ? (
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{response}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <Bot size={28} className="text-slate-300" />
              <p>Ask anything about your institution...</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {["Which dept has lowest attendance?", "How many students are at critical risk?", "Show me faculty compliance issues"].map(q => (
                  <button key={q} onClick={() => { setQuery(q) }}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleAsk()}
            placeholder="Ask about attendance, faculty, HOD performance..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button onClick={handleAsk} disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Clock size={14} className="animate-spin" /> : <Zap size={14} />}
            {loading ? "..." : "Ask"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          For full analysis, use <Link href="/chat" className="text-indigo-500 font-medium hover:underline">AI Copilot →</Link>
        </p>
      </BentoCard>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN: PrincipalDashboard
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { name: "Executive Dashboard", icon: BarChart3 },
  { name: "Department Intelligence", icon: Building2 },
  { name: "Faculty Intelligence", icon: Users },
  { name: "HOD Intelligence", icon: Shield },
  { name: "Accreditation", icon: Award },
  { name: "AI Executive Brief", icon: Bot },
]

export function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState(0)
  const user = useUserStore(s => s.user)

  const tabContent = [
    <ExecutiveDashboardTab key={0} />,
    <DepartmentIntelligenceTab key={1} />,
    <FacultyIntelligenceTab key={2} />,
    <HodIntelligenceTab key={3} />,
    <AccreditationTab key={4} />,
    <AIBriefTab key={5} />,
  ]

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Intelligence</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Welcome back, {user?.full_name?.split(" ")[0] ?? "Principal"} · Enterprise Academic Analytics
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab, i) => {
          const isActive = activeTab === i
          const Icon = tab.icon
          return (
            <button key={tab.name} onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}>
              <Icon size={15} className={isActive ? "text-indigo-200" : "text-slate-400"} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
