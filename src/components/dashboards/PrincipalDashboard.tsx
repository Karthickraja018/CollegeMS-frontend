"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  GraduationCap, BarChart3, TrendingUp, AlertTriangle,
  FileText, Brain, Bot, Users, Building2, Zap, AlertCircle,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { AcademicHealthScore } from "@/components/dashboards/AcademicHealthScore"
import { RecommendationCard } from "@/components/dashboards/RecommendationCard"
import { StatCard } from "@/components/ui/admin"
import {
  useDashboardKPIs,
  useDashboardInsights,
  useDepartmentRankings,
  useAttendanceTrend,
} from "@/queries/dashboard/useDashboard"
import { useUserStore } from "@/store"

// ─── AHS Color Map ────────────────────────────────────────────────────────────

const AHS_BADGE: Record<string, { bg: string; text: string }> = {
  green: { bg: "#ECFDF5", text: "#059669" },
  blue: { bg: "#EEF2FF", text: "#4F46E5" },
  amber: { bg: "#FFFBEB", text: "#D97706" },
  red: { bg: "#FEF2F2", text: "#DC2626" },
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  label,
  color,
  href,
}: {
  icon: React.ElementType
  label: string
  color: string
  href: string
}) {
  const router = useRouter()
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(href)}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white hover:shadow-lg transition-all duration-200"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-[#475569] text-center leading-tight">{label}</span>
    </motion.button>
  )
}

// ─── Area Chart Tooltip ───────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#0F172A] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  )
}

// ─── Principal Dashboard ──────────────────────────────────────────────────────

export function PrincipalDashboard() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)

  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: insights, isLoading: insightsLoading } = useDashboardInsights()
  const { data: rankings, isLoading: rankingsLoading } = useDepartmentRankings()
  const { data: trend, isLoading: trendLoading } = useAttendanceTrend(6)

  const institutionName = (user as any)?.institution_name ?? "Institution"

  // KPI cards
  const kpiCards = [
    {
      label: "Total Students",
      value: kpis?.total_students ?? "—",
      icon: GraduationCap,
      color: "#6366F1",
    },
    {
      label: "Avg Attendance",
      value: kpis?.avg_attendance != null ? `${kpis.avg_attendance}%` : "—",
      icon: BarChart3,
      color: "#10B981",
    },
    {
      label: "Pass Rate",
      value: kpis?.pass_rate != null ? `${kpis.pass_rate}%` : "—",
      icon: TrendingUp,
      color: "#8B5CF6",
    },
    {
      label: "At-Risk Students",
      value: kpis?.at_risk_students ?? "—",
      icon: AlertTriangle,
      color: "#EF4444",
    },
    {
      label: "Reports Generated",
      value: kpis?.total_reports ?? "—",
      icon: FileText,
      color: "#F59E0B",
    },
    {
      label: "AI Queries",
      value: kpis?.total_ai_queries ?? "—",
      icon: Brain,
      color: "#14B8A6",
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── HERO GRADIENT BANNER ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-8 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-4 right-32 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                Executive Intelligence Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {institutionName}
            </h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">
              Principal Dashboard · Real-time Academic Overview
            </p>
          </div>

          {/* Quick Actions in banner */}
          <div className="flex items-center gap-2 flex-wrap">
            <QuickAction icon={Bot} label="AI Copilot" color="#818CF8" href="/ai-copilot" />
            <QuickAction icon={GraduationCap} label="Student Intel" color="#34D399" href="/student-intelligence" />
            <QuickAction icon={Building2} label="Dept Intel" color="#FBBF24" href="/analytics/departments" />
            <QuickAction icon={FileText} label="Reports" color="#F87171" href="/reports" />
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card, i) =>
          kpisLoading ? (
            <div
              key={i}
              className="h-28 rounded-2xl bg-[#F8FAFC] animate-pulse border border-[#E2E8F0]"
            />
          ) : (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              index={i}
            />
          )
        )}
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5">
        {/* AHS Widget */}
        <AcademicHealthScore data={kpis?.academic_health} loading={kpisLoading} />

        {/* Right column */}
        <div className="space-y-5">
          {/* Attendance Trend */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Attendance & Pass Rate Trend</p>
                <p className="text-xs text-[#94A3B8]">Last 6 months</p>
              </div>
            </div>
            {trendLoading ? (
              <div className="h-48 rounded-xl bg-[#F8FAFC] animate-pulse" />
            ) : !trend || trend.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-xs text-[#94A3B8]">No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={192}>
                <AreaChart data={trend} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fill="url(#attendanceGrad)"
                    name="Attendance"
                  />
                  <Area
                    type="monotone"
                    dataKey="pass_rate"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#passGrad)"
                    name="Pass Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── DEPARTMENT RANKINGS ───────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Department Rankings</p>
            <p className="text-xs text-[#94A3B8]">Academic Health Score leaderboard</p>
          </div>
          <Users size={16} className="text-[#94A3B8]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                {["Rank", "Department", "AHS Score", "Attendance %", "Pass Rate %", "At-Risk"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {rankingsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : !rankings || rankings.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                        <AlertCircle size={24} strokeWidth={1.5} />
                        <p className="text-xs font-medium">No department rankings available</p>
                      </div>
                    </td>
                  </tr>
                )
                : rankings.map((dept, i) => {
                    const badge = AHS_BADGE[dept.ahs_color] ?? AHS_BADGE.blue
                    return (
                      <motion.tr
                        key={dept.department_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-xs font-bold text-[#475569]">
                            #{dept.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {dept.department_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {dept.ahs_score} · {dept.ahs_grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#334155]">
                          {dept.attendance_rate}%
                        </td>
                        <td className="px-4 py-3 font-medium text-[#334155]">
                          {dept.pass_rate}%
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              dept.at_risk_count > 10
                                ? "bg-red-50 text-red-600"
                                : dept.at_risk_count > 5
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {dept.at_risk_count}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INSIGHTS & RECOMMENDATIONS ────────────────────────────────────── */}
      {(insightsLoading || insights?.recommendations?.length) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#F59E0B]" />
            <p className="text-sm font-bold text-[#0F172A]">AI Recommendations</p>
          </div>
          {insightsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#F8FAFC] animate-pulse border border-[#E2E8F0]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {insights!.recommendations.slice(0, 6).map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
