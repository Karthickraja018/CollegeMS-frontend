"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { GraduationCap, Users, TrendingUp, AlertTriangle, BookOpen, Lightbulb } from "lucide-react"
import { useDashboardKPIs, useDashboardInsights } from "@/queries/dashboard/useDashboard"
import { useUserStore } from "@/store"
import { AcademicHealthScore } from "./AcademicHealthScore"
import { RecommendationCard } from "./RecommendationCard"

function KPICard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
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

export function HodDashboard() {
  const user = useUserStore((s) => s.user)
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: insightsData, isLoading: insightsLoading } = useDashboardInsights()

  const insights = insightsData?.insights ?? []
  const recommendations = insightsData?.recommendations ?? []

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Department Dashboard</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {user?.full_name ? `Welcome, ${user.full_name}` : "Department Intelligence"} · HOD View
          </p>
        </div>
      </div>

      {/* AHS Hero + KPIs */}
      <div className="grid grid-cols-12 gap-5">
        {/* AHS Card */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 h-full flex flex-col justify-center">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Department Health</div>
            {kpisLoading ? (
              <div className="h-32 animate-pulse bg-[#F1F5F9] rounded-xl" />
            ) : (
              <AcademicHealthScore data={kpis?.academic_health} />
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="col-span-8 grid grid-cols-2 gap-4">
          {kpisLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-[#F1F5F9] rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              <KPICard label="Total Students" value={kpis?.total_students ?? 0} icon={GraduationCap} color="#6366F1" sub="Active in department" />
              <KPICard label="Attendance Rate" value={`${kpis?.avg_attendance ?? 0}%`} icon={TrendingUp} color="#10B981"
                sub={(kpis?.avg_attendance ?? 100) < 75 ? "⚠ Below 75% threshold" : "On track"} />
              <KPICard label="At Risk Students" value={kpis?.at_risk_students ?? 0} icon={AlertTriangle} color="#EF4444" sub="Risk score ≥ 60" />
              <KPICard label="Faculty Count" value={kpis?.dept_faculty ?? kpis?.faculty_count ?? 0} icon={Users} color="#8B5CF6" sub="Active in dept" />
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-12 gap-5">
        {/* Pass Rate + Subjects */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Academic Metrics</div>
            {kpisLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-12 animate-pulse bg-[#F1F5F9] rounded-lg" />)}</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#94A3B8]">Pass Rate</div>
                    <div className={`text-xl font-bold ${(kpis?.pass_percentage ?? kpis?.pass_rate ?? 100) < 50 ? "text-red-600" : "text-emerald-600"}`}>
                      {kpis?.pass_percentage ?? kpis?.pass_rate ?? 0}%
                    </div>
                  </div>
                  <BookOpen size={20} className="text-[#6366F1]" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#94A3B8]">Active Subjects</div>
                    <div className="text-xl font-bold text-[#0F172A]">{kpis?.dept_subjects ?? 0}</div>
                  </div>
                  <GraduationCap size={20} className="text-[#8B5CF6]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Quick Actions</div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Student Intelligence", href: "/dashboard", color: "#6366F1" },
                { label: "Department Analytics", href: "/dashboard", color: "#10B981" },
                { label: "AI Copilot", href: "/chat", color: "#8B5CF6" },
                { label: "Department Reports", href: "/accreditation", color: "#F59E0B" },
              ].map(action => (
                <a key={action.label} href={action.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:translate-x-0.5"
                  style={{ color: action.color, background: `${action.color}10` }}
                >
                  {action.label} →
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Insights */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb size={12} /> Department Insights
            </div>
            {insightsLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-[#F1F5F9] rounded-xl" />)}</div>
            ) : insights.length === 0 ? (
              <div className="text-sm text-[#94A3B8] text-center py-4">No insights at this time. Department is performing well.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {insights.map((insight: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                      insight.type === "critical" ? "bg-red-50 border-red-200 text-red-800" :
                      insight.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                      "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">{insight.title}</div>
                      <div className="text-xs mt-0.5 opacity-80">{insight.body}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Recommended Actions</div>
            {insightsLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-20 animate-pulse bg-[#F1F5F9] rounded-xl" />)}</div>
            ) : recommendations.length === 0 ? (
              <div className="text-sm text-[#94A3B8] text-center py-4">No recommendations. Keep up the good work!</div>
            ) : (
              <div className="flex flex-col gap-3">
                {recommendations.slice(0, 3).map((rec: any, i: number) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
