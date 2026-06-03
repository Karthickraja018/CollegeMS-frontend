"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/services/admin"
import { PageHeader, Btn } from "@/components/ui/admin"
import { Save, Building2, GraduationCap, Award } from "lucide-react"
import { useState, useEffect } from "react"

const ACCREDITATION_TYPES = ["naac", "nba", "nirf", "aicte", "ugc", "autonomous", "none"]
const NAAC_GRADES = ["A++", "A+", "A", "B++", "B+", "B", "C", "D"]

export default function CollegeSettingsPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<any>({})
  const [tab, setTab] = useState<"general" | "accreditation" | "naac" | "thresholds">("general")
  const [saved, setSaved] = useState(false)

  const { data: college, isLoading } = useQuery({
    queryKey: ["college-settings"],
    queryFn: settingsApi.getCollege,
    staleTime: 60_000,
  })

  const { data: naacData = [] } = useQuery({
    queryKey: ["naac-data"],
    queryFn: settingsApi.getNaac,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (college) setForm(college)
  }, [college])

  const saveMut = useMutation({
    mutationFn: (data: any) => settingsApi.updateCollege(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["college-settings"] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const field = (key: string, label: string, type = "text", fullWidth = false) => (
    <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-[#374151]">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
        className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30"
      />
    </div>
  )

  if (isLoading) return <div className="text-sm text-[#94A3B8] p-8">Loading college settings…</div>

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="College Settings"
        subtitle="Manage college profile, accreditation, and configuration"
        actions={
          <Btn
            variant="primary"
            icon={Save}
            onClick={() => saveMut.mutate(form)}
            isLoading={saveMut.isPending}
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </Btn>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1 w-fit flex-wrap">
        {(["general", "accreditation", "naac", "thresholds"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition capitalize ${tab === t ? "bg-white text-[#6366F1] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
          >
            {t === "naac" ? "NAAC Data" : t === "thresholds" ? "Academic Thresholds" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-[#6366F1]" />
            <h3 className="text-sm font-bold text-[#0F172A]">General Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("name", "College Name *", "text", true)}
            {field("short_name", "Short Name")}
            {field("code", "College Code")}
            {field("phone", "Phone")}
            {field("email", "Email", "email")}
            {field("website", "Website", "url", true)}
            {field("address", "Address", "text", true)}
            {field("city", "City")}
            {field("state", "State")}
            {field("pincode", "Pincode")}
            {field("university_name", "University Name", "text", true)}
            {field("university_code", "University Code")}
          </div>
        </div>
      )}

      {tab === "accreditation" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Award size={16} className="text-[#6366F1]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Accreditation Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Accreditation Type</label>
              <select value={form.accreditation_type || "none"} onChange={e => setForm((f: any) => ({ ...f, accreditation_type: e.target.value }))}
                className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                {ACCREDITATION_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">NAAC Grade</label>
              <select value={form.naac_grade || ""} onChange={e => setForm((f: any) => ({ ...f, naac_grade: e.target.value }))}
                className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                <option value="">— Select —</option>
                {NAAC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {field("naac_cgpa", "NAAC CGPA", "number")}
            {field("naac_valid_until", "Valid Until", "date")}
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="is_autonomous" checked={form.is_autonomous || false}
                onChange={e => setForm((f: any) => ({ ...f, is_autonomous: e.target.checked }))}
                className="w-4 h-4 accent-[#6366F1]" />
              <label htmlFor="is_autonomous" className="text-sm text-[#374151] font-medium">Autonomous Institution</label>
            </div>
          </div>
        </div>
      )}

      {tab === "thresholds" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Award size={16} className="text-[#6366F1]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Academic Thresholds</h3>
          </div>
          <p className="text-xs text-[#64748B] mb-6">Configure global thresholds for student risk analysis and faculty metrics. These values are used to categorize students.</p>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-[#0F172A]">Risk Score Threshold</label>
              <p className="text-xs text-[#64748B] mb-1">Students with a risk score above this value will be flagged globally as 'At-Risk'. (0-100)</p>
              <input
                type="number"
                value={form.settings?.risk_score_threshold ?? 60}
                onChange={e => setForm((f: any) => ({ ...f, settings: { ...(f.settings || {}), risk_score_threshold: Number(e.target.value) } }))}
                className="max-w-md text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30"
              />
            </div>
            
            <div className="flex flex-col gap-1 pt-4 border-t border-[#F1F5F9]">
              <label className="text-sm font-bold text-[#0F172A]">Minimum Attendance Requirement (%)</label>
              <p className="text-xs text-[#64748B] mb-1">Students falling below this percentage will be highlighted for 'Low Attendance'.</p>
              <input
                type="number"
                value={form.settings?.attendance_threshold ?? 75}
                onChange={e => setForm((f: any) => ({ ...f, settings: { ...(f.settings || {}), attendance_threshold: Number(e.target.value) } }))}
                className="max-w-md text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30"
              />
            </div>
            
            <div className="flex flex-col gap-1 pt-4 border-t border-[#F1F5F9]">
              <label className="text-sm font-bold text-[#0F172A]">Subject Pass Mark (%)</label>
              <p className="text-xs text-[#64748B] mb-1">The minimum percentage required to pass a subject.</p>
              <input
                type="number"
                value={form.settings?.pass_mark_threshold ?? 50}
                onChange={e => setForm((f: any) => ({ ...f, settings: { ...(f.settings || {}), pass_mark_threshold: Number(e.target.value) } }))}
                className="max-w-md text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30"
              />
            </div>
          </div>
        </div>
      )}

      {tab === "naac" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-2">
            <GraduationCap size={16} className="text-[#6366F1]" />
            <h3 className="text-sm font-bold text-[#0F172A]">NAAC Criteria Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {["Criterion", "Metric", "Value", "Verified", "Updated"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {naacData.map((row: any) => (
                  <tr key={row.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-mono font-bold text-[#6366F1]">{row.criterion}</td>
                    <td className="px-5 py-3 text-[#334155]">{row.metric_name}</td>
                    <td className="px-5 py-3 font-mono text-sm">{row.value_text || row.value_numeric || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.is_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
                        {row.is_verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#94A3B8]">
                      {row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
                {naacData.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[#94A3B8]">No NAAC criteria data found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
