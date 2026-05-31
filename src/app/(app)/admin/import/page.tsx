"use client"

import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { importApi } from "@/services/admin"
import { PageHeader, Btn, StatCard } from "@/components/ui/admin"
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from "lucide-react"

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<"students" | "faculty">("students")
  const [result, setResult] = useState<any>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const importMut = useMutation({
    mutationFn: async (formData: FormData) => {
      if (importType === "students") return importApi.importStudents(formData)
      if (importType === "faculty") return importApi.importFaculty(formData)
    },
    onSuccess: (data) => {
      setResult(data)
      if (importType === "students") qc.invalidateQueries({ queryKey: ["students"] })
      if (importType === "faculty") qc.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Import failed")
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      if (!f.name.endsWith(".csv")) {
        alert("Please select a CSV file")
        return
      }
      setFile(f)
      setResult(null)
    }
  }

  const handleUpload = () => {
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    importMut.mutate(fd)
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader 
        title="Data Import" 
        subtitle="Bulk import students and faculty via CSV files"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Config Panel */}
        <div className="col-span-1 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">Import Settings</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Entity Type</label>
              <select 
                value={importType} 
                onChange={(e: any) => setImportType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
              >
                <option value="students">Students</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#475569]">
              <div className="font-semibold text-[#0F172A] mb-1">Required Columns:</div>
              {importType === "students" ? (
                <ul className="list-disc pl-4 space-y-0.5 text-xs font-mono">
                  <li>name</li>
                  <li>email</li>
                  <li>roll_number</li>
                  <li>department_id</li>
                  <li>program_id</li>
                  <li>batch</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-0.5 text-xs font-mono">
                  <li>email</li>
                  <li>full_name</li>
                  <li>employee_id</li>
                  <li>department_id</li>
                </ul>
              )}
              <div className="font-semibold text-[#0F172A] mt-3 mb-1">Optional Columns:</div>
              {importType === "students" ? (
                <ul className="list-disc pl-4 space-y-0.5 text-xs font-mono text-[#64748B]">
                  <li>register_number</li>
                  <li>phone</li>
                  <li>gender (male/female/other)</li>
                  <li>dob (YYYY-MM-DD)</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-0.5 text-xs font-mono text-[#64748B]">
                  <li>designation</li>
                  <li>qualification</li>
                  <li>experience_years</li>
                  <li>phone</li>
                </ul>
              )}
            </div>
            
            <a 
              href={`/templates/${importType}_template.csv`} 
              className="text-xs font-semibold text-[#6366F1] hover:underline"
              download
            >
              Download CSV Template
            </a>
          </div>
        </div>

        {/* Upload Panel */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          
          {!result ? (
            <div 
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${file ? 'border-[#6366F1] bg-[#EEF2FF]' : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8] hover:bg-[#F8FAFC]'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const f = e.dataTransfer.files[0]
                  if (f.name.endsWith('.csv')) setFile(f)
                }
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              {file ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-white border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1] mb-3">
                    <FileType size={28} />
                  </div>
                  <div className="font-semibold text-[#0F172A] mb-1">{file.name}</div>
                  <div className="text-xs text-[#64748B] mb-6">{(file.size / 1024).toFixed(1)} KB</div>
                  <div className="flex gap-2">
                    <Btn variant="secondary" size="sm" onClick={reset}>Change File</Btn>
                    <Btn variant="primary" size="sm" onClick={handleUpload} isLoading={importMut.isPending}>
                      Start Import
                    </Btn>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-3">
                    <UploadCloud size={28} />
                  </div>
                  <div className="font-semibold text-[#0F172A] mb-1">Drag and drop your CSV file here</div>
                  <div className="text-sm text-[#64748B] mb-6">or click to browse from your computer</div>
                  <Btn variant="secondary" onClick={() => fileInputRef.current?.click()}>Browse Files</Btn>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">Import Complete</h3>
                  <p className="text-sm text-[#64748B]">Your data has been processed.</p>
                </div>
                <Btn variant="secondary" size="sm" onClick={reset}>Import Another</Btn>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={32} className="text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-700">{result.success_count}</div>
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">Successfully Imported</div>
                </div>
                <div className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center ${result.error_count > 0 ? 'bg-red-50 border-red-100' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                  <AlertCircle size={32} className={result.error_count > 0 ? "text-red-500 mb-2" : "text-[#94A3B8] mb-2"} />
                  <div className={`text-2xl font-bold ${result.error_count > 0 ? "text-red-700" : "text-[#475569]"}`}>{result.error_count}</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${result.error_count > 0 ? "text-red-600" : "text-[#64748B]"}`}>Errors Found</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-2">Error Details</h4>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 max-h-[200px] overflow-y-auto">
                    <ul className="list-disc pl-4 space-y-1">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i} className="text-xs text-red-600 font-mono">{err}</li>
                      ))}
                    </ul>
                  </div>
                  {result.error_count > 10 && (
                    <div className="text-xs text-[#94A3B8] mt-2 italic">Showing first 10 errors only.</div>
                  )}
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
