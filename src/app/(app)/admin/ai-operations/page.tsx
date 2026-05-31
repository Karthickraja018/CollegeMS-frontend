"use client"

import { useQuery } from "@tanstack/react-query"
import { aiOpsApi } from "@/services/admin"
import { PageHeader, Btn } from "@/components/ui/admin"
import { Bot, Zap, Database, Clock, Users, Activity, RefreshCw, TrendingUp } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts"
import { motion } from "framer-motion"

export default function AIOperationsPage() {
  const qc = useQueryClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ["ai-ops-stats"],
    queryFn: aiOpsApi.getStats,
    staleTime: 30_000,
  })

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["ai-sessions"],
    queryFn: () => aiOpsApi.getSessions({ page: 1, page_size: 10 }),
    staleTime: 30_000,
  })

  const scanMut = useMutation({
    mutationFn: aiOpsApi.triggerRiskScan,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ai-ops-stats"] })
      alert(`✅ Risk scan completed. ${data.students_updated} students updated.`)
    },
  })

  const chat = stats?.chat || {}
  const byAgent = stats?.by_agent || []
  const risk = stats?.risk_monitoring || {}
  const reports = stats?.reports || {}
  const dailyUsage = stats?.daily_usage || []

  const kpis = [
    { label: "Total Sessions", value: chat.total_sessions || 0, icon: Bot, color: "#6366F1" },
    { label: "Unique Users", value: chat.unique_users || 0, icon: Users, color: "#10B981" },
    { label: "Sessions Today", value: chat.sessions_today || 0, icon: Activity, color: "#F59E0B" },
    { label: "Avg Messages/Session", value: chat.avg_messages_per_session || "—", icon: TrendingUp, color: "#8B5CF6" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Operations"
        subtitle="Monitor AI agent activity, usage metrics, and risk monitoring"
        actions={
          <Btn variant="primary" icon={Zap} onClick={() => scanMut.mutate()} isLoading={scanMut.isPending}>
            Trigger Risk Scan
          </Btn>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${card.color}15` }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0F172A]">{card.value}</div>
              <div className="text-xs text-[#94A3B8] font-medium">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Daily usage area chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Daily AI Sessions (30 days)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsage} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" stroke="#6366F1" strokeWidth={2.5} fill="url(#aiGrad)" name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk monitoring panel */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Risk Monitoring</h3>
          <div className="flex flex-col gap-3">
            <div className="text-xs text-[#94A3B8]">Last scan: {risk.last_scan_date || "Never"}</div>
            {[
              { label: "Critical", count: risk.critical || 0, color: "#EF4444" },
              { label: "High", count: risk.high || 0, color: "#F97316" },
              { label: "Medium", count: risk.medium || 0, color: "#F59E0B" },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-sm text-[#334155] flex-1">{r.label}</span>
                <span className="text-sm font-bold" style={{ color: r.color }}>{r.count}</span>
              </div>
            ))}
            <div className="text-xs text-[#94A3B8] pt-1">Students scanned: {risk.students_scanned || 0}</div>
            <button
              onClick={() => scanMut.mutate()}
              disabled={scanMut.isPending}
              className="mt-2 w-full text-sm py-2 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#5558E9] transition disabled:opacity-50"
            >
              {scanMut.isPending ? "Scanning…" : "Run Scan Now"}
            </button>
          </div>
        </div>
      </div>

      {/* By agent + Reports row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Agent breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Sessions by Agent</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAgent} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="agent" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#6366F1" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports status */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Report Generation</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Reports", value: reports.total_reports || 0, color: "#64748B" },
              { label: "Completed", value: reports.completed || 0, color: "#10B981" },
              { label: "In Progress", value: reports.in_progress || 0, color: "#F59E0B" },
              { label: "Failed", value: reports.failed || 0, color: "#EF4444" },
            ].map(r => (
              <div key={r.label} className="p-3 rounded-xl border border-[#F1F5F9]">
                <div className="text-xl font-bold" style={{ color: r.color }}>{r.value}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent AI sessions */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Recent AI Sessions</h3>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["ai-sessions"] })} className="text-[#6366F1] hover:text-[#5558E9]">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {["User", "Title", "Agent", "Messages", "Updated"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-[#0F172A]">{s.user_name}</div>
                    <div className="text-xs text-[#94A3B8]">{s.role}</div>
                  </td>
                  <td className="px-5 py-3 text-[#64748B] max-w-[180px] truncate">{s.title || "Untitled session"}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1]">
                      {s.last_agent || "unknown"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-mono text-sm">{s.message_count}</td>
                  <td className="px-5 py-3 text-xs text-[#94A3B8]">
                    {new Date(s.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[#94A3B8]">No sessions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
