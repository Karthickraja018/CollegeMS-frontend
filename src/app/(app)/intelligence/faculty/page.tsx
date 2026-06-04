"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Search, AlertCircle, CheckCircle, TrendingUp, Star, FileText,
  ChevronRight, ArrowLeft, Lightbulb, Activity, BarChart2, Calendar, BookOpen
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { useDepartmentFaculty, useFacultyProfile } from "@/queries/departments/useDepartmentIntelligence"
import { useUserStore } from "@/store"

// ─── Shared UI ───────────────────────────────────────────────────────────────

function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

const PERF_COLOR: Record<string, { bg: string; text: string }> = {
  excellent: { bg: "#ECFDF5", text: "#059669" },
  good:      { bg: "#EEF2FF", text: "#4F46E5" },
  warning:   { bg: "#FFFBEB", text: "#D97706" },
  critical:  { bg: "#FEF2F2", text: "#DC2626" },
  gray:      { bg: "#F1F5F9", text: "#64748B" },
}

function getGrade(passRate: number): { label: string; key: string } {
  if (passRate >= 80) return { label: "Excellent", key: "excellent" }
  if (passRate >= 65) return { label: "Good",      key: "good" }
  if (passRate >= 50) return { label: "Warning",   key: "warning" }
  if (passRate > 0)   return { label: "Critical",  key: "critical" }
  return { label: "No Data", key: "gray" }
}

// ─── Faculty Row ─────────────────────────────────────────────────────────────

function FacultyRow({ faculty, index, selected, onClick }: { faculty: any; index: number; selected: boolean; onClick: () => void }) {
  const passRate  = parseFloat(faculty.pass_rate) || 0
  const attSub    = parseFloat(faculty.avg_student_att) || 0
  const compliance = faculty.compliance_score || 0
  const grade     = getGrade(passRate)
  const badge     = PERF_COLOR[grade.key]

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={`border-b border-slate-100 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${selected ? "bg-indigo-50 hover:bg-indigo-50" : ""}`}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
            {faculty.faculty_name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{faculty.faculty_name}</p>
            <p className="text-xs text-slate-400">
              {faculty.subjects_assigned || 0} subject{faculty.subjects_assigned !== 1 ? "s" : ""} · {faculty.students_taught || 0} students
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`text-sm font-bold ${passRate >= 70 ? "text-emerald-600" : passRate >= 50 ? "text-amber-600" : "text-red-600"}`}>
          {passRate ? `${passRate}%` : "—"}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 w-16">Avg Att.</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, attSub)}%`,
                background: attSub >= 85 ? "#10B981" : attSub >= 70 ? "#F59E0B" : "#EF4444"
              }} />
            </div>
            <span className="text-xs font-bold text-slate-600 w-8">{attSub ? `${attSub}%` : "—"}</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`text-sm font-bold ${compliance >= 85 ? "text-emerald-600" : compliance >= 70 ? "text-amber-600" : "text-red-600"}`}>
          {compliance}%
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.text }}>
          {grade.label}
        </span>
      </td>

      <td className="px-4 py-4">
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

// ─── Faculty Profile Panel ────────────────────────────────────────────────────

type Tab = "overview" | "subjects" | "poor-students" | "recent" | "ai-advice"

