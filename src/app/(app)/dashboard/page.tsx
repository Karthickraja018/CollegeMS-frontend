"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardApi, analyticsApi } from "@/services/admin"
import { StatCard } from "@/components/ui/admin"
import {
  Users, GraduationCap, Building2, BookOpen, Calendar,
  TrendingUp, CheckCircle, AlertTriangle, Briefcase,
  DollarSign, FileText, Cpu, Sparkles, ArrowRight,
  Activity, Upload, MessageSquare, Clock, RefreshCw,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xl text-sm">
      <p className="font-bold text-[#0F172A] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-3 mb-1">
          <span className="flex items-center gap-2 text-[#64748B]">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <strong className="ml-auto text-[#0F172A]">
            {typeof p.value === "number" ? `${p.value}${p.name.includes("Att") ? "%" : ""}` : p.value}
          </strong>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Insight Card
// ─────────────────────────────────────────────────────────────────────────────

const insightColors: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", dot: "bg-amber-500" },
  critical: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", dot: "bg-red-500" },
  success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", dot: "bg-emerald-500" },
  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", dot: "bg-blue-500" },
}

const insightIcons: Record<string, React.ElementType> = {
  "alert-triangle": AlertTriangle,
  "trending-up": TrendingUp,
  "users": Users,
  "dollar-sign": DollarSign,
  "briefcase": Briefcase,
  "award": CheckCircle,
}

