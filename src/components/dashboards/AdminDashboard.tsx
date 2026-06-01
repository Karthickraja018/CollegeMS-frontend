"use client"

import { motion } from "framer-motion"
import {
  Users, GraduationCap, Building2, BookOpen,
  FileText, Brain, CalendarCheck, Layers,
  UserCog, RefreshCw, Cpu, Settings2, ExternalLink,
  Zap, AlertCircle,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { StatCard } from "@/components/ui/admin"
import { AcademicHealthScore } from "@/components/dashboards/AcademicHealthScore"
import {
  useDashboardKPIs, useDashboardInsights, useDeptPerformance,
} from "@/queries/dashboard/useDashboard"
import { RecommendationCard } from "@/components/dashboards/RecommendationCard"

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType
  label: string
  color: string
  onClick?: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#C7D2FE] hover:shadow-md transition-all duration-200 group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-[#475569] group-hover:text-[#0F172A] text-center leading-tight">
        {label}
      </span>
    </motion.button>
  )
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#6366F1",
  low: "#94A3B8",
}

function InsightPill({ insight }: { insight: { title: string; description: string; severity: string } }) {
  const color = SEVERITY_COLORS[insight.severity?.toLowerCase()] ?? "#94A3B8"
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
      <span
        className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <div>
        <p className="text-xs font-bold text-[#334155]">{insight.title}</p>
        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">{insight.description}</p>
      </div>
    </div>
  )
}

// ─── Custom Bar Chart Tooltip ─────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#0F172A] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: insights, isLoading: insightsLoading } = useDashboardInsights()
  const { data: deptPerf, isLoading: deptLoading } = useDeptPerformance()

  // Stat cards config
  const statCards = [
    { label: "Total Users", value: kpis?.total_users ?? "—", icon: Users, color: "#6366F1" },
    { label: "Students", value: kpis?.total_students ?? "—", icon: GraduationCap, color: "#10B981" },
    { label: "Departments", value: kpis?.total_departments ?? "—", icon: Building2, color: "#8B5CF6" },
    { label: "Faculty", value: kpis?.total_faculty ?? "—", icon: BookOpen, color: "#14B8A6" },
    { label: "Reports", value: kpis?.total_reports ?? "—", icon: FileText, color: "#F59E0B" },
    { label: "AI Queries", value: kpis?.total_ai_queries ?? "—", icon: Brain, color: "#EF4444" },
    { label: "Active Semesters", value: kpis?.active_semesters ?? "—", icon: CalendarCheck, color: "#0EA5E9" },
    { label: "Programs", value: kpis?.total_programs ?? "—", icon: Layers, color: "#F97316" },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {statCards.map((card, i) =>
          kpisLoading ? (
            <div key={i} className="h-28 rounded-2xl bg-[#F8FAFC] animate-pulse border border-[#E2E8F0]" />
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-5">
        {/* AHS */}
        <AcademicHealthScore
          data={kpis?.academic_health}
          loading={kpisLoading}
        />

        {/* Dept Performance Bar Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Department Performance</p>
              <p className="text-xs text-[#94A3B8]">AHS Score by department</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#6366F1]/10 text-[#6366F1]">
              Live
            </span>
          </div>
          {deptLoading ? (
            <div className="h-56 rounded-xl bg-[#F8FAFC] animate-pulse" />
          ) : !deptPerf || deptPerf.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center gap-2 text-[#94A3B8]">
              <AlertCircle size={28} strokeWidth={1.5} />
              <p className="text-xs font-medium">No department data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={deptPerf} barSize={18} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ahs_score" fill="#6366F1" radius={[6, 6, 0, 0]} name="AHS Score" />
                <Bar dataKey="attendance" fill="#10B981" radius={[6, 6, 0, 0]} name="Attendance %" />
                <Bar dataKey="pass_rate" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Live Insights */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#F59E0B]" />
            <p className="text-sm font-bold text-[#0F172A]">Live Insights</p>
          </div>
          {insightsLoading ? (
            <div className="space-y-2 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[#F8FAFC] animate-pulse" />
              ))}
            </div>
          ) : !insights?.insights?.length ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-[#94A3B8] text-center">No insights yet. Run an AI analysis.</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {insights.insights.slice(0, 5).map((ins, i) => (
                <InsightPill key={i} insight={ins} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {(insightsLoading || (insights?.recommendations && insights.recommendations.length > 0)) && (
        <div>
          <p className="text-sm font-bold text-[#0F172A] mb-3">AI Recommendations</p>
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

      {/* Quick Actions */}
      <div>
        <p className="text-sm font-bold text-[#0F172A] mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={UserCog} label="Manage Users" color="#6366F1" />
          <QuickAction icon={RefreshCw} label="Data Sync" color="#10B981" />
          <QuickAction icon={Cpu} label="AI Operations" color="#8B5CF6" />
          <QuickAction icon={Settings2} label="Academic Setup" color="#F59E0B" />
        </div>
      </div>
    </div>
  )
}
