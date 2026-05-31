"use client"

import { useQuery } from "@tanstack/react-query"
import { financeApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, StatusBadge } from "@/components/ui/admin"
import { useState } from "react"

const MODE_OPTS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Net Banking" },
  { value: "dd", label: "Demand Draft" },
]

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [modeFilter, setModeFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { data: result, isLoading } = useQuery({
    queryKey: ["fee-transactions", page, modeFilter, dateFrom, dateTo],
    queryFn: () => financeApi.listTransactions({
      page, page_size: 30,
      mode: modeFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    staleTime: 30_000,
  })

  const transactions = result?.data || []
  const total = result?.total || 0

  const columns = [
    { key: "transaction_id", label: "Txn ID", render: (r: any) => <span className="font-mono text-xs">{r.transaction_id}</span> },
    {
      key: "student", label: "Student",
      render: (r: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{r.student_name}</div>
          <div className="text-xs text-[#94A3B8]">{r.roll_number}</div>
        </div>
      ),
    },
    { key: "academic_year", label: "Year", render: (r: any) => <span className="font-mono text-xs">{r.academic_year}</span> },
    { key: "amount", label: "Amount", render: (r: any) => <span className="font-bold text-green-600">₹{Number(r.amount).toLocaleString("en-IN")}</span> },
    { key: "mode", label: "Mode", render: (r: any) => <StatusBadge status={r.status === "failed" ? "danger" : "default"} label={r.mode.toUpperCase()} /> },
    { key: "reference_number", label: "Ref No", render: (r: any) => <span className="font-mono text-xs">{r.reference_number || "—"}</span> },
    {
      key: "payment_date", label: "Date",
      render: (r: any) => <span className="text-sm">{new Date(r.payment_date).toLocaleDateString("en-IN")}</span>,
    },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status === "failed" ? "danger" : "success"} label={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Fee Transactions"
        subtitle="Record of all payments and fee collections"
        badge={`${total} transactions`}
      />

      <FilterBar
        filters={
          <>
            <SelectFilter value={modeFilter} onChange={(v) => { setModeFilter(v); setPage(1) }} options={MODE_OPTS} placeholder="All Modes" />
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

      <DataTable columns={columns} data={transactions} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No transactions found." />
      <Pagination page={page} pageSize={30} total={total} onChange={setPage} />
    </div>
  )
}
