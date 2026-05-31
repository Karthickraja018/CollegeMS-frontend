"use client"
import { useState, useCallback } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { api } from "@/services/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const DATASET_LABELS: Record<string, string> = {
  students: "Students",
  attendance: "Attendance Records",
  marks: "Marks / Grades",
  subjects: "Subjects",
  departments: "Departments",
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dataset, setDataset] = useState("students")
  const [preview, setPreview] = useState<any>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [step, setStep] = useState<"select" | "preview" | "import" | "done">("select")
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [dragging, setDragging] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const handleFileSelect = async (f: File) => {
    setFile(f)
    setLoadingPreview(true)
    const form = new FormData()
    form.append("file", f)

    try {
      const res = await api.post("/upload/preview", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setPreview(res.data)
      // Auto-map matching column names
      const autoMap: Record<string, string> = {}
      const expectedFields = res.data.expected_mappings?.[dataset] || []
      for (const col of res.data.columns) {
        const clean = col.toLowerCase().replace(/\s+/g, "_")
        if (expectedFields.includes(clean)) {
          autoMap[col] = clean
        }
      }
      setMapping(autoMap)
      setStep("preview")
    } catch (e: any) {
      alert(e.response?.data?.detail || "Could not parse file")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [dataset])

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    const form = new FormData()
    form.append("file", file)
    form.append("mapping_json", JSON.stringify({ dataset, mapping }))

    try {
      const res = await api.post("/upload/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setImportResult(res.data)
      setStep("done")
    } catch (e: any) {
      alert(e.response?.data?.detail?.message || e.response?.data?.detail || "Import failed")
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Upload Center</h1>
        <p className="page-subtitle">Import student data, attendance, and marks from CSV or Excel files</p>
      </div>

      {step === "select" && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Dataset Type</label>
            <select className="input" value={dataset} onChange={e => setDataset(e.target.value)}>
              {Object.entries(DATASET_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div
            className={`dropzone ${dragging ? "active" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {loadingPreview ? (
              <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--indigo)", display: "block" }} />
            ) : (
              <FileSpreadsheet size={36} style={{ margin: "0 auto 12px", color: "var(--text-muted)", display: "block" }} />
            )}
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {loadingPreview ? "Parsing file…" : "Drop CSV or Excel file here"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>or click to browse • .csv .xlsx .xls</p>
            <input id="file-input" type="file" accept=".csv,.xlsx,.xls" hidden onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          </div>
        </div>
      )}

      {step === "preview" && preview && (
        <div style={{ maxWidth: 800 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <FileSpreadsheet size={20} color="var(--indigo)" />
              <div>
                <div style={{ fontWeight: 600 }}>{file?.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{preview.total_rows} rows • {preview.columns.length} columns</div>
              </div>
            </div>

            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>Column Mapping</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px 12px", alignItems: "center" }}>
              {preview.columns.map((col: string) => (
                <>
                  <div key={`col-${col}`} style={{ fontSize: 13, color: "var(--text-primary)", background: "var(--bg-elevated)", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>{col}</div>
                  <ArrowRight key={`arrow-${col}`} size={14} color="var(--text-muted)" />
                  <select key={`map-${col}`} className="input" style={{ fontSize: 12 }}
                    value={mapping[col] || ""} onChange={e => setMapping(m => ({ ...m, [col]: e.target.value }))}>
                    <option value="">— Skip —</option>
                    {(preview.expected_mappings?.[dataset] || []).map((f: string) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>Data Preview (first 10 rows)</div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>{preview.columns.map((c: string) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.preview.map((row: any, i: number) => (
                    <tr key={i}>{preview.columns.map((c: string) => <td key={c}>{String(row[c] ?? "")}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => { setStep("select"); setPreview(null); setFile(null) }}>← Back</button>
            <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
              {importing ? <Loader2 size={14} /> : <Upload size={14} />}
              {importing ? "Importing…" : `Import ${DATASET_LABELS[dataset]}`}
            </button>
          </div>
        </div>
      )}

      {step === "done" && importResult && (
        <div style={{ maxWidth: 480 }}>
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: "0 auto 16px", display: "block" }} />
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Import Complete</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, margin: "24px 0" }}>
              {[
                { label: "Total Rows", value: importResult.total_rows },
                { label: "Imported", value: importResult.imported, color: "var(--success)" },
                { label: "Skipped", value: importResult.skipped, color: "var(--warning)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color || "var(--text-primary)" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {importResult.validation_errors?.length > 0 && (
              <div style={{ textAlign: "left", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B", marginBottom: 6 }}>
                  <AlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                  {importResult.validation_errors.length} validation warnings
                </div>
                {importResult.validation_errors.slice(0, 3).map((e: any, i: number) => (
                  <div key={i} style={{ fontSize: 11, color: "var(--text-muted)" }}>Row {e.row}: {e.errors.join(", ")}</div>
                ))}
              </div>
            )}
            <button className="btn btn-primary" onClick={() => { setStep("select"); setPreview(null); setFile(null); setImportResult(null) }}>
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </>
  )
}
