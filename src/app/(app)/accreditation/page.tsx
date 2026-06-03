"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation } from "@tanstack/react-query"
import { FileText, Download, Loader2, CheckCircle, XCircle, ChevronDown } from "lucide-react"
import { api } from "@/services/api"
import { useUserStore } from "@/store"

const REPORT_TYPES = [
  { value: "department", label: "Department Academic Report" },
  { value: "at_risk", label: "Student Risk Report" },
  { value: "attendance", label: "Attendance Summary Report" },
  { value: "subject_performance", label: "Subject Performance Report" },
  { value: "faculty_load", label: "Faculty Load Report" },
]

export default function AccreditationPage() {
  const user = useUserStore((s) => s.user)
  const isInstitutionWide = ["admin", "college_admin", "principal"].includes(user?.role || "")

  const [reportType, setReportType] = useState("department")
  const [format, setFormat] = useState<"pdf" | "docx">("pdf")
  const [departmentId, setDepartmentId] = useState<string>("")
  const [lastResult, setLastResult] = useState<any>(null)

  // Dept list for filter
  const { data: deptList } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: () => api.get("/department-intelligence/").then(r => r.data),
    staleTime: 300_000,
  })

  // Reports history
  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ["reports", "list"],
    queryFn: () => api.get("/reports").then(r => r.data),
    staleTime: 60_000,
  })

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () => api.post("/reports/generate", {
      report_type: reportType,
      format,
      parameters: {
        ...(departmentId ? { department: departmentId } : {}),
      },
    }).then(r => r.data),
    onSuccess: (data) => {
      setLastResult(data)
      refetchReports()
    },
  })

  const reports = reportsData || []
  const departments = deptList || []

  return (
    <div className="flex flex-col gap-6 max-w-[1100px]">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
          <FileText size={22} className="text-[#6366F1]" />
          Academic Reports
        </h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Generate AI-powered academic reports from live data
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-12 gap-6">

        {/* Generator Form */}
        <div className="col-span-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="text-sm font-bold text-[#0F172A] mb-5">Report Generator</div>

            <div className="flex flex-col gap-4">
              {/* Report Type */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] appearance-none pr-8"
                  >
                    {REPORT_TYPES.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">Format</label>
                <div className="flex gap-2">
                  {[
                    { value: "pdf", label: "PDF" },
                    { value: "docx", label: "Word (DOCX)" },
                  ].map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value as "pdf" | "docx")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all ${
                        format === f.value
                          ? "bg-[#6366F1] text-white border-[#6366F1]"
                          : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#6366F1]/50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department filter (institution-wide only) */}
              {isInstitutionWide && departments.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
                    Department (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] appearance-none pr-8"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Report
                  </>
                )}
              </button>
            </div>

            {/* Result */}
            <AnimatePresence>
              {generateMutation.isSuccess && lastResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">Report Generated</span>
                  </div>
                  {lastResult.content_preview && (
                    <p className="text-xs text-emerald-700 opacity-80 mb-3 line-clamp-3">
                      {lastResult.content_preview}
                    </p>
                  )}
                  {lastResult.download_url && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}${lastResult.download_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-[#6366F1] hover:underline"
                    >
                      <Download size={14} /> Download Report
                    </a>
                  )}
                </motion.div>
              )}
              {generateMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                >
                  <XCircle size={16} className="text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-red-700">Generation Failed</div>
                    <div className="text-xs text-red-600 mt-0.5">
                      {(generateMutation.error as any)?.response?.data?.detail || "An error occurred. Please try again."}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info card */}
          <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-xs text-[#64748B]">
            <div className="font-semibold text-[#374151] mb-2">📋 About Reports</div>
            <ul className="space-y-1.5">
              <li>• Reports are generated from <strong>live database</strong> metrics</li>
              <li>• AI creates structured narratives with insights</li>
              <li>• NAAC / NBA reports coming in V2</li>
              <li>• All generated reports are archived in history</li>
            </ul>
          </div>
        </div>

        {/* Report History */}
        <div className="col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="text-sm font-bold text-[#0F172A]">Report History</div>
            <div className="text-xs text-[#94A3B8]">{reports.length} reports generated</div>
          </div>

          <div className="overflow-auto max-h-[600px]">
            {reportsLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse bg-[#F1F5F9] rounded-xl" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
                  <FileText size={24} className="text-[#CBD5E1]" />
                </div>
                <div className="text-sm font-semibold text-[#374151]">No reports yet</div>
                <div className="text-xs text-[#94A3B8]">Generate your first report using the form on the left</div>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {reports.map((report: any) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-[#6366F1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#0F172A] truncate">{report.title}</div>
                      <div className="text-xs text-[#94A3B8] mt-0.5">
                        {report.report_type.replace(/_/g, " ")} ·{" "}
                        <span className="uppercase">{report.format}</span> ·{" "}
                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    {report.download_url ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}${report.download_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6366F1] bg-[#6366F1]/10 rounded-lg hover:bg-[#6366F1]/20 transition-colors flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={12} /> Download
                      </a>
                    ) : (
                      <span className="text-xs text-[#94A3B8] px-3">Processing...</span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
