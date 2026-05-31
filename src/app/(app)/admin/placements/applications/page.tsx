"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { placementsApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, StatusBadge, Modal, Btn } from "@/components/ui/admin"
import { useState } from "react"

const STATUS_OPTS = [
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
]

const STATUS_COLORS: Record<string, string> = {
  applied: "default", shortlisted: "info", interviewing: "warning", selected: "success", rejected: "danger",
}

export default function PlacementApplicationsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [driveFilter, setDriveFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<any>(null)

  const qc = useQueryClient()

  const { data: drivesResult } = useQuery({ queryKey: ["placement-drives-list"], queryFn: () => placementsApi.listDrives({ page_size: 100 }) })
  const drives = drivesResult?.data || []

  const { data: result, isLoading } = useQuery({
    queryKey: ["placement-apps", page, statusFilter, driveFilter],
    queryFn: () => placementsApi.listApplications({
      page, page_size: 30,
      status: statusFilter || undefined,
      drive_id: driveFilter ? Number(driveFilter) : undefined,
    }),
    staleTime: 30_000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => placementsApi.updateApplicationStatus(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["placement-apps"] }); setModalOpen(false) },
  })

  const applications = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "student", label: "Student",
      render: (r: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{r.student_name}</div>
          <div className="text-xs text-[#94A3B8]">{r.roll_number}</div>
        </div>
      ),
    },
    { key: "program", label: "Program", render: (r: any) => <span className="font-mono text-xs">{r.program_code}</span> },
    { key: "department_name", label: "Department" },
    {
      key: "company", label: "Company / Role",
      render: (r: any) => (
        <div>
          <div className="font-bold text-sm text-[#0F172A]">{r.company_name}</div>
          <div className="text-xs text-[#6366F1] font-semibold">{r.job_role}</div>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={STATUS_COLORS[r.status] || "default"} label={r.status} /> },
    { key: "round_cleared", label: "Round Cleared", render: (r: any) => r.round_cleared || "0" },
    {
      key: "offer", label: "Offer Details",
      render: (r: any) => r.ctc_offered ? (
        <div>
          <div className="font-bold font-mono text-green-600">{r.ctc_offered} LPA</div>
          {r.is_accepted && <span className="text-[10px] font-bold uppercase text-white bg-green-500 px-1 rounded">Accepted</span>}
        </div>
      ) : <span className="text-[#94A3B8]">—</span>,
    },
    {
      key: "actions", label: "",
      render: (r: any) => (
        <button onClick={() => { setSelectedApp(r); setModalOpen(true) }} className="text-xs px-2 py-1 rounded-lg text-[#6366F1] hover:bg-[#EEF2FF] transition font-medium">
          Update
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Placement Applications" subtitle="Track student applications, rounds, and offers" badge={`${total} applications`} />

      <FilterBar
        filters={
          <>
            <SelectFilter value={driveFilter} onChange={(v) => { setDriveFilter(v); setPage(1) }} options={drives.map((d: any) => ({ value: String(d.id), label: d.company_name }))} placeholder="All Drives" />
            <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} options={STATUS_OPTS} placeholder="All Statuses" />
          </>
        }
      />

      <DataTable columns={columns} data={applications} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No applications found." />
      <Pagination page={page} pageSize={30} total={total} onChange={setPage} />

      {selectedApp && (
        <Modal open={modalOpen} title="Update Application Status" subtitle={`${selectedApp.student_name} — ${selectedApp.company_name}`} onClose={() => setModalOpen(false)}>
          <form onSubmit={(e: any) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            updateMut.mutate({
              id: selectedApp.id,
              data: {
                status: fd.get("status"),
                round_cleared: Number(fd.get("round_cleared")),
                notes: fd.get("notes"),
              }
            })
          }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Status *</label>
              <select name="status" defaultValue={selectedApp.status} required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Rounds Cleared</label>
              <input name="round_cleared" type="number" defaultValue={selectedApp.round_cleared || 0} min={0} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Internal Notes</label>
              <textarea name="notes" defaultValue={selectedApp.notes || ""} rows={3} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="secondary" onClick={() => setModalOpen(false)} type="button" className="flex-1">Cancel</Btn>
              <Btn variant="primary" type="submit" isLoading={updateMut.isPending} className="flex-1">Update</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
