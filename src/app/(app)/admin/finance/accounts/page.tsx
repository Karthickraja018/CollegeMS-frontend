"use client"

import { useQuery } from "@tanstack/react-query"
import { financeApi, programsApi, departmentsApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, StatusBadge, Btn } from "@/components/ui/admin"
import { Plus, IndianRupee } from "lucide-react"
import { useState } from "react"

const STATUS_COLORS: Record<string, string> = {
  paid: "success", overdue: "danger", due: "default",
  partially_paid: "warning", waived: "purple",
}

export default function FeeAccountsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [ayFilter, setAyFilter] = useState("")
  const [search, setSearch] = useState("")

  const { data: result, isLoading } = useQuery({
    queryKey: ["fee-accounts", page, statusFilter, deptFilter, ayFilter, search],
    queryFn: () => financeApi.listAccounts({
      page, page_size: 30,
      status: statusFilter || undefined,
      department_id: deptFilter ? Number(deptFilter) : undefined,
      academic_year: ayFilter || undefined,
      search: search || undefined,
    }),
    staleTime: 30_000,
  })

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: () => departmentsApi.list({ is_active: true }) })

  const accounts = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "student_name", label: "Student",
      render: (row: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{row.student_name}</div>
          <div className="text-xs font-mono text-[#94A3B8]">{row.roll_number}</div>
        </div>
      ),
    },
    { key: "department_name", label: "Department" },
    { key: "program_code", label: "Program", render: (r: any) => <span className="font-mono text-xs">{r.program_code}</span> },
    { key: "academic_year", label: "Year", render: (r: any) => <span className="font-mono text-xs">{r.academic_year}</span> },
    { key: "total_due", label: "Due", render: (r: any) => <span className="font-semibold">₹{Number(r.total_due).toLocaleString("en-IN")}</span> },
    { key: "total_paid", label: "Paid", render: (r: any) => <span className="font-semibold text-green-600">₹{Number(r.total_paid).toLocaleString("en-IN")}</span> },
    { key: "balance", label: "Balance", render: (r: any) => (
      <span className={`font-bold text-sm ${Number(r.balance) > 0 ? "text-red-600" : "text-green-600"}`}>
        ₹{Number(r.balance).toLocaleString("en-IN")}
      </span>
    )},
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={STATUS_COLORS[r.status] || "default"} label={r.status.replace("_", " ")} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Fee Accounts"
        subtitle="Student fee accounts and balance overview"
        badge={`${total} accounts`}
        actions={<Btn variant="primary" icon={IndianRupee}>Record Payment</Btn>}
      />

      <FilterBar
        searchPlaceholder="Search by name or roll number…"
        onSearch={(v) => { setSearch(v); setPage(1) }}
        filters={
          <>
            <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }}
              options={[
                { value: "paid", label: "Paid" },
                { value: "overdue", label: "Overdue" },
                { value: "due", label: "Due" },
                { value: "partially_paid", label: "Partially Paid" },
                { value: "waived", label: "Waived" },
              ]} placeholder="All Statuses" />
            <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }}
              options={departments.map((d: any) => ({ value: String(d.id), label: d.name }))} placeholder="All Departments" />
            <SelectFilter value={ayFilter} onChange={(v) => { setAyFilter(v); setPage(1) }}
              options={["2024-25", "2023-24", "2022-23"].map(y => ({ value: y, label: y }))} placeholder="All Years" />
          </>
        }
      />

      <DataTable columns={columns} data={accounts} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No fee accounts found." />
      <Pagination page={page} pageSize={30} total={total} onChange={setPage} />
    </div>
  )
}