function InsightCard({ insight, idx }: { insight: any; idx: number }) {
  const colors = insightColors[insight.type] || insightColors.info
  const Icon = insightIcons[insight.icon] || AlertTriangle
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`flex gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border}`}
    >
      <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon size={16} className={colors.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#0F172A] leading-snug">{insight.title}</div>
        <div className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{insight.body}</div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action Card
// ─────────────────────────────────────────────────────────────────────────────

function QuickAction({ href, icon: Icon, label, desc, color }: {
  href: string; icon: React.ElementType; label: string; desc: string; color: string
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all group cursor-pointer">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#0F172A]">{label}</div>
          <div className="text-xs text-[#94A3B8]">{desc}</div>
        </div>
        <ArrowRight size={14} className="text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors" />
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [insightsOpen, setInsightsOpen] = useState(true)

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: dashboardApi.getKPIs,
    staleTime: 60_000,
  })

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ["admin-insights"],
    queryFn: dashboardApi.getInsights,
    staleTime: 120_000,
  })

  const { data: attendanceTrend } = useQuery({
    queryKey: ["attendance-trend"],
    queryFn: () => analyticsApi.getAttendanceTrend(6),
    staleTime: 120_000,
  })

  const { data: deptPerf } = useQuery({
    queryKey: ["dept-performance"],
    queryFn: analyticsApi.getDepartmentPerformance,
    staleTime: 120_000,
  })

  const fmt = (n: number | undefined, suffix = "") =>
    n === undefined ? "—" : `${n.toLocaleString()}${suffix}`
  const fmtPct = (n: number | undefined) => (n === undefined ? "—" : `${n}%`)

  const kpiCards = [
    { label: "Total Students", value: fmt(kpis?.total_students), icon: GraduationCap, color: "#6366F1", trend: undefined },
    { label: "Total Faculty", value: fmt(kpis?.total_faculty), icon: UserCheck_, color: "#8B5CF6", trend: undefined },
    { label: "Departments", value: fmt(kpis?.total_departments), icon: Building2, color: "#EC4899", trend: undefined },
    { label: "Programs", value: fmt(kpis?.total_programs), icon: BookOpen, color: "#F59E0B", trend: undefined },
    { label: "Active Semesters", value: fmt(kpis?.active_semesters), icon: Calendar, color: "#14B8A6", trend: undefined },
    { label: "Avg Attendance", value: fmtPct(kpis?.avg_attendance), icon: TrendingUp, color: "#10B981", trend: undefined },
    { label: "Pass Percentage", value: fmtPct(kpis?.pass_percentage), icon: CheckCircle, color: "#3B82F6", trend: undefined },
    { label: "At-Risk Students", value: fmt(kpis?.at_risk_students), icon: AlertTriangle, color: "#EF4444", trend: undefined },
    { label: "Placement Rate", value: fmtPct(kpis?.placement_rate), icon: Briefcase, color: "#6366F1", trend: undefined },
    { label: "Fee Collected", value: kpis ? `₹${(kpis.fee_collected / 100000).toFixed(1)}L` : "—", icon: DollarSign, color: "#10B981", trend: undefined },
    { label: "Reports Generated", value: fmt(kpis?.reports_generated), icon: FileText, color: "#8B5CF6", trend: undefined },
    { label: "AI Queries", value: fmt(kpis?.ai_queries_processed), icon: Cpu, color: "#F59E0B", trend: undefined },
  ]

  const insights = insightsData?.insights || []

  return (
    <div className="flex flex-col gap-8 max-w-[1600px]">

      {/* Header */}
      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              System Dashboard
            </h1>
            <p className="text-sm text-[#94A3B8] mt-0.5 font-medium">
              Real-time overview of all college operations
            </p>
          </div>
          <button
            onClick={() => refetchKPIs()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* AI Insights Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-5 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Sparkles size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">AI Platform Intelligence</h3>
              <p className="text-white/75 text-xs mt-0.5">
                {insightsLoading ? "Analyzing live data…" : `${insights.length} insights generated from your current data`}
              </p>
            </div>
            <button
              onClick={() => setInsightsOpen(!insightsOpen)}
              className="text-white/80 hover:text-white text-xs font-semibold transition-colors"
            >
              {insightsOpen ? "Hide" : "Show insights"}
            </button>
          </div>

          <AnimatePresence>
            {insightsOpen && insights.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {insights.slice(0, 3).map((ins: any, i: number) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm border border-white/20">
                      <div className="font-semibold">{ins.title}</div>
                      <div className="text-white/70 text-xs mt-0.5 line-clamp-2">{ins.body}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 12 KPI Grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {kpiCards.map((card, i) => (
            kpisLoading ? (
              <div key={card.label} className="h-28 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
            ) : (
              <StatCard key={card.label} index={i} {...card} />
            )
          ))}
        </div>
      </section>

      {/* Charts + Panels Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Charts Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Attendance Trend */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Attendance Trends</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Monthly college-wide attendance rate</p>
              </div>
              <Link href="/analytics" className="text-xs font-semibold text-[#6366F1] hover:underline flex items-center gap-1">
                Full analytics <ArrowRight size={12} />
              </Link>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis domain={[60, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#6366F1" strokeWidth={2.5} fill="url(#attGrad)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Comparison */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Department Performance</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Attendance vs. average marks by department</p>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerf || []} barGap={4} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="code" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFC" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#64748B", paddingTop: 10 }} iconType="circle" />
                  <Bar dataKey="attendance_pct" name="Attendance" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
                  <Bar dataKey="avg_marks_pct" name="Avg Marks" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* Live Insights Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">Live Insights</h3>
              <Sparkles size={16} className="text-[#6366F1]" />
            </div>
            {insightsLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-[#F8FAFC] animate-pulse" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8 text-[#94A3B8] text-sm">No insights yet. Add data to generate insights.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {insights.map((ins: any, i: number) => (
                  <InsightCard key={i} insight={ins} idx={i} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-[#0F172A] mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-1">
              <QuickAction href="/chat" icon={MessageSquare} label="AI Assistant" desc="Query your database" color="#6366F1" />
              <QuickAction href="/upload" icon={Upload} label="Import Data" desc="Upload CSV / Excel" color="#14B8A6" />
              <QuickAction href="/reports" icon={FileText} label="Generate Report" desc="PDF, DOCX, XLSX" color="#F59E0B" />
              <QuickAction href="/admin/students/at-risk" icon={AlertTriangle} label="At-Risk Students" desc="View risk dashboard" color="#EF4444" />
              <QuickAction href="/admin/users" icon={Users} label="Manage Users" desc="Create & edit accounts" color="#8B5CF6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Workaround for import collision — Users vs UserCheck
const UserCheck_ = Users
