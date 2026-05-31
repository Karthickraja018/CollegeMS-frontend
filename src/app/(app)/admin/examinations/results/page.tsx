"use client"

import { useQuery } from "@tanstack/react-query"
import { examsApi, semestersApi, departmentsApi } from "@/services/admin"
import { PageHeader, SelectFilter, EmptyState } from "@/components/ui/admin"
import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { Trophy, TrendingUp, AlertCircle, CheckCircle, BarChart2 } from "lucide-react"

const COLORS = ["#10B981", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function ResultsAnalysisPage() {
  const [semFilter, setSemFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")

  const { data: result, isLoading } = useQuery({
    queryKey: ["exam-results", semFilter, deptFilter],
    queryFn: () => examsApi.getResultsAnalysis(Number(semFilter), { department_id: deptFilter ? Number(deptFilter) : undefined }),
    enabled: !!semFilter,
    staleTime: 60_000,
  })

  const { data: semesters = [] } = useQuery({ queryKey: ["semesters"], queryFn: () => semestersApi.list() })
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: () => departmentsApi.list({ is_active: true }) })

  const gradeDist = result?.grade_distribution || []
  const subjectPass = result?.subject_pass_rates || []
  const toppers = result?.toppers || []

  // Ensure grades are ordered O, A+, A, B+, B, U
  const order = ["O", "A+", "A", "B+", "B", "U"]
  const sortedGradeDist = [...gradeDist].sort((a, b) => order.indexOf(a.grade) - order.indexOf(b.grade))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Results Analysis"
        subtitle="Semester-wise performance, grade distribution, and toppers list"
        actions={
          <div className="flex gap-2">
            <SelectFilter value={deptFilter} onChange={setDeptFilter} options={departments.map((d: any) => ({ value: String(d.id), label: d.code }))} placeholder="All Departments" />
            <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
              <option value="">— Select Semester —</option>
              {semesters.map((s: any) => <option key={s.id} value={s.id}>{s.program_name} - Sem {s.semester_number}</option>)}
            </select>
          </div>
        }
      />

      {!semFilter ? (
        <EmptyState icon={BarChart2} title="Select a semester to view results analysis" />
      ) : isLoading ? (
        <div className="p-10 text-center text-[#94A3B8]">Loading analysis…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Grade Distribution */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Grade Distribution</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sortedGradeDist} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                      {sortedGradeDist.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.grade === "U" ? "#EF4444" : COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Pass Rates */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Subject Pass Rates (%)</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPass} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="subject_code" tick={{ fontSize: 10, fill: "#64748B", fontWeight: "bold" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip formatter={(val: any) => [`${val}%`, "Pass Rate"]} />
                    <Bar dataKey="pass_rate" name="Pass Rate" fill="#6366F1" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {subjectPass.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.pass_rate < 50 ? "#EF4444" : entry.pass_rate < 75 ? "#F59E0B" : "#10B981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Toppers List */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm mt-2">
            <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-2">
              <Trophy size={18} className="text-[#F59E0B]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Semester Toppers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    {["Rank", "Student", "Program", "Total Marks", "GPA"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748B]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {toppers.map((r: any, idx: number) => (
                    <tr key={r.student_id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 font-bold text-[#6366F1]">#{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A]">{r.student_name}</div>
                        <div className="text-xs text-[#94A3B8] font-mono">{r.roll_number}</div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{r.program_code}</td>
                      <td className="px-5 py-3 font-semibold text-green-600">{r.total_marks_obtained}</td>
                      <td className="px-5 py-3 font-bold text-[#0F172A]">{r.gpa}</td>
                    </tr>
                  ))}
                  {toppers.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-[#94A3B8]">No data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
