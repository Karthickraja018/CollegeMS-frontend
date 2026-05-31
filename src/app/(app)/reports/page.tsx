"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { FileText, Download, Plus, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const REPORT_TYPES = [
  { value: "department_monthly", label: "Department Monthly Report" },
  { value: "semester_performance", label: "Semester Performance Report" },
  { value: "attendance_report", label: "Attendance Report" },
  { value: "academic_analysis", label: "Academic Analysis Report" },
  { value: "naac_criterion2", label: "NAAC Criterion 2 Report" },
  { value: "at_risk_students", label: "At-Risk Students Report" },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState("department_monthly")
  const [format, setFormat] = useState<"pdf" | "docx">("pdf")
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null)

  const { data: reports, refetch } = useQuery({
    queryKey: ["reports-list"],
    queryFn: () => api.get("/reports").then(r => r.data),
  })

  const handleGenerate = async () => {
    setGenerating(true)
    setResult(null)
    try {
      const res = await api.post("/reports/generate", {
        report_type: selectedType,
        format,
        parameters: {},
      })
      setResult({ url: res.data.download_url })
      refetch()
    } catch (e: any) {
      setResult({ error: e.response?.data?.detail || "Report generation failed" })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and download institutional reports</p>
      </div>

      {/* Generator */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Generate New Report</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Report Type</label>
            <select className="input" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Format</label>
            <select className="input" value={format} onChange={e => setFormat(e.target.value as any)}>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating} style={{ flexShrink: 0 }}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {generating ? "Generating…" : "Generate Report"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: result.error ? "rgba(239,68,68,0.1)" : "rgba(20,184,166,0.1)", border: `1px solid ${result.error ? "rgba(239,68,68,0.3)" : "rgba(20,184,166,0.3)"}` }}>
            {result.error ? (
              <span style={{ color: "var(--danger)", fontSize: 13 }}>✗ {result.error}</span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--teal)", fontSize: 13 }}>✓ Report generated successfully</span>
                {result.url && (
                  <a href={`${API_URL}${result.url}`} target="_blank" rel="noopener noreferrer" className="btn btn-teal" style={{ fontSize: 13 }}>
                    <Download size={14} /> Download
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reports History */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 600 }}>
          Recent Reports
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Type</th>
              <th>Format</th>
              <th>Generated</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {!reports?.length ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                  No reports generated yet
                </td>
              </tr>
            ) : (
              reports.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FileText size={14} color="var(--indigo)" />
                      {r.title}
                    </div>
                  </td>
                  <td><span className="badge badge-indigo">{r.report_type.replace(/_/g, " ")}</span></td>
                  <td><span className="badge badge-muted">{r.format?.toUpperCase()}</span></td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    {r.download_url ? (
                      <a href={`${API_URL}${r.download_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 10px" }}>
                        <Download size={13} /> Download
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
