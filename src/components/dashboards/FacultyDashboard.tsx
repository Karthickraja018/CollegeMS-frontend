"use client"

import { motion } from "framer-motion"
import { GraduationCap, AlertTriangle, TrendingUp, BookOpen, MessageSquare, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDashboardKPIs } from "@/queries/dashboard/useDashboard"
import { useAtRiskStudents } from "@/queries/students/useStudentIntelligence"
import { useUserStore } from "@/store"

function KPICard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#0F172A]">{value ?? "—"}</div>
      {sub && <div className="text-xs text-[#94A3B8] mt-1">{sub}</div>}
    </motion.div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-amber-100 text-amber-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-emerald-100 text-emerald-700",
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[level] || styles.low}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

export function FacultyDashboard() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: atRiskData, isLoading: riskLoading } = useAtRiskStudents({ page: 1, page_size: 5 })

  const topAtRisk = atRiskData?.data ?? []

  return (
    <div className="flex flex-col gap-6 max-w-[1000px]">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">My Students</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          {user?.full_name ? `Welcome, ${user.full_name}` : "Faculty View"} · Assigned students only
        </p>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#F1F5F9] rounded-2xl animate-pulse" />
          ))
        ) : (
          <>
            <KPICard label="Assigned Students" value={kpis?.total_students ?? 0} icon={GraduationCap} color="#6366F1" sub="In your subjects" />
            <KPICard label="At Risk" value={kpis?.at_risk_students ?? 0} icon={AlertTriangle} color="#EF4444" sub="Need attention" />
            <KPICard label="Avg Attendance" value={`${kpis?.avg_attendance ?? 0}%`} icon={TrendingUp} color="#10B981"
              sub={(kpis?.avg_attendance ?? 100) < 75 ? "Below threshold" : "Healthy"} />
            <KPICard label="Subjects" value={kpis?.assigned_subjects ?? 0} icon={BookOpen} color="#8B5CF6" sub="Assigned to you" />
          </>
        )}
      </div>

      {/* At-Risk Students List + Quick Actions */}
      <div className="grid grid-cols-12 gap-5">

        {/* At-Risk Table */}
        <div className="col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="text-sm font-bold text-[#0F172A]">Students Needing Attention</div>
            <button
              onClick={() => router.push("/intelligence/students")}
              className="text-xs text-[#6366F1] font-semibold hover:underline"
            >
              View All →
            </button>
          </div>

          {riskLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#F1F5F9] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topAtRisk.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <GraduationCap size={32} className="text-[#CBD5E1]" />
              <div className="text-sm text-[#94A3B8] font-medium">No at-risk students</div>
              <div className="text-xs text-[#CBD5E1]">All assigned students are performing well</div>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {topAtRisk.map((student: any, i: number) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/intelligence/students`)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {student.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A] truncate">{student.name}</div>
                    <div className="text-xs text-[#94A3B8]">{student.roll_number} · Sem {student.current_semester}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${student.attendance_pct < 75 ? "text-red-600" : "text-emerald-600"}`}>
                        {student.attendance_pct}%
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">Attendance</div>
                    </div>
                    <RiskBadge level={student.risk_level} />
                    <ChevronRight size={14} className="text-[#CBD5E1]" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Quick Actions</div>
            <div className="flex flex-col gap-2">
              {[
                { label: "View All Students", href: "/intelligence/students", icon: GraduationCap, color: "#6366F1" },
                { label: "Critical Risk Alerts", href: "/intelligence/students?risk_level=critical", icon: AlertTriangle, color: "#EF4444" },
                { label: "AI Copilot", href: "/chat", icon: MessageSquare, color: "#8B5CF6" },
              ].map(action => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all hover:shadow-sm hover:translate-x-0.5"
                  style={{ borderColor: `${action.color}30`, background: `${action.color}08`, color: action.color }}
                >
                  <action.icon size={16} />
                  {action.label}
                </a>
              ))}
            </div>
          </div>

          {/* Health summary */}
          {!kpisLoading && (
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl p-5 text-white">
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Pass Rate</div>
              <div className="text-3xl font-bold">{kpis?.pass_percentage ?? kpis?.pass_rate ?? 0}%</div>
              <div className="text-xs opacity-70 mt-1">Across your subjects</div>
              <div className={`mt-3 text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                (kpis?.pass_percentage ?? kpis?.pass_rate ?? 0) >= 60 ? "bg-white/20" : "bg-red-400/30"
              }`}>
                {(kpis?.pass_percentage ?? kpis?.pass_rate ?? 0) >= 60 ? "On Track" : "Needs Attention"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
