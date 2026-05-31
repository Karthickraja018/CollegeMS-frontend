"use client"

import { useQuery } from "@tanstack/react-query"
import { financeApi } from "@/services/admin"
import { PageHeader, SelectFilter, LoadingPage, StatusBadge } from "@/components/ui/admin"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Users } from "lucide-react"
import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts"
import { motion } from "framer-motion"
import Link from "next/link"

const PIE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

const ACADEMIC_YEARS = ["2024-25", "2023-24", "2022-23"]

export default function FinanceDashboardPage() {
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0])

  const { data, isLoading } = useQuery({
    queryKey: ["finance-dashboard", academicYear],
    queryFn: () => financeApi.getDashboard(academicYear),
    staleTime: 60_000,
  })

  const summary = data?.summary || {}
  const monthly = data?.monthly_collection || []
  const byMode = data?.by_payment_mode || []
  const byDept = data?.by_department || []

  const collectionRate = summary.total_due
    ? ((Number(summary.total_collected) / Number(summary.total_due)) * 100).toFixed(1)
    : "0"

  const summaryCards = [
    { label: "Total Due", value: `₹${(Number(summary.total_due || 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: "#6366F1" },
    { label: "Collected", value: `₹${(Number(summary.total_collected || 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: "#10B981" },
    { label: "Outstanding", value: `₹${(Number(summary.total_outstanding || 0) / 100000).toFixed(1)}L`, icon: AlertCircle, color: "#EF4444" },
    { label: "Collection Rate", value: `${collectionRate}%`, icon: CheckCircle, color: "#F59E0B" },
  ]

  const statusCards = [
    { label: "Fully Paid", count: summary.paid_count || 0, color: "#10B981" },
    { label: "Partial", count: summary.partial_count || 0, color: "#F59E0B" },
    { label: "Due", count: summary.due_count || 0, color: "#64748B" },
    { label: "Overdue", count: summary.overdue_count || 0, color: "#EF4444" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finance Dashboard"
        subtitle="Fee collection analytics and revenue overview"
        actions={
          <div className="flex gap-2">
            <SelectFilter value={academicYear} onChange={setAcademicYear}
              options={ACADEMIC_YEARS.map(y => ({ value: y, label: y }))} placeholder="Academic Year" />
            <Link href="/admin/finance/accounts">
              <button className="text-sm px-4 py-2 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#5558E9] transition">
                Fee Accounts
              </button>
            </Link>
          </div>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
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

      {/* Status pills */}
      <div className="grid grid-cols-4 gap-3">
        {statusCards.map(s => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-2xl py-3 px-4 flex items-center gap-3 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-sm font-bold text-[#0F172A]">{s.count}</span>
            <span className="text-xs text-[#94A3B8]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly collection trend */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Monthly Collection</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="collectionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Collected"]} />
                <Area type="monotone" dataKey="collected" stroke="#6366F1" strokeWidth={2.5} fill="url(#collectionGrad)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment mode pie */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">By Payment Mode</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byMode} dataKey="amount" nameKey="mode" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                  {byMode.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
                <Legend iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department breakdown */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Outstanding by Department</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDept} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dept_code" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
              <Bar dataKey="outstanding" name="Outstanding" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="total_paid" name="Paid" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
