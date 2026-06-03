"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import {
  AlertCircle, Zap, TrendingUp, Search, Bell, User, Cpu, UserCog, RefreshCw, Settings2, Activity, BookOpen
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts"
import { StatCard } from "@/components/ui/admin"
import { AcademicHealthScore } from "@/components/dashboards/AcademicHealthScore"
import {
  useDashboardKPIs, useDashboardInsights, useDepartmentRankings, useAttendanceTrend
} from "@/queries/dashboard/useDashboard"
import { RecommendationCard } from "@/components/dashboards/RecommendationCard"

// ─── Header Component ─────────────────────────────────────────────────────────

function DashboardHeader({ score, loading }: { score?: number, loading: boolean }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">Good Morning, Admin</h1>
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="text-[#64748B]">Academic Health Score: <span className="text-[#0F172A] font-bold">{loading ? "..." : score ?? "—"}</span></span>
          <span className="text-[#E2E8F0]">•</span>
          <span className="text-[#10B981]">Institution Status: Healthy</span>
          <span className="text-[#E2E8F0]">•</span>
          <span className="text-[#94A3B8]">Last Updated: Just now</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          <Search size={18} />
        </button>
        <button className="w-10 h-10 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          <Bell size={18} />
        </button>
        <button className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] transition-colors">
          <User size={18} />
        </button>
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

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

// ─── Insight Card ─────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#3730A3",
  high: "#4F46E5",
  medium: "#4F46E5",
  low: "#94A3B8",
}

function InsightPill({ insight }: { insight: { title: string; description: string; severity: string } }) {
  const color = SEVERITY_COLORS[insight.severity?.toLowerCase()] ?? "#94A3B8"
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm mb-3">
      <span
        className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <div>
        <p className="text-sm font-bold text-[#0F172A]">{insight.title}</p>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{insight.description}</p>
      </div>
    </div>
  )
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QuickAction({ label }: { label: string }) {
  return (
    <button className="px-4 py-2 text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] rounded-lg hover:bg-[#E0E7FF] transition-colors text-center w-full whitespace-nowrap">
      {label}
    </button>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: insights, isLoading: insightsLoading } = useDashboardInsights()
  const { data: deptRankings, isLoading: deptLoading } = useDepartmentRankings()
  const { data: trendData, isLoading: trendLoading } = useAttendanceTrend(6)

  // Top Actionable Metrics
  const statCards = useMemo(() => [
    { label: "Academic Health Score", value: kpis?.academic_health?.score ?? "—", icon: Activity, trend: kpis?.trends?.academic_health },
    { label: "Attendance Rate", value: kpis?.avg_attendance ? `${kpis.avg_attendance}%` : "—", icon: TrendingUp, trend: kpis?.trends?.attendance },
    { label: "Students At Risk", value: kpis?.at_risk_students ?? "—", icon: AlertCircle, trend: kpis?.trends?.at_risk },
    { label: "Pass Rate", value: kpis?.pass_percentage ? `${kpis.pass_percentage}%` : "—", icon: BookOpen, trend: kpis?.trends?.pass_percentage },
    { label: "AI Queries Today", value: kpis?.ai_queries_today ?? "—", icon: Cpu, trend: kpis?.trends?.ai_queries },
    { label: "Departments Below Target", value: kpis?.departments_below_target ?? "—", icon: AlertCircle },
  ], [kpis])

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader score={kpis?.academic_health?.score} loading={kpisLoading} />

      {/* Actionable Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) =>
          kpisLoading ? (
            <div key={i} className="h-[120px] rounded-2xl bg-[#F8FAFC] animate-pulse border border-[#E2E8F0]" />
          ) : (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              trend={card.trend}
              color="#4F46E5"
              index={i}
            />
          )
        )}
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROW 1 */}
        {/* Academic Health Score */}
        <div className="h-full">
          <AcademicHealthScore
            data={kpis?.academic_health}
            loading={kpisLoading}
          />
        </div>

        {/* AI Command Center */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
                <Cpu size={16} />
              </div>
              <h2 className="text-lg font-bold text-[#0F172A]">CollegeMS AI Command Center</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 border-l-2 border-[#4F46E5] pl-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {kpis?.at_risk_students ?? "5"} students are at academic risk
                </p>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-[#E2E8F0] pl-3">
                <p className="text-sm text-[#475569]">
                  Attendance improved 2.3% across the institution.
                </p>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-[#E2E8F0] pl-3">
                <p className="text-sm text-[#475569]">
                  ECE leads all departments in performance.
                </p>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-[#3730A3] pl-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  Mechanical attendance declined by 1.2% this week.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-auto">
            <QuickAction label="Generate Report" />
            <QuickAction label="Risk Analysis" />
            <QuickAction label="Attendance Review" />
            <QuickAction label="Dept Comparison" />
          </div>
        </div>

        {/* ROW 2 */}
        {/* Attendance Trend */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-[18px] font-bold text-[#0F172A]">Attendance Trend</h2>
            <p className="text-xs text-[#64748B]">Last 6 months progression</p>
          </div>
          {trendLoading ? (
            <div className="h-[220px] bg-[#F8FAFC] animate-pulse rounded-xl border border-[#E2E8F0]" />
          ) : !trendData || trendData.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-[#94A3B8]">
              <AlertCircle size={28} strokeWidth={1.5} />
              <p className="text-xs font-medium">No data available. Run AI Analysis.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} domain={['auto', 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Department Ranking */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-[18px] font-bold text-[#0F172A]">Department Ranking</h2>
            <p className="text-xs text-[#64748B]">By Academic Health Score</p>
          </div>
          {deptLoading ? (
            <div className="h-[220px] bg-[#F8FAFC] animate-pulse rounded-xl border border-[#E2E8F0]" />
          ) : !deptRankings || deptRankings.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-[#94A3B8]">
              <AlertCircle size={28} strokeWidth={1.5} />
              <p className="text-xs font-medium">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptRankings} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="department_name" tick={{ fontSize: 11, fill: "#0F172A", fontWeight: 600 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="ahs_score" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ROW 3 */}
        {/* Critical Alerts */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-[#0F172A]">Critical Alerts</h2>
            <span className="text-xs font-bold bg-[#EEF2FF] text-[#4F46E5] px-2 py-1 rounded">Action Required</span>
          </div>
          {insightsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#F8FAFC] animate-pulse rounded-xl border border-[#E2E8F0]" />)}
            </div>
          ) : !insights?.recommendations || insights.recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#94A3B8]">
              <AlertCircle size={28} strokeWidth={1.5} />
              <p className="text-xs font-medium">No critical alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.recommendations.slice(0, 3).map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Live Insights */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-[#4F46E5] fill-current" />
            <h2 className="text-[18px] font-bold text-[#0F172A]">Live Insights</h2>
          </div>
          {insightsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#F8FAFC] animate-pulse rounded-xl border border-[#E2E8F0]" />)}
            </div>
          ) : !insights?.insights || insights.insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#94A3B8]">
              <Zap size={28} strokeWidth={1.5} />
              <p className="text-xs font-medium">No insights generated yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {insights.insights.slice(0, 4).map((ins, i) => (
                <InsightPill key={i} insight={ins} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
