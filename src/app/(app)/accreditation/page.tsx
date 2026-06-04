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

  const [selectedReport, setSelectedReport] = useState<any>(null)

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
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
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Generator & History */}
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
          
          {/* Generator Form */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 shrink-0">
            <div className="text-sm font-bold text-[#0F172A] mb-4">Report Generator</div>

            <div className="flex flex-col gap-4">
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

              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {generateMutation.isPending ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          {/* Report History */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex-1 flex flex-col min-h-[300px]">
            <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <div className="text-sm font-bold text-[#0F172A]">History</div>
              <div className="text-xs text-[#94A3B8]">{reports.length}</div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {reportsLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-[#F1F5F9] rounded-xl" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
                    <FileText size={18} className="text-[#CBD5E1]" />
                  </div>
                  <div className="text-sm font-semibold text-[#374151]">No reports</div>
                  <div className="text-xs text-[#94A3B8]">Generated reports will appear here</div>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {reports.map((report: any) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedReport?.id === report.id ? 'bg-[#6366F1]/5 border-l-2 border-l-[#6366F1]' : 'hover:bg-[#F8FAFC] border-l-2 border-l-transparent'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={14} className="text-[#6366F1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#0F172A] truncate leading-tight">
                          {report.title}
                        </div>
                        <div className="text-xs text-[#94A3B8] mt-1 truncate">
                          {new Date(report.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: PDF Viewer */}
        <div className="col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden relative">
          {selectedReport ? (
            <>
              {/* Viewer Header */}
              <div className="h-14 px-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#0F172A] truncate">
                      {selectedReport.title}
                    </div>
                    <div className="text-xs text-[#64748B] truncate">
                      Generated: {new Date(selectedReport.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {selectedReport.download_url && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}${selectedReport.download_url}?download=true`}
                    download
                    target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all shadow-sm shrink-0"
                  >
                    <Download size={14} /> Download PDF
                  </a>
                )}
              </div>
              
              {/* PDF Canvas */}
              <div className="flex-1 bg-[#E2E8F0] relative">
                {selectedReport.download_url ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}${selectedReport.download_url}#toolbar=0`}
                    className="w-full h-full border-0"
                    title={selectedReport.title}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-white">
                    <Loader2 size={24} className="animate-spin text-[#94A3B8]" />
                    <div className="text-sm text-[#64748B]">Document is processing...</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]/50">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center">
                <FileText size={28} className="text-[#CBD5E1]" />
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#374151]">No Report Selected</div>
                <div className="text-sm text-[#94A3B8] mt-1 max-w-xs">
                  Generate a new report or select an existing one from the history panel to view it here.
                </div>
              </div>
            </div>
          )}
          
          {/* Overlay notification for fresh generation */}
          <AnimatePresence>
            {generateMutation.isSuccess && lastResult && !selectedReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 cursor-pointer hover:bg-[#059669] transition-colors"
                onClick={() => setSelectedReport(reports[0])}
              >
                <CheckCircle size={18} />
                Report generated successfully! Click to view
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
