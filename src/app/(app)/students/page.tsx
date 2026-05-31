"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { Search, AlertTriangle, User, ChevronLeft, ChevronRight } from "lucide-react"
import { getRiskBgColor, getRiskLabel, formatPercentage } from "@/lib/utils"

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [deptId, setDeptId] = useState<number | undefined>()
  const [riskOnly, setRiskOnly] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["students", page, search, deptId, riskOnly],
    queryFn: () => api.get("/students", {
      params: {
        page,
        page_size: 20,
        search: search || undefined,
        department_id: deptId,
        risk_min: riskOnly ? 61 : undefined,
      },
    }).then(r => r.data),
  })

  const { data: depts } = useQuery({
    queryKey: ["departments-list"],
    queryFn: () => api.get("/analytics/department-performance").then(r => r.data),
  })

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{data?.total ?? 0} total students</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 240 }}>
          <input
            className="input"
            placeholder="Search by name or roll number…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch} style={{ flexShrink: 0 }}>
            <Search size={14} />
          </button>
        </div>

        <select className="input" style={{ width: "auto", minWidth: 180 }}
          value={deptId ?? ""} onChange={e => { setDeptId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }}>
          <option value="">All Departments</option>
          {(depts || []).map((d: any) => (
            <option key={d.code} value={d.department_id}>{d.code} — {d.department}</option>
          ))}
        </select>

        <button
          className={`btn ${riskOnly ? "btn-danger" : "btn-secondary"}`}
          onClick={() => { setRiskOnly(!riskOnly); setPage(1) }}
        >
          <AlertTriangle size={14} />
          {riskOnly ? "Showing At-Risk" : "Filter At-Risk"}
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Batch</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                    No students found
                  </td>
                </tr>
              ) : (
                data?.data?.map((student: any) => (
                  <tr key={student.id}>
                    <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--indigo)" }}>
                      {student.roll_number}
                    </td>
                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", flexShrink: 0 }}>
                        <User size={13} color="var(--text-muted)" />
                      </div>
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{student.name}</span>
                    </td>
                    <td>
                      <span className="badge badge-indigo">{student.department}</span>
                    </td>
                    <td style={{ color: "var(--text-primary)" }}>Sem {student.semester}</td>
                    <td>{student.batch}</td>
                    <td>
                      <span className={`badge ${getRiskBgColor(student.risk_score)}`} style={{ border: "1px solid" }}>
                        {student.risk_score !== null ? `${student.risk_score} — ${getRiskLabel(student.risk_score)}` : "Not Analyzed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Page {data.page} of {data.total_pages} ({data.total} students)
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "7px 12px" }}>
                <ChevronLeft size={14} />
              </button>
              <button className="btn btn-secondary" disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)} style={{ padding: "7px 12px" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
