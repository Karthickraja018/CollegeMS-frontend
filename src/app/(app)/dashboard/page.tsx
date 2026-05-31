"use client"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import {
  Users, TrendingUp, AlertTriangle, BookOpen,
  CheckCircle, FileText, RefreshCw, Brain
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { formatPercentage } from "@/lib/utils"
import { useState } from "react"

function StatCard({
  label, value, icon: Icon, color, sub
}: {
  label: string; value: string | number; icon: any; color: string; sub?: string
}) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="stat-value" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${color}30`,
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
        borderRadius: 8, padding: "10px 14px", fontSize: 13
      }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{typeof p.value === "number" ? `${p.value}%` : p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null)

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

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeResult(null)
    try {
      const res = await api.post("/chat/analyze-performance")
      const count = res.data?.risk_analysis?.at_risk_count ?? 0
      setAnalyzeResult(`Analysis complete — ${count} at-risk students identified.`)
    } catch (e: any) {
      setAnalyzeResult(e?.response?.data?.detail || "Analysis failed.")
    } finally {
      setAnalyzing(false)
    }
  }

  const kpis = [
    { label: "Total Students", value: statsLoading ? "—" : stats?.total_students ?? 0, icon: Users, color: "#6366F1", sub: "Enrolled" },
    { label: "Avg Attendance", value: statsLoading ? "—" : formatPercentage(stats?.avg_attendance), icon: TrendingUp, color: "#14B8A6", sub: "College-wide" },
    { label: "At-Risk Students", value: statsLoading ? "—" : stats?.at_risk_count ?? 0, icon: AlertTriangle, color: "#EF4444", sub: "Risk score > 60" },
    { label: "Departments", value: statsLoading ? "—" : stats?.total_departments ?? 0, icon: BookOpen, color: "#8B5CF6", sub: "Active" },
    { label: "Pass Percentage", value: statsLoading ? "—" : formatPercentage(stats?.pass_percentage), icon: CheckCircle, color: "#10B981", sub: "Overall marks" },
    { label: "Reports Generated", value: statsLoading ? "—" : stats?.total_reports ?? 0, icon: FileText, color: "#F59E0B", sub: "Total" },
  ]

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Institutional overview and AI performance insights</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={analyzing}
            id="run-performance-analysis"
          >
            <Brain size={15} />
            {analyzing ? "Analyzing…" : "Run Performance Analysis"}
          </button>
          {analyzeResult && (
            <div style={{
              fontSize: 12, color: "var(--teal)",
              background: "var(--teal-glow)", padding: "6px 12px",
              borderRadius: 6, border: "1px solid rgba(20,184,166,0.3)"
            }}>
              ✓ {analyzeResult}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Attendance Trend */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Attendance Trend</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Monthly attendance percentage</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend || []}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#6366F1" fill="url(#attGrad)" strokeWidth={2} dot={false} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Department Performance</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Attendance vs Marks comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptPerf || []} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="code" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
              <Bar dataKey="attendance_pct" name="Attendance" fill="#6366F1" radius={[4, 4, 0, 0]} animationDuration={1000} />
              <Bar dataKey="avg_marks_pct" name="Avg Marks" fill="#14B8A6" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
