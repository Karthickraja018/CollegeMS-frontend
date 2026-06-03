"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, Mail, Phone, Briefcase, BookOpen, Calendar,
  Shield, Users, AlertTriangle, CheckCircle, TrendingUp,
  ChevronRight, Activity
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from "recharts"
import { useHodProfile } from "@/queries/principal/usePrincipalIntelligence"

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

function StatPill({ label, value, color = "#4F46E5" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-xl font-black" style={{ color }}>{value}</span>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-slate-900 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value != null ? (typeof p.value === 'number' && p.value > 5 ? `${p.value}%` : p.value) : "—"}
        </p>
      ))}
    </div>
  )
}

export default function HodProfilePage() {
  const { id } = useParams<{ id: string }>()
  const userId = parseInt(id, 10)
  const { data, isLoading, error } = useHodProfile(userId)

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-slate-100 rounded w-48 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={32} className="text-rose-400" />
        <p className="text-slate-600 font-semibold">HOD profile not found or access denied</p>
        <Link href="/principal/hod" className="text-indigo-600 hover:underline text-sm">← Back to HOD List</Link>
      </div>
    )
  }

  const { hod, performance_trend, faculty_compliance, at_risk_students, dept_kpis } = data

  // Grade from latest trend
  const latestTrend = performance_trend[performance_trend.length - 1]
  const healthScore = latestTrend?.dept_health_score ?? 0
  let grade = "No Data"; let gradeColor = "gray"
  if (healthScore >= 85) { grade = "Excellent"; gradeColor = "green" }
  else if (healthScore >= 70) { grade = "Good"; gradeColor = "blue" }
  else if (healthScore >= 55) { grade = "Needs Attention"; gradeColor = "amber" }
  else if (healthScore > 0) { grade = "Critical"; gradeColor = "red" }
  const badge = GRADE_BADGE[gradeColor]

  // Chart data
  const trendChartData = performance_trend.map(t => ({
    month: typeof t.month === 'string' ? t.month.slice(0, 7) : String(t.month),
    "Dept Health": t.dept_health_score ?? 0,
    "Faculty Compliance": t.faculty_compliance_rate ?? 0,
    "Pass Rate": t.pass_rate ?? 0,
    "Attendance": t.attendance_rate ?? 0,
  }))

  const riskChartData = performance_trend.map(t => ({
    month: typeof t.month === 'string' ? t.month.slice(0, 7) : String(t.month),
    "At-Risk": t.student_risk_count ?? 0,
    "Meetings": t.review_meetings_held ?? 0,
  }))

  const compliantFaculty = faculty_compliance.filter(f => f.is_compliant).length
  const nonCompliantFaculty = faculty_compliance.filter(f => !f.is_compliant).length

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/principal/hod"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900">{hod.full_name}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: badge.bg, color: badge.text }}>
              {grade}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Head of Department · {hod.dept_name} ({hod.dept_code})
          </p>
        </div>
      </div>

      {/* Profile + Dept KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <BentoCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl font-black text-purple-600">
              {hod.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-slate-900">{hod.full_name}</p>
              <p className="text-xs text-slate-400">{hod.employee_id || "No ID"}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{hod.email}</span>
            </div>
            {hod.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <span>{hod.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
              <span>{hod.experience_years ? `${hod.experience_years} years experience` : "Experience not recorded"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <BookOpen size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{hod.qualification || "Not specified"}</span>
            </div>
            {hod.last_login && (
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                <span>Last login: {new Date(hod.last_login).toLocaleDateString("en-IN")}</span>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Department KPIs */}
        <BentoCard className="p-6 lg:col-span-2">
          <p className="text-sm font-bold text-slate-900 mb-5">Department Overview (Live Data)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
            <StatPill label="Total Students" value={dept_kpis.total_students} color="#4F46E5" />
            <StatPill label="Avg Attendance" value={dept_kpis.avg_attendance ? `${dept_kpis.avg_attendance}%` : "—"}
              color={(dept_kpis.avg_attendance ?? 0) >= 75 ? "#10B981" : "#EF4444"} />
            <StatPill label="Pass Rate" value={dept_kpis.pass_rate ? `${dept_kpis.pass_rate}%` : "—"}
              color={(dept_kpis.pass_rate ?? 0) >= 70 ? "#10B981" : "#EF4444"} />
            <StatPill label="At-Risk" value={dept_kpis.at_risk_count} color={dept_kpis.at_risk_count > 10 ? "#EF4444" : "#F59E0B"} />
          </div>
          <div className="pt-5 border-t border-slate-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-purple-600">{healthScore ? healthScore.toFixed(0) : "—"}</p>
              <p className="text-xs text-slate-400 mt-1">Dept Health Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{compliantFaculty}/{faculty_compliance.length}</p>
              <p className="text-xs text-slate-400 mt-1">Compliant Faculty</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-indigo-600">{latestTrend?.review_meetings_held ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-1">Meetings / Month</p>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* 6-Month Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trendChartData.length > 0 && (
          <BentoCard className="p-6">
            <p className="text-sm font-bold text-slate-900 mb-4">Academic Performance Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendChartData} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Dept Health" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Faculty Compliance" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="Pass Rate" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </BentoCard>
        )}

        {riskChartData.length > 0 && (
          <BentoCard className="p-6">
            <p className="text-sm font-bold text-slate-900 mb-4">Student Risk Trend & Meetings</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={riskChartData} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="At-Risk" stroke="#EF4444" strokeWidth={2} fill="url(#riskGrad)" />
                <Line type="monotone" dataKey="Meetings" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </BentoCard>
        )}
      </div>

      {/* Faculty Compliance + At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Compliance */}
        <BentoCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Faculty Under This HOD</p>
              <p className="text-xs text-slate-400">Compliance: {compliantFaculty} compliant, {nonCompliantFaculty} flagged</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{compliantFaculty} OK</span>
              {nonCompliantFaculty > 0 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{nonCompliantFaculty} flagged</span>
              )}
            </div>
          </div>
          {faculty_compliance.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No faculty in this department</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {faculty_compliance.map((f, i) => (
                <motion.div key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-2 h-8 rounded-full flex-shrink-0 ${f.is_compliant ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{f.full_name}</p>
                    <p className="text-xs text-slate-400">{f.designation || "Faculty"}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className={`font-bold ${(f.attendance_submission_pct ?? 0) >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {f.attendance_submission_pct != null ? `Att: ${f.attendance_submission_pct}%` : "—"}
                    </p>
                    <p className={`font-bold ${(f.marks_submission_pct ?? 0) >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {f.marks_submission_pct != null ? `Marks: ${f.marks_submission_pct}%` : "—"}
                    </p>
                  </div>
                  <Link href={`/principal/faculty/${f.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-600">
                    <ChevronRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* At-Risk Students */}
        <BentoCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">At-Risk Students in Department</p>
              <p className="text-xs text-slate-400">Students with risk score ≥ 60</p>
            </div>
            {at_risk_students.length > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                {at_risk_students.length} students
              </span>
            )}
          </div>
          {at_risk_students.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
              <CheckCircle size={28} className="text-emerald-400" />
              <p className="text-sm font-semibold text-slate-600">No high-risk students</p>
              <p className="text-xs">Department risk is well-managed</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {at_risk_students.map((s, i) => (
                <motion.div key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-5 py-3 flex items-center gap-4"
                >
                  <div className={`w-2 h-10 rounded-full flex-shrink-0 ${
                    s.risk_level === 'critical' ? 'bg-rose-500' :
                    s.risk_level === 'high' ? 'bg-orange-400' : 'bg-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.roll_number} · Sem {s.current_semester}</p>
                  </div>
                  <div className="text-right text-xs mr-2">
                    <p className="text-slate-400">Attendance</p>
                    <p className={`font-bold ${(s.attendance_pct ?? 0) < 75 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {s.attendance_pct != null ? `${s.attendance_pct}%` : "—"}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-400">Risk Score</p>
                    <p className="font-black text-rose-600">{s.risk_score?.toFixed(0) ?? "—"}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    s.risk_level === 'critical' ? 'bg-rose-100 text-rose-700' :
                    s.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {s.risk_level}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </BentoCard>
      </div>
    </div>
  )
}
