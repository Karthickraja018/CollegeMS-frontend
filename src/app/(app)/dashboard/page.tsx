"use client"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import {
  Users, TrendingUp, AlertTriangle, CheckCircle, FileText, Upload,
  MessageSquare, Sparkles, ArrowUpRight, ArrowDownRight, Activity, Clock
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts"
import { formatPercentage } from "@/lib/utils"
import { useState } from "react"
import { motion } from "framer-motion"

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-[#0F172A] mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-4 mb-1">
            <span className="flex items-center gap-2 text-[#475569]">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <strong className="text-[#0F172A] ml-auto">
              {typeof p.value === "number" ? `${p.value}%` : p.value}
            </strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function StatCard({ label, value, icon: Icon, trend, trendLabel, sparklineData }: any) {
  const isPositive = trend && trend >= 0
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#475569]">
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-[#475569] text-sm font-medium mb-1">{label}</div>
        <div className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</div>
      </div>
      {/* Sparkline */}
      {sparklineData && (
        <div className="h-10 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke={isPositive ? "#10B981" : "#6366F1"} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {trendLabel && <div className="text-xs font-medium text-[#94A3B8] mt-4 pt-4 border-t border-[#E2E8F0]">{trendLabel}</div>}
    </motion.div>
  )
}

function ActionCard({ title, desc, icon: Icon, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:border-[#6366F1] hover:shadow-md cursor-pointer transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] group-hover:bg-[#6366F1]/10 flex items-center justify-center transition-colors">
        <Icon size={24} className="text-[#475569] group-hover:text-[#6366F1] transition-colors" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#0F172A]">{title}</div>
        <div className="text-xs text-[#475569] mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

// --- Main Page ---

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/analytics/dashboard").then(r => r.data),
  })

  const { data: trend } = useQuery({
    queryKey: ["attendance-trend"],
    queryFn: () => api.get("/analytics/attendance-trend").then(r => r.data),
  })

  const { data: deptPerf } = useQuery({
    queryKey: ["dept-performance"],
    queryFn: () => api.get("/analytics/department-performance").then(r => r.data),
  })

  // Mock sparkline data for aesthetic
  const mockSparkline1 = [{ value: 30 }, { value: 40 }, { value: 35 }, { value: 50 }, { value: 45 }, { value: 60 }]
  const mockSparkline2 = [{ value: 80 }, { value: 85 }, { value: 82 }, { value: 88 }, { value: 89 }, { value: 92 }]

  const kpis = [
    { label: "Total Students", value: statsLoading ? "—" : stats?.total_students ?? 0, icon: Users, trend: 12, trendLabel: "vs last month", sparklineData: mockSparkline1 },
    { label: "Avg Attendance", value: statsLoading ? "—" : formatPercentage(stats?.avg_attendance), icon: TrendingUp, trend: 4.2, trendLabel: "vs last month", sparklineData: mockSparkline2 },
    { label: "At-Risk Students", value: statsLoading ? "—" : stats?.at_risk_count ?? 0, icon: AlertTriangle, trend: -15, trendLabel: "vs last week" },
    { label: "Pass Percentage", value: statsLoading ? "—" : formatPercentage(stats?.pass_percentage), icon: CheckCircle, trend: 2.1, trendLabel: "Overall marks" },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-[1600px]">
      
      {/* Hero Section */}
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Welcome back, Administrator 👋</h1>
          <p className="text-sm font-medium text-[#475569] mt-1">
            College of Engineering • Academic Year 2026 • Last synced just now
          </p>
        </div>

        {/* AI Summary Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
            <Sparkles size={28} className="text-[#6366F1]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#0F172A] mb-2">Platform AI Insights</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-[#475569]">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Attendance improved by 4.2% this month</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> 0 students are currently at critical risk</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" /> 2 reports generated this week</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Charts Column (Span 2) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Attendance Chart */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#0F172A]">Attendance Trends</h3>
              <p className="text-xs font-medium text-[#94A3B8] mt-1">Monthly college-wide attendance</p>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[60, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#6366F1" strokeWidth={3} fill="url(#colorAtt)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Chart */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#0F172A]">Department Comparison</h3>
              <p className="text-xs font-medium text-[#94A3B8] mt-1">Attendance vs Average Marks</p>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerf || []} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="code" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
                  <Legend wrapperStyle={{ fontSize: 13, color: "#475569", paddingTop: 10, fontWeight: 500 }} iconType="circle" />
                  <Bar dataKey="attendance_pct" name="Attendance" fill="#6366F1" radius={[4, 4, 0, 0]} animationDuration={1000} maxBarSize={32} />
                  <Bar dataKey="avg_marks_pct" name="Avg Marks" fill="#14B8A6" radius={[4, 4, 0, 0]} animationDuration={1200} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Column (Span 1) */}
        <div className="flex flex-col gap-6">
          
          {/* AI Insights Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-6">Actionable Insights</h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <AlertTriangle size={18} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">Attendance declining</div>
                  <div className="text-xs text-[#475569] mt-1">Mechanical department has seen a 2% drop this week.</div>
                </div>
              </div>
              <div className="flex gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <TrendingUp size={18} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">Performance surge</div>
                  <div className="text-xs text-[#475569] mt-1">Civil department improved average marks by 8%.</div>
                </div>
              </div>
              <div className="flex gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <Users size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">Intervention required</div>
                  <div className="text-xs text-[#475569] mt-1">12 students predicted to fail without support.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-6">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <ActionCard title="Start AI Chat" desc="Query your database" icon={MessageSquare} onClick={() => window.location.href = "/chat"} />
              <ActionCard title="Upload Data" desc="Import student records" icon={Upload} onClick={() => window.location.href = "/upload"} />
              <ActionCard title="Generate Report" desc="Create PDF summary" icon={FileText} onClick={() => window.location.href = "/reports"} />
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-6">Recent Activity</h3>
            <div className="relative pl-4 border-l-2 border-[#E2E8F0] flex flex-col gap-6 ml-2">
              {[
                { title: "Midterm Report generated", time: "2h ago", icon: FileText, color: "#6366F1" },
                { title: "CSV Data upload successful", time: "5h ago", icon: Upload, color: "#10B981" },
                { title: "Performance analysis run", time: "1d ago", icon: Activity, color: "#3B82F6" },
                { title: "Admin login from new IP", time: "2d ago", icon: Clock, color: "#94A3B8" },
              ].map((activity, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] w-3 h-3 rounded-full border-2 border-white" style={{ background: activity.color }} />
                  <div className="text-sm font-semibold text-[#0F172A] -mt-1.5">{activity.title}</div>
                  <div className="text-xs font-medium text-[#94A3B8] mt-1">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
