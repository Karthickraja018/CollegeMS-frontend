"use client"

import { useQuery } from "@tanstack/react-query"
import { studentsAdminApi } from "@/services/admin"
import { StatusBadge, RiskBadge, LoadingPage } from "@/components/ui/admin"
import {
  ArrowLeft, GraduationCap, Phone, Mail, MapPin, Calendar,
  TrendingUp, BookOpen, DollarSign, Briefcase, AlertTriangle,
  CheckCircle, XCircle, Clock,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-[#F8FAFC] last:border-0">
      <span className="text-xs text-[#94A3B8] w-32 flex-shrink-0 font-medium pt-0.5">{label}</span>
      <span className="text-sm text-[#334155] font-medium">{value || "—"}</span>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
          <Icon size={15} className="text-[#6366F1]" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function StudentProfilePage() {
  const { id } = useParams()

  const { data: student, isLoading } = useQuery({
    queryKey: ["student-profile", id],
    queryFn: () => studentsAdminApi.getProfile(Number(id)),
  })

  if (isLoading) return <LoadingPage />
  if (!student) return <div className="text-center py-20 text-[#94A3B8]">Student not found.</div>

  const attendanceData = student.attendance?.map((a: any) => ({
    subject: a.subject_code,
    pct: Number(a.attendance_pct),
  })) || []

  const marksData = student.marks?.map((m: any) => ({
    subject: m.subject_code,
    CIA: Number(m.cia_avg_pct || 0),
    Sem: Number(m.sem_end_pct || 0),
  })) || []

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* Back navigation */}
      <Link href="/admin/students" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#6366F1] transition-colors w-fit">
        <ArrowLeft size={16} /> Back to Students
      </Link>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
            {student.name?.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#0F172A]">{student.name}</h1>
              <StatusBadge value={student.status} />
              <RiskBadge score={student.risk_score || 0} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#64748B]">
              <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {student.program_name} · Sem {student.current_semester}</span>
              <span className="flex items-center gap-1.5 font-mono"># {student.roll_number}</span>
              <span className="flex items-center gap-1.5"><Mail size={14} /> {student.email}</span>
              {student.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {student.phone}</span>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#64748B] mt-1">
              <span className="font-medium text-[#334155]">{student.department_name}</span>
              <span>Batch: <strong className="font-mono">{student.batch}</strong></span>
              {student.section && <span>Section: <strong>{student.section}</strong></span>}
              {student.gender && <span className="capitalize">{student.gender}</span>}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Fee Status", value: <StatusBadge value={student.fee_status || "—"} /> },
              { label: "Balance", value: student.fee_balance != null ? `₹${Number(student.fee_balance).toLocaleString()}` : "—" },
              { label: "Arrears", value: student.marks?.filter((m: any) => m.has_arrear).length || 0 },
            ].map((s) => (
              <div key={s.label} className="bg-[#F8FAFC] rounded-xl px-4 py-3 text-center">
                <div className="text-lg font-bold text-[#0F172A]">{s.value}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: Personal Info */}
        <div className="flex flex-col gap-5">
          <Section title="Personal Info" icon={GraduationCap}>
            <InfoRow label="DOB" value={student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : undefined} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Community" value={student.community} />
            <InfoRow label="Religion" value={student.religion} />
            <InfoRow label="Parent Phone" value={student.parent_phone} />
            <InfoRow label="Hosteller" value={student.is_hosteller ? "Yes" : "No"} />
            <InfoRow label="Transport Route" value={student.transport_route} />
            <InfoRow label="Lateral Entry" value={student.lateral_entry ? "Yes" : "No"} />
          </Section>

          {/* Risk History */}
          <Section title="Risk History" icon={AlertTriangle}>
            {student.risk_history?.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No risk snapshots yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {student.risk_history?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                    <RiskBadge score={r.risk_score} />
                    <span className="text-xs text-[#94A3B8] ml-auto">{new Date(r.snapshot_date).toLocaleDateString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Centre: Attendance + Marks */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* Attendance */}
          <Section title="Attendance" icon={TrendingUp}>
            {student.attendance?.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No attendance data available.</p>
            ) : (
              <>
                <div className="h-[180px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Attendance"]} />
                      <Bar dataKey="pct" name="Attendance" radius={[4, 4, 0, 0]} maxBarSize={24}
                        fill="#6366F1"
                        label={{ position: "top", fontSize: 9, fill: "#94A3B8" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {student.attendance.map((a: any) => (
                    <div key={a.subject_code} className="flex items-center gap-3 text-xs py-1.5 border-b border-[#F8FAFC] last:border-0">
                      <span className="font-mono font-semibold w-20 text-[#334155]">{a.subject_code}</span>
                      <span className="flex-1 text-[#64748B] truncate">{a.subject_name}</span>
                      <div className="w-20 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${a.attendance_pct}%`, background: a.attendance_pct >= 75 ? "#10B981" : "#EF4444" }} />
                      </div>
                      <span className={`font-bold w-10 text-right ${Number(a.attendance_pct) >= 75 ? "text-emerald-600" : "text-red-500"}`}>
                        {a.attendance_pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* Marks */}
          <Section title="Marks & Results" icon={BookOpen}>
            {student.marks?.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No marks data available.</p>
            ) : (
              <>
                <div className="h-[160px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marksData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="CIA" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={18} />
                      <Bar dataKey="Sem" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {student.marks.map((m: any) => (
                    <div key={m.subject_code} className="flex items-center gap-2 text-xs py-1.5 border-b border-[#F8FAFC] last:border-0">
                      <span className="font-mono font-semibold w-20 text-[#334155]">{m.subject_code}</span>
                      <span className="flex-1 text-[#64748B] truncate">{m.subject_name}</span>
                      <span className="text-[#94A3B8]">CIA: <strong className="text-[#334155]">{m.cia_avg_pct || "—"}</strong></span>
                      <span className="text-[#94A3B8]">Sem: <strong className="text-[#334155]">{m.sem_end_pct || "—"}</strong></span>
                      {m.has_arrear && <span className="text-red-500 font-bold">ARREAR</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* Placement + Fees row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Placements" icon={Briefcase}>
              {student.placements?.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No placement applications yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {student.placements.map((p: any) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                      <div className="font-semibold text-sm text-[#0F172A]">{p.company_name}</div>
                      <div className="text-xs text-[#64748B]">{p.job_role} · ₹{p.ctc_lpa}L</div>
                      <div className="mt-1"><StatusBadge value={p.status} /></div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Fee History" icon={DollarSign}>
              {student.fees?.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No fee records.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {student.fees.map((f: any) => (
                    <div key={f.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{f.academic_year}</span>
                        <StatusBadge value={f.status} />
                      </div>
                      <div className="text-xs text-[#64748B] mt-1 grid grid-cols-3 gap-1">
                        <div>Due: <strong>₹{Number(f.total_due).toLocaleString()}</strong></div>
                        <div>Paid: <strong>₹{Number(f.total_paid).toLocaleString()}</strong></div>
                        <div className={f.balance > 0 ? "text-red-500 font-bold" : "text-emerald-600"}>
                          Bal: ₹{Number(f.balance).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}
