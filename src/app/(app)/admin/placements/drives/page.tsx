"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { placementsApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, StatusBadge, Btn, Modal } from "@/components/ui/admin"
import { Plus, Building2, Calendar, Banknote, ExternalLink } from "lucide-react"
import { useState } from "react"

const STATUS_OPTS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const DRIVE_TYPE_OPTS = [
  { value: "on_campus", label: "On Campus" },
  { value: "off_campus", label: "Off Campus" },
  { value: "pool_campus", label: "Pool Campus" },
  { value: "internship", label: "Internship" },
  { value: "ppo", label: "PPO" },
]

const STATUS_COLOR: Record<string, string> = {
  upcoming: "default", active: "success", completed: "purple", cancelled: "danger",
}

export default function PlacementDrivesPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  const qc = useQueryClient()

  const { data: result, isLoading } = useQuery({
    queryKey: ["placement-drives", page, statusFilter, typeFilter, search],
    queryFn: () => placementsApi.listDrives({
      page, page_size: 20,
      status: statusFilter || undefined,
      drive_type: typeFilter || undefined,
      search: search || undefined,
    }),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (data: any) => placementsApi.createDrive(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["placement-drives"] }); setModalOpen(false) },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => placementsApi.deleteDrive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["placement-drives"] }),
  })

  const drives = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "company_name", label: "Company",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.company_name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">{row.company_name}</div>
            <div className="text-xs text-[#94A3B8]">{row.industry || "—"}</div>
          </div>
        </div>
      ),
    },
    { key: "job_role", label: "Role" },
    {
      key: "ctc_lpa", label: "CTC",
      render: (r: any) => r.ctc_lpa ? <span className="font-bold font-mono text-[#6366F1]">{r.ctc_lpa} LPA</span> : <span className="text-[#94A3B8]">—</span>,
    },
    {
      key: "drive_type", label: "Type",
      render: (r: any) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1]">{r.drive_type.replace("_", " ")}</span>,
    },
    {
      key: "drive_date", label: "Drive Date",
      render: (r: any) => r.drive_date ? new Date(r.drive_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
    },
    {
      key: "status", label: "Status",
      render: (r: any) => <StatusBadge status={STATUS_COLOR[r.status] || "default"} label={r.status} />,
    },
    {
      key: "stats", label: "Applications",
      render: (r: any) => (
        <div className="text-xs text-[#64748B]">
          {r.total_applications} total · <span className="text-green-600 font-semibold">{r.selected_count} selected</span>
        </div>
      ),
    },
    {
      key: "actions", label: "",
      render: (r: any) => (
        <div className="flex gap-1">
          <button
            onClick={() => deleteMut.mutate(r.id)}
            className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 transition font-medium"
          >Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Placement Drives"
        subtitle="Manage company drives and recruitment campaigns"
        badge={`${total} drives`}
        actions={<Btn variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Add Drive</Btn>}
      />

      <FilterBar
        searchPlaceholder="Search by company name…"
        onSearch={(v) => { setSearch(v); setPage(1) }}
        filters={
          <>
            <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} options={STATUS_OPTS} placeholder="All Statuses" />
            <SelectFilter value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1) }} options={DRIVE_TYPE_OPTS} placeholder="All Types" />
          </>
        }
      />

      <DataTable columns={columns} data={drives} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No placement drives found." />
      <Pagination page={page} pageSize={20} total={total} onChange={setPage} />

      {/* Create Drive Modal */}
      <Modal open={modalOpen} title="Add Placement Drive" onClose={() => setModalOpen(false)}>
        <form onSubmit={(e: any) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          createMut.mutate({
            company_name: fd.get("company_name"),
            job_role: fd.get("job_role"),
            industry: fd.get("industry"),
            ctc_lpa: fd.get("ctc_lpa"),
            drive_type: fd.get("drive_type"),
            drive_date: fd.get("drive_date"),
            registration_deadline: fd.get("registration_deadline"),
            min_cgpa: fd.get("min_cgpa"),
            max_backlogs: fd.get("max_backlogs"),
            status: "upcoming",
          })
        }} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-[#374151]">Company Name *</label>
              <input name="company_name" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-[#374151]">Job Role *</label>
              <input name="job_role" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Industry</label>
              <input name="industry" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">CTC (LPA)</label>
              <input name="ctc_lpa" type="number" step="0.01" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Drive Type</label>
              <select name="drive_type" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                {DRIVE_TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Drive Date</label>
              <input name="drive_date" type="date" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Registration Deadline</label>
              <input name="registration_deadline" type="date" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Min CGPA</label>
              <input name="min_cgpa" type="number" step="0.01" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setModalOpen(false)} type="button" className="flex-1">Cancel</Btn>
            <Btn variant="primary" type="submit" isLoading={createMut.isPending} className="flex-1">Create Drive</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
