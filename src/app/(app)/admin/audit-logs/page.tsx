"use client"

import { useQuery } from "@tanstack/react-query"
import { auditApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination } from "@/components/ui/admin"
import { Shield } from "lucide-react"
import { useState } from "react"

const ACTION_COLORS: Record<string, string> = {
  INSERT: "bg-green-50 text-green-700",
  UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700",
  SELECT_EXPORT: "bg-purple-50 text-purple-700",
}

const TABLE_OPTS = [
  "students", "users", "attendance_records", "marks_records",
  "fee_accounts", "fee_transactions", "placement_drives", "notifications",
].map(t => ({ value: t, label: t }))

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [tableFilter, setTableFilter] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { data: result, isLoading } = useQuery({
    queryKey: ["audit-logs", page, tableFilter, actionFilter, dateFrom, dateTo],
    queryFn: () => auditApi.getLogs({
      page, page_size: 50,
      table_name: tableFilter || undefined,
      action: actionFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    staleTime: 30_000,
  })

  const { data: statsData } = useQuery({ queryKey: ["audit-stats"], queryFn: auditApi.getStats })

  const logs = result?.data || []
  const total = result?.total || 0
  const byAction = statsData?.by_action || []

  const columns = [
    {
      key: "created_at", label: "Timestamp",
      render: (r: any) => (
        <div className="font-mono text-xs text-[#64748B]">
          {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
        </div>
      ),
    },
    {
      key: "user_name", label: "User",
      render: (r: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{r.user_name || "System"}</div>
          <div className="text-xs font-mono text-[#94A3B8]">{r.role || ""}</div>
        </div>
      ),
    },
    {
      key: "action", label: "Action",
      render: (r: any) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTION_COLORS[r.action] || "bg-gray-50 text-gray-600"}`}>
          {r.action}
        </span>
      ),
    },
    {
      key: "table_name", label: "Table",
      render: (r: any) => <span className="font-mono text-xs font-semibold text-[#6366F1]">{r.table_name}</span>,
    },
    { key: "record_id", label: "Record ID", render: (r: any) => <span className="font-mono text-xs">{r.record_id || "—"}</span> },
    {
      key: "ip_address", label: "IP",
      render: (r: any) => <span className="font-mono text-xs text-[#94A3B8]">{r.ip_address || "—"}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete compliance trail of all data changes"
        badge={`${total.toLocaleString()} events`}
      />

      {/* Action summary pills */}
      {byAction.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {byAction.map((a: any) => (
            <button
              key={a.action}
              onClick={() => setActionFilter(actionFilter === a.action ? "" : a.action)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${actionFilter === a.action ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]" : "border-[#E2E8F0] bg-white text-[#64748B]"}`}
            >
              <span className={`w-2 h-2 rounded-full ${ACTION_COLORS[a.action]?.split(" ")[0]}`} />
              {a.action}: {a.count.toLocaleString()}
            </button>
          ))}
        </div>
      )}

      <FilterBar
        filters={
          <>
            <SelectFilter value={tableFilter} onChange={(v) => { setTableFilter(v); setPage(1) }} options={TABLE_OPTS} placeholder="All Tables" />
            <SelectFilter value={actionFilter} onChange={(v) => { setActionFilter(v); setPage(1) }}
              options={["INSERT", "UPDATE", "DELETE", "SELECT_EXPORT"].map(a => ({ value: a, label: a }))} placeholder="All Actions" />
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                className="text-sm px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white outline-none" />
              <span className="text-xs text-[#94A3B8]">to</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
                className="text-sm px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white outline-none" />
            </div>
          </>
        }
      />

      <DataTable columns={columns} data={logs} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No audit events found." />
      <Pagination page={page} pageSize={50} total={total} onChange={setPage} />
    </div>
  )
}
