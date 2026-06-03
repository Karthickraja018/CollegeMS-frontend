"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, User, Mail, Phone, Briefcase, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle, Calendar,
  Star, Activity, Users, BarChart3
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from "recharts"
import { useFacultyProfile } from "@/queries/principal/usePrincipalIntelligence"

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
          {p.name}: {p.value}{typeof p.value === 'number' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

export default function FacultyProfilePage() {
  const { id } = useParams<{ id: string }>()
  const userId = parseInt(id, 10)
  const { data, isLoading, error } = useFacultyProfile(userId)
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'global'>('attendance')

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
        <p className="text-slate-600 font-semibold">Faculty not found or access denied</p>
        <Link href="/principal/faculty" className="text-indigo-600 hover:underline text-sm">← Back to Faculty List</Link>
      </div>
    )
  }

  const { faculty, performance_trend, subjects, at_risk_students, failed_subject_students, low_attendance_students } = data

  // Grade the faculty
  const latestMetric = performance_trend[performance_trend.length - 1]
  const passRate = latestMetric?.student_pass_rate ?? 0
  const attSub = latestMetric?.attendance_submission_pct ?? 0
  const marksSub = latestMetric?.marks_submission_pct ?? 0
  const feedback = latestMetric?.feedback_score ?? 0

  let grade = "No Data"
  let gradeColor = "gray"
  if (passRate >= 80) { grade = "Excellent"; gradeColor = "green" }
  else if (passRate >= 65) { grade = "Good"; gradeColor = "blue" }
  else if (passRate >= 50) { grade = "Needs Attention"; gradeColor = "amber" }
  else if (passRate > 0) { grade = "Critical"; gradeColor = "red" }

  const badge = GRADE_BADGE[gradeColor]

  // Format trend data for chart
  const chartData = performance_trend.map(t => ({
    month: typeof t.month === 'string' ? t.month.slice(0, 7) : String(t.month),
    "Pass Rate": t.student_pass_rate ?? 0,
    "Att. Submission": t.attendance_submission_pct ?? 0,
    "Marks Submission": t.marks_submission_pct ?? 0,
  }))

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/principal/faculty"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900">{faculty.full_name}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: badge.bg, color: badge.text }}>
              {grade}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            {faculty.designation || faculty.role} · {faculty.dept_name} ({faculty.dept_code})
          </p>
        </div>
      </div>

      {/* Profile + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <BentoCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl font-black text-indigo-600">
              {faculty.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-slate-900">{faculty.full_name}</p>
              <p className="text-xs text-slate-400">{faculty.employee_id || "No ID"}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{faculty.email}</span>
            </div>
            {faculty.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <span>{faculty.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
              <span>{faculty.experience_years ? `${faculty.experience_years} years experience` : "Experience not recorded"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <BookOpen size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{faculty.qualification || "Not specified"}</span>
            </div>
            {faculty.last_login && (
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                <span>Last login: {new Date(faculty.last_login).toLocaleDateString("en-IN")}</span>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Current KPIs */}
        <BentoCard className="p-6 lg:col-span-2">
          <p className="text-sm font-bold text-slate-900 mb-5">Current Performance (Latest Month)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatPill label="Pass Rate" value={passRate ? `${passRate}%` : "—"} color={passRate >= 70 ? "#10B981" : passRate >= 55 ? "#D97706" : "#EF4444"} />
            <StatPill label="Att. Submission" value={attSub ? `${attSub}%` : "—"} color={attSub >= 85 ? "#10B981" : attSub >= 70 ? "#D97706" : "#EF4444"} />
            <StatPill label="Marks Submission" value={marksSub ? `${marksSub}%` : "—"} color={marksSub >= 85 ? "#10B981" : marksSub >= 70 ? "#D97706" : "#EF4444"} />
            <StatPill label="Feedback Score" value={feedback ? `${feedback}/5.0` : "—"} color={feedback >= 4 ? "#10B981" : feedback >= 3 ? "#D97706" : "#EF4444"} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{subjects.length}</p>
              <p className="text-xs text-slate-400 mt-1">Subjects Taught</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{latestMetric?.classes_conducted ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-1">Classes / Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-rose-600">{at_risk_students.length}</p>
              <p className="text-xs text-slate-400 mt-1">At-Risk Students</p>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* 6-Month Trend */}
      {chartData.length > 0 && (
        <BentoCard className="p-6">
          <p className="text-sm font-bold text-slate-900 mb-5">6-Month Performance Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Pass Rate" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Att. Submission" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="Marks Submission" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </BentoCard>
      )}

      {/* Subjects & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects Taught */}
        <BentoCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900">Subjects Taught</p>
            <p className="text-xs text-slate-400">Pass rate per subject</p>
          </div>
          {subjects.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No subjects assigned</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {subjects.map((sub, i) => {
                const pr = sub.pass_rate ?? 0
                return (
                  <motion.div key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-5 py-3 flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                      {sub.semester_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{sub.name}</p>
                      <p className="text-xs text-slate-400">{sub.code} · {sub.students_taught} students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black" style={{ color: pr >= 70 ? "#10B981" : pr >= 55 ? "#F59E0B" : "#EF4444" }}>
                        {pr ? `${pr}%` : "—"}
                      </p>
                      <p className="text-xs text-slate-400">pass rate</p>
                    </div>
                    <div className="w-2 h-8 rounded-full flex-shrink-0" style={{
                      background: pr >= 70 ? "#10B981" : pr >= 55 ? "#F59E0B" : "#EF4444",
                      opacity: 0.7
                    }} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </BentoCard>

        {/* At-Risk Students Tabs */}
        <BentoCard className="overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Students Needing Attention</p>
                <p className="text-xs text-slate-400">Categorized by risk factors</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'attendance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Low Attendance ({low_attendance_students.length})
              </button>
              <button 
                onClick={() => setActiveTab('marks')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'marks' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Subject Failures ({failed_subject_students.length})
              </button>
              <button 
                onClick={() => setActiveTab('global')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'global' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Globally At-Risk ({at_risk_students.length})
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {(() => {
              const list = activeTab === 'attendance' ? low_attendance_students 
                         : activeTab === 'marks' ? failed_subject_students 
                         : at_risk_students;
                         
              if (list.length === 0) {
                return (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
                    <CheckCircle size={28} className="text-emerald-400" />
                    <p className="text-sm font-semibold text-slate-600">No students in this category</p>
                    <p className="text-xs">Everyone is meeting the criteria.</p>
                  </div>
                )
              }
              
              return (
                <div className="divide-y divide-slate-100">
                  {list.map((s, i) => (
                    <motion.div key={s.student_id ?? s.id ?? i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.roll_number} · Sem {s.current_semester}</p>
                      </div>
                      
                      {activeTab === 'attendance' && (
                        <div className="text-right mr-2">
                          <p className="text-xs text-slate-400">Attendance</p>
                          <p className="text-sm font-black text-rose-600">{s.attendance_pct ?? "—"}%</p>
                        </div>
                      )}
                      
                      {activeTab === 'marks' && (
                        <div className="text-right mr-2">
                          <p className="text-xs text-slate-400">Avg Marks</p>
                          <p className="text-sm font-black text-rose-600">{s.avg_marks ?? "—"}%</p>
                        </div>
                      )}
                      
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        s.risk_level === 'critical' ? 'bg-rose-100 text-rose-700' :
                        s.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {s.risk_level.toUpperCase()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )
            })()}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}
