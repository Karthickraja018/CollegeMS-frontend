"use client"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from "recharts"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-bright)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? `${p.value.toFixed(1)}%` : p.value}</strong></p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { data: deptPerf } = useQuery({ queryKey: ["dept-perf"], queryFn: () => api.get("/analytics/department-performance").then(r => r.data) })
  const { data: passRates } = useQuery({ queryKey: ["pass-rates"], queryFn: () => api.get("/analytics/subject-pass-rates").then(r => r.data) })
  const { data: trend } = useQuery({ queryKey: ["att-trend"], queryFn: () => api.get("/analytics/attendance-trend?months=6").then(r => r.data) })

  const radarData = (deptPerf || []).map((d: any) => ({
    department: d.code,
    Attendance: Number(d.attendance_pct || 0),
    Marks: Number(d.avg_marks_pct || 0),
  }))

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Visual insights across departments and subjects</p>
      </div>

      <div className="charts-grid" style={{ rowGap: 20 }}>
        {/* Department Attendance vs Marks */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Department Performance Comparison</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Attendance % vs Average Marks %</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptPerf || []} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="code" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="attendance_pct" name="Attendance" fill="#6366F1" radius={[4, 4, 0, 0]} animationDuration={1000} />
              <Bar dataKey="avg_marks_pct" name="Avg Marks" fill="#14B8A6" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Attendance Trend</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Monthly attendance % — last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend || []}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: "#6366F1", r: 4 }} activeDot={{ r: 6 }} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Department Radar</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Multi-metric department comparison</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="department" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Radar name="Attendance" dataKey="Attendance" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} animationDuration={1000} />
              <Radar name="Marks" dataKey="Marks" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.15} animationDuration={1200} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Pass Rates */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Subject Pass Rates</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Bottom 20 subjects by pass rate</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(passRates || []).slice(0, 15)} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="subject" width={140} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pass_rate" name="Pass Rate" fill="#6366F1" radius={[0, 4, 4, 0]} animationDuration={1000}
                label={{ position: "right", fill: "var(--text-muted)", fontSize: 10, formatter: (v: any) => `${Number(v).toFixed(1)}%` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
