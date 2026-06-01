"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAtRiskStudents, useStudentProfile, useStudentAttendanceTrend, useStudentMarksTrend, useStudentRecommendations } from "@/queries/students/useStudentIntelligence"
import { useFiltersStore } from "@/store/useFiltersStore"
import { api } from "@/services/api"
import {
  GraduationCap, AlertTriangle, TrendingDown, TrendingUp,
  Search, Filter, X, ChevronRight, Calendar, BookOpen,
  Target, Users, Activity, ArrowLeft, Lightbulb, Eye,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"

// ─── Risk Badge ──────────────────────────────────────────────────────────────

function RiskBadge({ level, score }: { level: string; score: number }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[level] || styles.low}`}>
      {level === "critical" && <AlertTriangle size={10} />}
      {level.charAt(0).toUpperCase() + level.slice(1)} · {score}
    </span>
  )
}

// ─── Student Row ─────────────────────────────────────────────────────────────

function StudentRow({ student, onClick, selected }: { student: any; onClick: () => void; selected: boolean }) {
  const att = parseFloat(student.attendance_pct) || 0
  const marks = parseFloat(student.avg_marks) || 0
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className={`border-b border-[#F1F5F9] cursor-pointer transition-colors hover:bg-[#F8FAFC] ${selected ? "bg-indigo-50" : ""}`}
    >
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {student.name?.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0F172A]">{student.name}</div>
            <div className="text-xs text-[#94A3B8]">{student.roll_number}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-sm text-[#475569]">{student.department}</td>
      <td className="py-3 px-2 text-sm text-[#475569]">Sem {student.current_semester}</td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1.5">
          <div className={`text-sm font-semibold ${att < 60 ? "text-red-600" : att < 75 ? "text-amber-600" : "text-emerald-600"}`}>
            {att}%
          </div>
          {att < 75 && <TrendingDown size={12} className="text-red-400" />}
        </div>
      </td>
      <td className="py-3 px-2">
        <span className={`text-sm font-semibold ${marks < 40 ? "text-red-600" : marks < 55 ? "text-amber-600" : "text-emerald-600"}`}>
          {marks ? `${marks}%` : "—"}
        </span>
      </td>
      <td className="py-3 px-2">
        <RiskBadge level={student.risk_level} score={student.risk_score} />
      </td>
      <td className="py-3 px-4">
        <ChevronRight size={14} className={`${selected ? "text-[#6366F1]" : "text-[#CBD5E1]"}`} />
      </td>
    </motion.tr>
  )
}

// ─── Student Profile Panel ────────────────────────────────────────────────────

function StudentProfilePanel({ studentId, onClose }: { studentId: number; onClose: () => void }) {
  const { data: profile, isLoading } = useStudentProfile(studentId)
  const { data: attTrend } = useStudentAttendanceTrend(studentId)
  const { data: marksTrend } = useStudentMarksTrend(studentId)
  const { data: recsData } = useStudentRecommendations(studentId)
  const [tab, setTab] = useState<"overview" | "attendance" | "marks" | "recommendations">("overview")

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 animate-pulse">
        <div className="h-6 bg-[#F1F5F9] rounded-lg w-3/4" />
        <div className="h-4 bg-[#F1F5F9] rounded-lg w-1/2" />
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#F1F5F9] rounded-xl" />)}
      </div>
    )
  }

  if (!profile) return null
  const { student, attendance, risk } = profile

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] flex items-start gap-3">
        <button onClick={onClose} className="p-1.5 hover:bg-[#F1F5F9] rounded-lg transition-colors mt-0.5">
          <ArrowLeft size={16} className="text-[#64748B]" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-[#0F172A] truncate">{student.name}</div>
          <div className="text-xs text-[#94A3B8]">{student.roll_number} · {student.dept_name} · Sem {student.current_semester}</div>
        </div>
        <RiskBadge level={risk.level} score={risk.score} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] px-3">
        {(["overview", "attendance", "marks", "recommendations"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
              tab === t ? "border-[#6366F1] text-[#6366F1]" : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">

        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            {/* Attendance KPI */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Attendance", value: `${attendance.percentage}%`, color: attendance.percentage < 75 ? "#EF4444" : "#10B981" },
                { label: "Present", value: attendance.present, color: "#6366F1" },
                { label: "Absent", value: attendance.absent, color: "#F59E0B" },
              ].map(kpi => (
                <div key={kpi.label} className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
                  <div className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Risk Factors */}
            {risk.factors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Risk Factors
                </div>
                <div className="flex flex-col gap-2">
                  {risk.factors.map((f: any, i: number) => (
                    <div key={i} className="text-xs text-red-600">
                      <span className="font-semibold">{f.factor}:</span> {f.value} (threshold: {f.threshold})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject attendance */}
            {attendance.by_subject?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-[#0F172A] mb-2">Subject Attendance</div>
                <div className="flex flex-col gap-1.5">
                  {attendance.by_subject.map((s: any) => (
                    <div key={s.code} className="flex items-center gap-2">
                      <div className="text-xs text-[#475569] w-24 truncate" title={s.name}>{s.name}</div>
                      <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${s.pct || 0}%`,
                            background: s.pct < 60 ? "#EF4444" : s.pct < 75 ? "#F59E0B" : "#10B981",
                          }}
                        />
                      </div>
                      <div className={`text-xs font-semibold w-10 text-right ${s.pct < 75 ? "text-red-600" : "text-emerald-600"}`}>
                        {s.pct}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "attendance" && (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-bold text-[#0F172A] mb-1">Monthly Attendance Trend</div>
            {!attTrend || attTrend.length === 0 ? (
              <div className="text-center py-8 text-[#94A3B8] text-sm">No attendance trend data available</div>
            ) : (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attGradS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: any) => [`${v}%`, "Attendance"]} />
                    <Area type="monotone" dataKey="attendance" stroke="#6366F1" strokeWidth={2} fill="url(#attGradS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {tab === "marks" && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-[#0F172A] mb-1">Marks by Subject & Exam</div>
            {!marksTrend || marksTrend.length === 0 ? (
              <div className="text-center py-8 text-[#94A3B8] text-sm">No marks data available</div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marksTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="code" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: any) => [`${v}%`, "Marks"]} />
                    <Bar dataKey="percentage" fill="#6366F1" radius={[3, 3, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {marksTrend && marksTrend.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {marksTrend.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-[#475569] truncate max-w-[120px]" title={m.subject}>{m.subject}</span>
                    <span className="text-[#94A3B8] text-[10px] mx-2">{m.exam_type}</span>
                    <span className={`font-semibold ${m.percentage < 50 ? "text-red-600" : "text-emerald-600"}`}>
                      {m.marks_obtained}/{m.max_marks} ({m.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "recommendations" && (
          <div className="flex flex-col gap-3">
            {!recsData ? (
              <div className="animate-pulse flex flex-col gap-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-[#F1F5F9] rounded-xl" />)}
              </div>
            ) : recsData.recommendations.length === 0 ? (
              <div className="text-center py-8 text-[#94A3B8] text-sm">No recommendations — student is on track.</div>
            ) : (
              recsData.recommendations.map((rec: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    rec.priority === "critical" ? "bg-red-50 border-red-200" :
                    rec.priority === "high" ? "bg-amber-50 border-amber-200" :
                    "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb size={14} className={rec.priority === "critical" ? "text-red-600" : rec.priority === "high" ? "text-amber-600" : "text-blue-600"} />
                    <div className="text-xs font-semibold text-[#0F172A] flex-1">{rec.action}</div>
                  </div>
                  <div className="text-xs text-[#475569] mb-2">{rec.detail}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 italic">{rec.expected_impact}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#E2E8F0] text-[#64748B]">{rec.owner}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentIntelligencePage() {
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useAtRiskStudents({
    page,
    page_size: 20,
    risk_level: riskFilter || undefined,
    search: search || undefined,
  })

  const students = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 1

  const riskCounts = {
    critical: students.filter((s: any) => s.risk_level === "critical").length,
    high: students.filter((s: any) => s.risk_level === "high").length,
    medium: students.filter((s: any) => s.risk_level === "medium").length,
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px]">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <GraduationCap size={24} className="text-[#6366F1]" />
            Student Intelligence
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            AI-powered risk detection and academic performance intelligence
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Activity size={14} className="text-[#6366F1]" />
          {isLoading ? "Loading..." : `${total} students tracked`}
        </div>
      </div>

      {/* Risk Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { level: "critical", label: "Critical Risk", color: "#EF4444", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
          { level: "high", label: "High Risk", color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", icon: TrendingDown },
          { level: "medium", label: "Medium Risk", color: "#F59E0B", bg: "bg-yellow-50", border: "border-yellow-200", icon: Eye },
        ].map(({ level, label, color, bg, border, icon: Icon }) => (
          <motion.button
            key={level}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setRiskFilter(riskFilter === level ? "" : level)}
            className={`${bg} ${border} border rounded-2xl p-4 text-left transition-all hover:shadow-md ${riskFilter === level ? "ring-2" : ""}`}
            style={{ ringColor: color } as any}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={16} style={{ color }} />
              <span className="text-xs font-semibold" style={{ color }}>{label}</span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">
              {isLoading ? "—" : (level === "critical" ? total > 0 : level === "high" ? true : true) && "..."}
            </div>
            <div className="text-xs text-[#94A3B8] mt-0.5">Click to filter</div>
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex gap-6">

        {/* Table Section */}
        <div className={`${selectedStudentId ? "w-[55%]" : "w-full"} bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all duration-300`}>

          {/* Table Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[#E2E8F0]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or roll number..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/20"
              />
            </div>
            {riskFilter && (
              <button
                onClick={() => setRiskFilter("")}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6366F1] bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Filter size={12} />
                {riskFilter}
                <X size={10} />
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {["Student", "Department", "Semester", "Attendance", "Avg Marks", "Risk", ""].map(h => (
                    <th key={h} className="py-2.5 px-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider first:pl-4 last:pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#F1F5F9]">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-3"><div className="h-4 bg-[#F1F5F9] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <GraduationCap size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                      <div className="text-sm text-[#94A3B8] font-medium">No students found</div>
                      <div className="text-xs text-[#CBD5E1] mt-1">Try adjusting your search or risk filter</div>
                    </td>
                  </tr>
                ) : (
                  students.map((student: any) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      selected={selectedStudentId === student.id}
                      onClick={() => setSelectedStudentId(selectedStudentId === student.id ? null : student.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] text-xs text-[#64748B]">
              <span>{total} students</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                >
                  ←
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-[#6366F1] text-white font-semibold">{page}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Panel */}
        <AnimatePresence>
          {selectedStudentId && (
            <div className="w-[45%] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden h-[calc(100vh-200px)] sticky top-6 flex flex-col">
              <StudentProfilePanel
                studentId={selectedStudentId}
                onClose={() => setSelectedStudentId(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
