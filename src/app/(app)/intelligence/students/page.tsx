"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap, AlertTriangle, TrendingDown, TrendingUp,
  Search, ChevronRight, ArrowLeft, Lightbulb, Activity,
  Users, BookOpen, BarChart2, Calendar, CheckCircle, XCircle,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import {
  useAtRiskStudents,
  useStudentProfile,
  useStudentAttendanceTrend,
  useStudentMarksTrend,
  useStudentRecommendations,
  useStudentWeeklyAttendance,
} from "@/queries/students/useStudentIntelligence"
import { useUserStore } from "@/store"

// ─── Shared UI ───────────────────────────────────────────────────────────────

function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function RiskBadge({ level, score }: { level: string; score: number }) {
  const cfg: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg[level] ?? cfg.low}`}>
      {level === "critical" && <AlertTriangle size={10} />}
      {level.charAt(0).toUpperCase() + level.slice(1)} · {score}
    </span>
  )
}

// ─── Student Row ─────────────────────────────────────────────────────────────

function StudentRow({
  student, index, selected, onClick,
}: {
  student: any; index: number; selected: boolean; onClick: () => void
}) {
  const att = parseFloat(student.attendance_pct) || 0
  const marks = parseFloat(student.avg_marks) || 0
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      onClick={onClick}
      className={`border-b border-slate-100 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${selected ? "bg-indigo-50 hover:bg-indigo-50" : ""}`}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {student.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{student.name}</p>
            <p className="text-xs text-slate-400">{student.roll_number}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-600">Sem {student.current_semester}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold ${att < 60 ? "text-red-600" : att < 75 ? "text-amber-600" : "text-emerald-600"}`}>
            {att}%
          </span>
          {att < 75 && <TrendingDown size={12} className="text-red-400" />}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`text-sm font-bold ${marks < 40 ? "text-red-600" : marks < 55 ? "text-amber-600" : "text-emerald-600"}`}>
          {marks ? `${marks}%` : "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <RiskBadge level={student.risk_level} score={student.risk_score} />
      </td>
      <td className="px-4 py-3.5">
        <ChevronRight size={14} className={selected ? "text-indigo-500" : "text-slate-300"} />
      </td>
    </motion.tr>
  )
}

// ─── Stat Mini ────────────────────────────────────────────────────────────────

function StatMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
      <div className="text-lg font-black" style={{ color }}>{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{label}</div>
    </div>
  )
}

// ─── Student Profile Panel ────────────────────────────────────────────────────

type Tab = "overview" | "weekly" | "marks" | "ai-advice"

