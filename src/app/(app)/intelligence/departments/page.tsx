"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, BarChart2, Users, BookOpen, TrendingUp, X, Scale } from "lucide-react"
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import {
  useDepartmentList, useDepartmentOverview, useDepartmentSubjects,
  useDepartmentFaculty, useDepartmentTrends, useDepartmentRiskDistribution,
  useDepartmentComparison,
} from "@/queries/departments/useDepartmentIntelligence"
import { useUserStore } from "@/store"

const RISK_COLORS = ["#10B981", "#84CC16", "#F59E0B", "#F97316", "#EF4444"]

function AHSRing({ score, color }: { score: number; color: string }) {
  const colorMap: Record<string, string> = {
    green: "#10B981", blue: "#6366F1", amber: "#F59E0B", red: "#EF4444", gray: "#94A3B8"
  }
  const c = colorMap[color] || "#6366F1"
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" className="rotate-[-90deg]">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#F1F5F9" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={c} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-[#0F172A]">{score}</div>
        <div className="text-[10px] text-[#94A3B8]">/ 100</div>
      </div>
    </div>
  )
}

function ComparisonModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useDepartmentComparison()
  const depts = data?.departments || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-4xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Department Comparison</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Institution-wide academic health comparison</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#475569] hover:bg-[#F1F5F9] transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[70vh]">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-[#F1F5F9] rounded-lg" />)}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Rank", "Department", "AHS", "Attendance", "Pass Rate", "At Risk", "Faculty"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {[...depts].sort((a, b) => (b.ahs || 0) - (a.ahs || 0)).map((dept: any, i: number) => (
                  <tr key={dept.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-bold text-[#94A3B8]">#{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#0F172A]">{dept.name}</div>
                      <div className="text-[10px] text-[#94A3B8]">{dept.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-base ${dept.ahs >= 70 ? "text-emerald-600" : dept.ahs >= 55 ? "text-amber-600" : "text-red-600"}`}>
                        {dept.ahs}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{dept.avg_att}%</td>
                    <td className="px-4 py-3 text-[#475569]">{dept.pass_rate}%</td>
                    <td className="px-4 py-3 text-red-600 font-semibold">{dept.at_risk}</td>
                    <td className="px-4 py-3 text-[#475569]">{dept.faculty_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function DepartmentIntelligencePage() {
  const user = useUserStore((s) => s.user)
  const isInstitutionWide = ["admin", "college_admin", "principal"].includes(user?.role || "")
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  const { data: deptList, isLoading: listLoading } = useDepartmentList()
  const { data: overview, isLoading: overviewLoading } = useDepartmentOverview(selectedDeptId)
  const { data: subjects, isLoading: subjectsLoading } = useDepartmentSubjects(selectedDeptId)
  const { data: faculty, isLoading: facultyLoading } = useDepartmentFaculty(selectedDeptId)
  const { data: trends, isLoading: trendsLoading } = useDepartmentTrends(selectedDeptId)
  const { data: riskDist, isLoading: riskLoading } = useDepartmentRiskDistribution(selectedDeptId)

  const departments = deptList || []

  // Auto-select first dept for HOD/Faculty
  if (!isInstitutionWide && departments.length > 0 && selectedDeptId === null) {
    setSelectedDeptId(departments[0].id)
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 max-w-[1600px]">

      {/* Left: Department List */}
      {isInstitutionWide && (
        <div className="w-[220px] flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col rounded-l-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <div className="text-xs font-bold text-[#0F172A]">Departments</div>
            {isInstitutionWide && (
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#6366F1] mt-1 hover:underline"
              >
                <Scale size={10} /> Compare All
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {listLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mx-2 mb-1 h-10 animate-pulse bg-[#F1F5F9] rounded-lg" />
              ))
            ) : departments.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#94A3B8]">No departments found</div>
            ) : (
              departments.map((dept: any) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                    selectedDeptId === dept.id
                      ? "bg-[#6366F1]/10 text-[#6366F1] font-semibold border-r-2 border-[#6366F1]"
                      : "text-[#475569] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Building2 size={14} className="flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">{dept.name}</div>
                    <div className="text-[10px] text-[#94A3B8]">{dept.code}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        {!selectedDeptId ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm">
              <Building2 size={28} className="text-[#CBD5E1]" />
            </div>
            <div className="text-sm font-semibold text-[#374151]">Select a Department</div>
            <div className="text-xs text-[#94A3B8]">Choose a department from the sidebar to view its intelligence report</div>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-5">

            {/* Dept header */}
            {overviewLoading ? (
              <div className="h-8 w-48 animate-pulse bg-white rounded-lg border border-[#E2E8F0]" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">{overview?.department?.name}</h1>
                  <p className="text-xs text-[#94A3B8]">{overview?.department?.code} · Department Intelligence Report</p>
                </div>
              </div>
            )}

            {/* Top KPIs + AHS */}
            <div className="grid grid-cols-12 gap-4">
              {/* AHS */}
              <div className="col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 flex flex-col items-center justify-center gap-3">
                <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Academic Health</div>
                {overviewLoading ? (
                  <div className="w-24 h-24 rounded-full animate-pulse bg-[#F1F5F9]" />
                ) : (
                  <>
                    <AHSRing score={overview?.academic_health?.score || 0} color={overview?.academic_health?.color || "gray"} />
                    <div className={`text-xs font-bold ${
                      overview?.academic_health?.color === "green" ? "text-emerald-600" :
                      overview?.academic_health?.color === "blue" ? "text-[#6366F1]" :
                      overview?.academic_health?.color === "amber" ? "text-amber-600" : "text-red-600"
                    }`}>
                      {overview?.academic_health?.grade}
                    </div>
                  </>
                )}
              </div>

              {/* KPI cards */}
              <div className="col-span-9 grid grid-cols-4 gap-3">
                {[
                  { label: "Students", val: overview?.kpis?.total_students, icon: Users, color: "#6366F1" },
                  { label: "Attendance", val: overview?.kpis?.avg_attendance != null ? `${overview.kpis.avg_attendance}%` : null, icon: TrendingUp, color: "#10B981" },
                  { label: "Pass Rate", val: overview?.kpis?.pass_rate != null ? `${overview.kpis.pass_rate}%` : null, icon: BarChart2, color: "#8B5CF6" },
                  { label: "At Risk", val: overview?.kpis?.at_risk_students, icon: Users, color: "#EF4444" },
                ].map(({ label, val, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{label}</span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                    </div>
                    {overviewLoading ? (
                      <div className="h-6 w-16 animate-pulse bg-[#F1F5F9] rounded" />
                    ) : (
                      <div className="text-xl font-bold text-[#0F172A]">{val ?? "—"}</div>
                    )}
                  </div>
                ))}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Faculty</div>
                  <div className="text-xl font-bold text-[#0F172A]">{overviewLoading ? "—" : overview?.kpis?.faculty_count ?? 0}</div>
                </div>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Subjects</div>
                  <div className="text-xl font-bold text-[#0F172A]">{overviewLoading ? "—" : overview?.kpis?.subject_count ?? 0}</div>
                </div>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Critical Risk</div>
                  <div className="text-xl font-bold text-red-600">{overviewLoading ? "—" : overview?.kpis?.critical_risk_students ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-12 gap-5">
              {/* Subject Analysis */}
              <div className="col-span-7 flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
                    <BookOpen size={15} className="text-[#6366F1]" />
                    <span className="text-sm font-bold text-[#0F172A]">Subject Analysis</span>
                  </div>
                  <div className="overflow-auto max-h-[280px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#F8FAFC]">
                        <tr className="border-b border-[#E2E8F0]">
                          {["Subject", "Sem", "Students", "Pass Rate", "Avg Marks", "Status"].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8FAFC]">
                        {subjectsLoading ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                              <td key={j} className="px-3 py-2"><div className="h-3 animate-pulse bg-[#F1F5F9] rounded" /></td>
                            ))}</tr>
                          ))
                        ) : (subjects?.subjects || []).length === 0 ? (
                          <tr><td colSpan={6} className="px-3 py-8 text-center text-[#94A3B8]">No subject data available</td></tr>
                        ) : (
                          (subjects?.subjects || []).map((s: any) => (
                            <tr key={s.id} className="hover:bg-[#F8FAFC]">
                              <td className="px-3 py-2">
                                <div className="font-semibold text-[#0F172A] truncate max-w-[160px]" title={s.name}>{s.name}</div>
                                <div className="text-[#94A3B8] text-[10px]">{s.code}</div>
                              </td>
                              <td className="px-3 py-2 text-[#475569]">{s.semester_number}</td>
                              <td className="px-3 py-2 text-[#475569]">{s.total_students ?? "—"}</td>
                              <td className="px-3 py-2">
                                <span className={`font-bold ${s.pass_rate < 40 ? "text-red-600" : s.pass_rate < 60 ? "text-amber-600" : "text-emerald-600"}`}>
                                  {s.pass_rate ?? "—"}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-[#475569]">{s.avg_marks ?? "—"}%</td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.risk_flag === "critical" ? "bg-red-100 text-red-700" :
                                  s.risk_flag === "warning" ? "bg-amber-100 text-amber-700" :
                                  "bg-emerald-100 text-emerald-700"
                                }`}>
                                  {s.risk_flag === "critical" ? "Critical" : s.risk_flag === "warning" ? "Warning" : "Good"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance Trend */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
                  <div className="text-sm font-bold text-[#0F172A] mb-4">Attendance Trend</div>
                  {trendsLoading ? (
                    <div className="h-40 animate-pulse bg-[#F1F5F9] rounded-xl" />
                  ) : (trends?.trends || []).length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-xs text-[#94A3B8]">No trend data available</div>
                  ) : (
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends.trends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                          <Tooltip formatter={(v: any) => [`${v}%`, "Attendance"]} />
                          <Area type="monotone" dataKey="attendance" stroke="#6366F1" strokeWidth={2} fill="url(#attGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="col-span-5 flex flex-col gap-4">
                {/* Faculty Performance */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
                    <Users size={14} className="text-[#6366F1]" />
                    <span className="text-sm font-bold text-[#0F172A]">Faculty Performance</span>
                  </div>
                  <div className="overflow-auto max-h-[200px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#F8FAFC]">
                        <tr className="border-b border-[#E2E8F0]">
                          {["Faculty", "Subjects", "Pass Rate"].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8FAFC]">
                        {facultyLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i}>{[1, 2, 3].map(j => <td key={j} className="px-3 py-2"><div className="h-3 animate-pulse bg-[#F1F5F9] rounded" /></td>)}</tr>
                          ))
                        ) : (faculty?.faculty || []).length === 0 ? (
                          <tr><td colSpan={3} className="px-3 py-6 text-center text-[#94A3B8]">No faculty data</td></tr>
                        ) : (
                          (faculty?.faculty || []).map((f: any) => (
                            <tr key={f.faculty_id} className="hover:bg-[#F8FAFC]">
                              <td className="px-3 py-2">
                                <div className="font-semibold text-[#0F172A] truncate max-w-[120px]" title={f.faculty_name}>{f.faculty_name}</div>
                              </td>
                              <td className="px-3 py-2 text-[#475569]">{f.subjects_assigned}</td>
                              <td className="px-3 py-2">
                                <span className={`font-bold ${f.pass_rate < 50 ? "text-red-600" : "text-emerald-600"}`}>
                                  {f.pass_rate ?? "—"}%
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
                  <div className="text-sm font-bold text-[#0F172A] mb-4">Risk Distribution</div>
                  {riskLoading ? (
                    <div className="h-32 animate-pulse bg-[#F1F5F9] rounded-xl" />
                  ) : (riskDist?.distribution || []).length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-[#94A3B8]">No risk data available</div>
                  ) : (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskDist.distribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="range" tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={28}>
                            {(riskDist.distribution || []).map((_: any, i: number) => (
                              <Cell key={i} fill={RISK_COLORS[i]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["Low", "Low-Med", "Medium", "High", "Critical"].map((label, i) => (
                      <span key={label} className="flex items-center gap-1 text-[10px] text-[#64748B]">
                        <span className="w-2 h-2 rounded-sm" style={{ background: RISK_COLORS[i] }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && <ComparisonModal onClose={() => setShowCompare(false)} />}
      </AnimatePresence>
    </div>
  )
}
