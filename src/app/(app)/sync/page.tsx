"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Upload, Download, CheckCircle, XCircle, Clock, FileText, ChevronDown, Trash2 } from "lucide-react"
import { api } from "@/services/api"

type ImportType = "students" | "attendance" | "marks"

interface UploadResult {
  status: string
  total_rows: number
  valid_rows: number
  error_count: number
  errors: string[]
  preview: Record<string, string>[]
  message?: string
  rows_imported?: number
  job_id?: string
}

const TABS: { id: ImportType; label: string; description: string }[] = [
  { id: "students", label: "Students", description: "Import student records: roll number, name, department, semester" },
  { id: "attendance", label: "Attendance", description: "Import attendance records: student, subject, date, status" },
  { id: "marks", label: "Marks", description: "Import exam marks: student, subject, exam type, marks obtained" },
]

export default function DataSyncPage() {
  const [activeTab, setActiveTab] = useState<ImportType>("students")
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<UploadResult | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  // Import history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["sync", "history", historyPage],
    queryFn: () => api.get("/data-sync/history", { params: { page: historyPage } }).then(r => r.data),
    staleTime: 30_000,
  })

  // Preview mutation (commit=false)
  const previewMutation = useMutation({
    mutationFn: (f: File) => {
      const fd = new FormData()
      fd.append("file", f)
      return api.post<UploadResult>(`/data-sync/upload/${activeTab}?commit=false`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(r => r.data)
    },
    onSuccess: (data) => setPreview(data),
  })

  // Commit mutation (commit=true)
  const commitMutation = useMutation({
    mutationFn: (f: File) => {
      const fd = new FormData()
      fd.append("file", f)
      return api.post<UploadResult>(`/data-sync/upload/${activeTab}?commit=true`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(r => r.data)
    },
    onSuccess: () => {
      setFile(null)
      setPreview(null)
      qc.invalidateQueries({ queryKey: ["sync"] })
    },
  })

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv") && !f.name.endsWith(".xlsx")) {
      alert("Only .csv files are supported")
      return
    }
    setFile(f)
    setPreview(null)
    previewMutation.mutate(f)
  }, [activeTab])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleTabChange = (tab: ImportType) => {
    setActiveTab(tab)
    setFile(null)
    setPreview(null)
  }

  const downloadTemplate = async () => {
    const resp = await api.get(`/data-sync/template/${activeTab}`, { responseType: "blob" })
    const url = URL.createObjectURL(resp.data)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeTab}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const history = historyData?.history || []

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Upload size={22} className="text-[#6366F1]" />
            Data Sync Center
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Import academic data from your ERP into the Intelligence Platform</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6366F1] bg-[#6366F1]/10 rounded-xl hover:bg-[#6366F1]/20 transition-colors"
        >
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#6366F1] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-sm text-[#64748B] -mt-3">
        {TABS.find(t => t.id === activeTab)?.description}
      </p>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          dragOver ? "border-[#6366F1] bg-[#6366F1]/5" : "border-[#E2E8F0] bg-white hover:border-[#6366F1]/50 hover:bg-[#F8FAFC]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {previewMutation.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center">
              <Upload size={24} className="text-[#6366F1] animate-bounce" />
            </div>
            <div className="text-sm font-semibold text-[#475569]">Validating {file?.name}...</div>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <FileText size={24} className="text-emerald-600" />
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">{file.name}</div>
            <div className="text-xs text-[#94A3B8]">{(file.size / 1024).toFixed(1)} KB · Click to replace</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-[#6366F1]/20" : "bg-[#F1F5F9]"}`}>
              <Upload size={26} className={dragOver ? "text-[#6366F1]" : "text-[#94A3B8]"} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">Drop your CSV file here, or click to browse</div>
              <div className="text-xs text-[#94A3B8] mt-1">Supports .csv files · Max 10MB</div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Result */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden"
          >
            {/* Summary bar */}
            <div className={`px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between ${
              preview.error_count > 0 ? "bg-red-50" : "bg-emerald-50"
            }`}>
              <div className="flex items-center gap-3">
                {preview.error_count > 0 ? (
                  <XCircle size={20} className="text-red-600" />
                ) : (
                  <CheckCircle size={20} className="text-emerald-600" />
                )}
                <div>
                  <div className={`text-sm font-bold ${preview.error_count > 0 ? "text-red-700" : "text-emerald-700"}`}>
                    {preview.error_count > 0
                      ? `${preview.error_count} validation error${preview.error_count > 1 ? "s" : ""} found`
                      : `${preview.valid_rows} rows ready to import`}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {preview.total_rows} total rows · {preview.valid_rows} valid · {preview.error_count} errors
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFile(null); setPreview(null) }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#64748B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => file && commitMutation.mutate(file)}
                  disabled={preview.error_count > 0 || commitMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#6366F1] rounded-lg hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {commitMutation.isPending ? "Importing..." : "Confirm Import →"}
                </button>
              </div>
            </div>

            {/* Errors */}
            {preview.errors.length > 0 && (
              <div className="px-5 py-3 border-b border-[#E2E8F0] bg-red-50/50 max-h-48 overflow-y-auto">
                <div className="text-xs font-bold text-red-700 mb-2">Validation Errors</div>
                {preview.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 py-0.5 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span> {err}
                  </div>
                ))}
              </div>
            )}

            {/* Preview table */}
            {preview.preview && preview.preview.length > 0 && (
              <div className="overflow-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      {Object.keys(preview.preview[0]).filter(k => !k.startsWith("_")).map(col => (
                        <th key={col} className="px-3 py-2 text-left font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8FAFC]">
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8FAFC]">
                        {Object.entries(row).filter(([k]) => !k.startsWith("_")).map(([k, v]) => (
                          <td key={k} className="px-3 py-2 text-[#475569]">{v || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commit Success */}
      <AnimatePresence>
        {commitMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
          >
            <CheckCircle size={20} className="text-emerald-600" />
            <div className="text-sm font-semibold text-emerald-700">
              Import successful! {commitMutation.data?.rows_imported ?? 0} rows added to the database.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import History */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="text-sm font-bold text-[#0F172A]">Import History</div>
          <div className="text-xs text-[#94A3B8]">Last 20 imports</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Type", "Rows Imported", "Status", "Date", "Imported By"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {historyLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{[1, 2, 3, 4, 5].map(j => (
                    <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse bg-[#F1F5F9] rounded" /></td>
                  ))}</tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                      <Upload size={28} strokeWidth={1.5} />
                      <span className="text-sm font-medium">No imports yet</span>
                      <span className="text-xs">Upload a CSV file above to get started</span>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <span className="capitalize font-semibold text-[#0F172A]">{item.import_type}</span>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{item.rows_imported}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        item.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {item.status === "completed" ? "✓ Completed" : item.status === "failed" ? "✗ Failed" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-xs">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{item.imported_by || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