function StudentProfilePanel({ studentId, onClose }: { studentId: number; onClose: () => void }) {
  const { data: profile, isLoading } = useStudentProfile(studentId)
  const { data: attTrend } = useStudentAttendanceTrend(studentId)
  const { data: marksTrend } = useStudentMarksTrend(studentId)
  const { data: recsData } = useStudentRecommendations(studentId)
  const { data: weekly } = useStudentWeeklyAttendance(studentId)
  const [tab, setTab] = useState<Tab>("overview")

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-5 bg-slate-100 rounded-lg w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
      </div>
    )
  }

  if (!profile) return null
  const { student, attendance, risk } = profile
  const lowSubjects = (attendance.by_subject || []).filter((s: any) => parseFloat(s.pct) < 75)

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "weekly", label: "This Week", icon: Calendar },
    { key: "marks", label: "Marks", icon: BarChart2 },
    { key: "ai-advice", label: "AI Advice", icon: Lightbulb },
  ]

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-start gap-3 bg-gradient-to-r from-indigo-50 to-white">
        <button onClick={onClose} className="p-1.5 hover:bg-white rounded-lg border border-slate-200 transition-colors mt-0.5 shadow-sm">
          <ArrowLeft size={14} className="text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 truncate">{student.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{student.roll_number} · {student.dept_name} · Sem {student.current_semester}</p>
        </div>
        <RiskBadge level={risk.level} score={risk.score} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-3 gap-2.5">
              <StatMini label="Attendance" value={`${attendance.percentage}%`} color={attendance.percentage < 75 ? "#EF4444" : "#10B981"} />
              <StatMini label="Present" value={attendance.present} color="#6366F1" />
              <StatMini label="Absent" value={attendance.absent} color="#F59E0B" />
            </div>

            {/* Risk Predictions */}
            {risk.predictions && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Risk Predictions</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Dropout", value: risk.predictions.dropout_probability },
                    { label: "Failure", value: risk.predictions.failure_probability },
                    { label: "Arrears", value: risk.predictions.arrear_probability },
                  ].map(p => (
                    <div key={p.label} className={`p-3 rounded-xl border text-center ${p.value > 60 ? "bg-red-50 border-red-200" : p.value > 35 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <div className={`text-base font-black ${p.value > 60 ? "text-red-600" : p.value > 35 ? "text-amber-600" : "text-emerald-600"}`}>{p.value}%</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {risk.factors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={13} /> Risk Factors
                </p>
                <div className="space-y-1.5">
                  {risk.factors.map((f: any, i: number) => (
                    <div key={i} className="text-xs text-red-600 flex items-center justify-between">
                      <span className="font-semibold">{f.factor}</span>
                      <span className="bg-red-100 px-2 py-0.5 rounded-full font-bold">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Attendance — highlighted */}
            {attendance.by_subject?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Attendance</p>
                <div className="space-y-2">
                  {attendance.by_subject.map((s: any) => {
                    const pct = parseFloat(s.pct) || 0
                    const isLow = pct < 75
                    return (
                      <div key={s.code} className={`flex items-center gap-3 p-2.5 rounded-xl border ${isLow ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-slate-700 truncate">{s.name}</p>
                            <span className={`text-xs font-black ml-2 ${pct < 60 ? "text-red-600" : pct < 75 ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: pct < 60 ? "#EF4444" : pct < 75 ? "#F59E0B" : "#10B981" }}
                            />
                          </div>
                        </div>
                        {isLow && <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>
                {lowSubjects.length > 0 && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-semibold text-amber-700">
                      ⚠ {lowSubjects.length} subject{lowSubjects.length > 1 ? "s" : ""} below 75% threshold
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── WEEKLY TAB ── */}
        {tab === "weekly" && (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last 7 Days</p>

            {/* Day-by-day grid */}
            {!weekly?.daily || weekly.daily.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No attendance data for the past 7 days.
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {weekly.daily.map((d: any) => (
                  <div key={d.date} className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${d.pct === 0 ? "bg-red-50 border-red-200" : d.pct === 100 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                    <span className="text-[10px] font-bold text-slate-500">{d.day_name}</span>
                    {d.pct === 100 ? (
                      <CheckCircle size={16} className="text-emerald-500" />
                    ) : d.pct === 0 ? (
                      <XCircle size={16} className="text-red-500" />
                    ) : (
                      <span className="text-xs font-black text-amber-600">{d.pct}%</span>
                    )}
                    <span className="text-[10px] text-slate-400">{d.present}/{d.total}</span>
                  </div>
                ))}
              </div>
            )}

            {/* This-week subject breakdown */}
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">Subject Breakdown (This Week)</p>
            {!weekly?.subjects || weekly.subjects.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">No subject data for this week.</div>
            ) : (
              <div className="space-y-2">
                {weekly.subjects.map((s: any) => {
                  const pct = parseFloat(s.pct) || 0
                  const isLow = pct < 75
                  return (
                    <div key={s.code} className={`flex items-center gap-3 p-3 rounded-xl border ${isLow ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <p className="text-xs font-semibold text-slate-700 truncate">{s.name}</p>
                          <span className={`text-xs font-black ${pct < 60 ? "text-red-600" : pct < 75 ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct < 60 ? "#EF4444" : pct < 75 ? "#F59E0B" : "#10B981" }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.present}/{s.total} classes attended</p>
                      </div>
                      {isLow && <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Trend chart */}
            {attTrend && attTrend.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Trend</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="attG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Attendance"]} />
                      <Area type="monotone" dataKey="attendance" stroke="#6366F1" strokeWidth={2} fill="url(#attG)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </>
        )}

        {/* ── MARKS TAB ── */}
        {tab === "marks" && (
          <>
            {!marksTrend || marksTrend.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No marks records found.
              </div>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marksTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="code" tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Marks"]} />
                      <Bar dataKey="percentage" radius={[3, 3, 0, 0]} maxBarSize={24}>
                        {marksTrend.map((m: any, i: number) => (
                          <Cell key={i} fill={m.percentage < 40 ? "#EF4444" : m.percentage < 55 ? "#F59E0B" : "#6366F1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-1">
                  {marksTrend.map((m: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between text-xs p-2.5 rounded-lg border ${m.percentage < 50 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                      <div>
                        <span className="font-semibold text-slate-700">{m.code}</span>
                        <span className="text-slate-400 ml-2 capitalize">{m.exam_type?.replace(/_/g, " ")}</span>
                      </div>
                      <span className={`font-black ${m.percentage < 40 ? "text-red-600" : m.percentage < 55 ? "text-amber-600" : "text-emerald-600"}`}>
                        {m.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── AI ADVICE TAB ── */}
        {tab === "ai-advice" && (
          <>
            {!recsData?.recommendations || recsData.recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No recommendations at this time. Student is on track.
              </div>
            ) : (
              <div className="space-y-3">
                {recsData.recommendations.map((rec: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    rec.priority === "critical" ? "bg-red-50 border-red-200" :
                    rec.priority === "high" ? "bg-amber-50 border-amber-200" :
                    "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-start gap-2 mb-1.5">
                      <Lightbulb size={14} className={rec.priority === "critical" ? "text-red-500 mt-0.5" : "text-amber-500 mt-0.5"} />
                      <p className={`text-sm font-bold ${rec.priority === "critical" ? "text-red-800" : "text-amber-800"}`}>
                        {rec.action}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 ml-5">{rec.detail}</p>
                    <div className="flex items-center justify-between ml-5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Owner: {rec.owner}</span>
                      <span className="text-[10px] text-emerald-600 italic">{rec.expected_impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentIntelligencePage() {
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAtRiskStudents({
    page,
    page_size: 20,
    risk_level: riskFilter || undefined,
    search: search || undefined,
    semester: semesterFilter ? parseInt(semesterFilter) : undefined,
  })

  const students = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 1

  const riskSummary = [
    { level: "critical", label: "Critical", color: "#EF4444", bg: "bg-red-50", border: "border-red-200" },
    { level: "high",     label: "High Risk", color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200" },
    { level: "medium",   label: "Medium",   color: "#EAB308", bg: "bg-yellow-50", border: "border-yellow-200" },
  ]

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-500" /> Student Intelligence
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          AI-powered risk detection · Department-scoped · Click any student to open their profile
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {riskSummary.map(r => (
          <motion.button
            key={r.level}
            whileHover={{ y: -2 }}
            onClick={() => setRiskFilter(riskFilter === r.level ? "" : r.level)}
            className={`${r.bg} ${r.border} border rounded-2xl p-5 text-left transition-all shadow-sm ${riskFilter === r.level ? "ring-2 ring-offset-1" : ""}`}
            style={{ ringColor: r.color } as any}
          >
            <p className="text-2xl font-black" style={{ color: r.color }}>
              {isLoading ? "—" : students.filter((s: any) => s.risk_level === r.level).length}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1">{r.label}</p>
            {riskFilter === r.level && (
              <p className="text-[10px] text-indigo-500 font-semibold mt-1">Filtering · Click to clear</p>
            )}
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Student Table */}
        <BentoCard className={`${selectedId ? "w-[55%]" : "w-full"} overflow-hidden transition-all duration-300 flex flex-col`}>
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or roll number..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <select
              value={semesterFilter}
              onChange={e => { setSemesterFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <span className="text-xs font-semibold text-slate-400">
              {isLoading ? "—" : `${total} students`}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Student", "Semester", "Attendance", "Avg Marks", "Risk", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <GraduationCap size={32} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 font-medium">No students found</p>
                    </td>
                  </tr>
                ) : (
                  students.map((s: any, i: number) => (
                    <StudentRow
                      key={s.id}
                      student={s}
                      index={i}
                      selected={selectedId === s.id}
                      onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              <span>{total} students</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">←</button>
                <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold">{page}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">→</button>
              </div>
            </div>
          )}
        </BentoCard>

        {/* Profile Panel */}
        <AnimatePresence>
          {selectedId && (
            <div className="w-[45%] flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-220px)] sticky top-6 flex flex-col">
              <StudentProfilePanel studentId={selectedId} onClose={() => setSelectedId(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