function FacultyProfilePanel({ deptId, facultyId, onClose }: { deptId: number; facultyId: number; onClose: () => void }) {
  const { data: profile, isLoading } = useFacultyProfile(deptId, facultyId)
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
  const { faculty, kpis, subjects, recent_classes, recommendations } = profile

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "subjects", label: "Subjects", icon: BarChart2 },
    { key: "poor-students", label: "At-Risk", icon: AlertCircle },
    { key: "recent", label: "Recent", icon: Calendar },
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
          <p className="font-black text-slate-900 truncate">{faculty.full_name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{faculty.employee_id} · {faculty.role}</p>
        </div>
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
            <div className="grid grid-cols-3 gap-2.5">
              <StatMini label="Compliance" value={`${kpis.compliance}%`} color={kpis.compliance < 75 ? "#EF4444" : "#10B981"} />
              <StatMini label="Total Subjects" value={kpis.total_subjects} color="#6366F1" />
              <StatMini label="Avg Attendance" value={`${kpis.avg_student_attendance}%`} color="#F59E0B" />
            </div>
          </>
        )}

        {/* ── SUBJECTS TAB ── */}
        {tab === "subjects" && (
          <>
            {!subjects || subjects.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No subjects assigned.
              </div>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjects} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="code" tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Pass Rate"]} />
                      <Bar dataKey="pass_rate" radius={[3, 3, 0, 0]} maxBarSize={24}>
                        {subjects.map((m: any, i: number) => (
                          <Cell key={i} fill={m.pass_rate < 50 ? "#EF4444" : m.pass_rate < 65 ? "#F59E0B" : "#10B981"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-1">
                  {subjects.map((m: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between text-xs p-2.5 rounded-lg border ${m.pass_rate < 50 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                      <div>
                        <span className="font-semibold text-slate-700">{m.code}</span>
                        <span className="text-slate-400 ml-2">{m.name}</span>
                      </div>
                      <span className={`font-black ${m.pass_rate < 50 ? "text-red-600" : m.pass_rate < 65 ? "text-amber-600" : "text-emerald-600"}`}>
                        {m.pass_rate}% Pass
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── AT-RISK STUDENTS TAB ── */}
        {tab === "poor-students" && (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Needs Attention</p>
            {!profile.poor_students || profile.poor_students.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No poor performing students found.
              </div>
            ) : (
              <div className="space-y-2">
                {profile.poor_students.map((student: any, i: number) => {
                  const marks = parseFloat(student.marks) || 0
                  const att = parseFloat(student.attendance) || 0
                  return (
                    <div key={student.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.roll_number}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 font-semibold mb-1">Avg Marks</p>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${marks}%`, background: marks < 50 ? "#EF4444" : "#F59E0B" }} />
                            </div>
                            <span className={`text-[10px] font-bold ${marks < 50 ? "text-red-600" : "text-amber-600"}`}>{marks}%</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 font-semibold mb-1">Attendance</p>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${att}%`, background: att < 65 ? "#EF4444" : "#F59E0B" }} />
                            </div>
                            <span className={`text-[10px] font-bold ${att < 65 ? "text-red-600" : "text-amber-600"}`}>{att}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── RECENT CLASSES TAB ── */}
        {tab === "recent" && (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last 10 Classes</p>
            {!recent_classes || recent_classes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No recent attendance records.
              </div>
            ) : (
              <div className="space-y-2">
                {recent_classes.map((c: any, i: number) => {
                  const pct = parseFloat(c.att_pct) || 0
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 border-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <p className="text-xs font-semibold text-slate-700 truncate">{c.subject_name}</p>
                          <span className={`text-xs font-black ${pct < 60 ? "text-red-600" : pct < 75 ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct < 60 ? "#EF4444" : pct < 75 ? "#F59E0B" : "#10B981" }} />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[10px] text-slate-400">{c.date} (Period {c.period})</p>
                          <p className="text-[10px] text-slate-400">{c.present}/{c.total_students} present</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── AI ADVICE TAB ── */}
        {tab === "ai-advice" && (
          <>
            {!recommendations || recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No recommendations at this time.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec: any, i: number) => (
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
                    <p className="text-xs text-slate-600 ml-5">{rec.detail}</p>
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

export default function FacultyIntelligencePage() {
  const user   = useUserStore(s => s.user)
  const deptId = user?.department_id ?? null

  const { data, isLoading } = useDepartmentFaculty(deptId)
  const facultyList: any[] = data?.faculty ?? []

  const [search, setSearch]       = useState("")
  const [filterGrade, setFilterGrade] = useState("all")
  const [filterCompliance, setFilterCompliance] = useState("all")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = facultyList.filter(f => {
    const matchSearch = !search || f.faculty_name.toLowerCase().includes(search.toLowerCase())
    const grade = getGrade(parseFloat(f.pass_rate) || 0)
    const matchGrade = filterGrade === "all" || grade.key === filterGrade
    const compliance = f.compliance_score || 0
    const matchCompliance = filterCompliance === "all" 
      || (filterCompliance === "high" && compliance >= 85)
      || (filterCompliance === "medium" && compliance >= 70 && compliance < 85)
      || (filterCompliance === "low" && compliance < 70)
    return matchSearch && matchGrade && matchCompliance
  })

  const excellent = facultyList.filter(f => getGrade(parseFloat(f.pass_rate) || 0).key === "excellent").length
  const warning   = facultyList.filter(f => ["warning", "critical"].includes(getGrade(parseFloat(f.pass_rate) || 0).key)).length
  const lowComp   = facultyList.filter(f => (f.compliance_score || 0) < 75).length

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] -m-4 sm:-m-6 lg:-m-8">
      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${selectedId ? "pr-0 lg:pr-8 lg:mr-[400px] xl:mr-[480px]" : ""}`}>
        <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users size={24} className="text-indigo-500" /> Faculty Intelligence
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Department-scoped faculty performance, compliance, and research output
            </p>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Faculty",    value: facultyList.length || "—", color: "#4F46E5", icon: Users },
              { label: "Top Performers",   value: excellent || "—",          color: "#10B981", icon: CheckCircle },
              { label: "Needs Attention",  value: warning || "—",            color: "#F59E0B", icon: AlertCircle },
              { label: "Low Compliance",   value: lowComp || "—",            color: "#EF4444", icon: AlertCircle },
            ].map(c => (
              <BentoCard key={c.label} className="p-5">
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-7 bg-slate-100 rounded w-1/3" />
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
                placeholder="Search faculty by name..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Grades</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filterCompliance}
              onChange={e => setFilterCompliance(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Compliance</option>
              <option value="high">High (≥85%)</option>
              <option value="medium">Medium (70-84%)</option>
              <option value="low">Low (&lt;70%)</option>
            </select>
          </div>

          {/* Faculty Table */}
          <BentoCard className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">
                {filtered.length} faculty member{filtered.length !== 1 ? "s" : ""}
                {search || filterGrade !== "all" ? " (filtered)" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Faculty", "Pass Rate", "Student Avg. Attendance", "Compliance", "Grade", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <Users size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No faculty match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((f, i) => (
                      <FacultyRow 
                        key={f.faculty_id} 
                        faculty={f} 
                        index={i} 
                        selected={selectedId === f.faculty_id}
                        onClick={() => setSelectedId(f.faculty_id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </BentoCard>
        </div>
      </div>

      {/* SLIDE-IN PROFILE PANEL */}
      <AnimatePresence>
        {selectedId && deptId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[400px] xl:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-40 mt-16 lg:mt-0"
          >
            <FacultyProfilePanel 
              deptId={deptId} 
              facultyId={selectedId} 
              onClose={() => setSelectedId(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
