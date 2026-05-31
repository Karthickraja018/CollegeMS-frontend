"use client"

import { useQuery } from "@tanstack/react-query"
import { placementsApi } from "@/services/admin"
import { PageHeader } from "@/components/ui/admin"
import { Trophy, Users, TrendingUp, Building2 } from "lucide-react"
import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { motion } from "framer-motion"
import Link from "next/link"

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]
const YEARS = ["2024-25", "2023-24", "2022-23"]

export default function PlacementsAnalyticsPage() {
  const [year, setYear] = useState(YEARS[0])

  const { data, isLoading } = useQuery({
    queryKey: ["placement-analytics", year],
    queryFn: () => placementsApi.getAnalytics(year),
    staleTime: 60_000,
  })

  const overview = data?.overview || {}
  const byDept = data?.by_department || []
  const ctcDist = data?.ctc_distribution || []

  const kpis = [
    { label: "Total Drives", value: overview.total_drives || 0, icon: Building2, color: "#6366F1" },
    { label: "Students Placed", value: overview.placed_students || 0, icon: Users, color: "#10B981" },
    { label: "Avg CTC", value: overview.avg_ctc ? `${Number(overview.avg_ctc).toFixed(2)} LPA` : "—", icon: TrendingUp, color: "#F59E0B" },
    { label: "Highest CTC", value: overview.highest_ctc ? `${overview.highest_ctc} LPA` : "—", icon: Trophy, color: "#EF4444" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Placement Analytics"
        subtitle="Company drives, package statistics, and department breakdown"
        actions={
          <div className="flex gap-2">
            <select value={year} onChange={e => setYear(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[#374151] outline-none"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <Link href="/admin/placements/drives">
              <button className="text-sm px-4 py-2 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#5558E9] transition">
                Manage Drives
              </button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Department placements */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Placements by Department</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="dept_code" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="placed" name="Placed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTC distribution pie */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">CTC Distribution</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ctcDist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                  {ctcDist.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department detail table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Department-wise Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {["Department", "Placed", "Avg CTC", "Highest CTC"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byDept.map((row: any) => (
                <tr key={row.dept_code} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3 font-semibold text-[#0F172A]">{row.department_name}</td>
                  <td className="px-5 py-3"><span className="font-bold text-green-600">{row.placed}</span></td>
                  <td className="px-5 py-3 font-mono">{row.avg_ctc ? `${row.avg_ctc} LPA` : "—"}</td>
                  <td className="px-5 py-3 font-mono font-bold text-[#6366F1]">{row.highest_ctc ? `${row.highest_ctc} LPA` : "—"}</td>
                </tr>
              ))}
              {byDept.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[#94A3B8]">No placement data for {year}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
