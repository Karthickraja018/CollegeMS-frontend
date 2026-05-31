"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceApi, semestersApi, departmentsApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, Modal, Btn, StatusBadge } from "@/components/ui/admin"
import { useState } from "react"
import { Edit3 } from "lucide-react"

export default function AttendanceCorrectionsPage() {
  const [page, setPage] = useState(1)
  const [semFilter, setSemFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  const qc = useQueryClient()

  const { data: result, isLoading } = useQuery({
    queryKey: ["attendance-records", page, semFilter, deptFilter, dateFilter],
    queryFn: () => attendanceApi.getRecords({
      page, page_size: 50,
      semester_id: semFilter ? Number(semFilter) : undefined,
      department_id: deptFilter ? Number(deptFilter) : undefined,
      date: dateFilter || undefined,
    }),
    staleTime: 30_000,
  })

  const { data: semesters = [] } = useQuery({ queryKey: ["semesters"], queryFn: () => semestersApi.list() })
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: () => departmentsApi.list({ is_active: true }) })

  const updateMut = useMutation({
    mutationFn: (data: { record_id: number, new_status: string, remarks?: string }) => attendanceApi.correctRecord(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance-records"] }); setModalOpen(false) },
  })

  const records = result?.data || []
  const total = result?.total || 0

  const columns = [
    {
      key: "date", label: "Date",
      render: (r: any) => <span className="text-sm font-semibold text-[#0F172A]">{new Date(r.date).toLocaleDateString("en-IN")}</span>,
    },
    {
      key: "student", label: "Student",
      render: (r: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{r.student_name}</div>
          <div className="text-xs text-[#94A3B8]">{r.roll_number}</div>
        </div>
      ),
    },
    {
      key: "subject", label: "Subject",
      render: (r: any) => (
        <div>
          <div className="font-bold text-xs text-[#6366F1] font-mono">{r.subject_code}</div>
          <div className="text-xs text-[#94A3B8] line-clamp-1">{r.subject_name}</div>
        </div>
      ),
    },
    { key: "period", label: "Period", render: (r: any) => r.period ? `Period ${r.period}` : "—" },
    {
      key: "status", label: "Status",
      render: (r: any) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "present" ? "bg-green-100 text-green-700" : r.status === "absent" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
          {r.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "remarks", label: "Remarks",
      render: (r: any) => <span className="text-xs text-[#64748B] italic">{r.remarks || "—"}</span>,
    },
    {
      key: "actions", label: "",
      render: (r: any) => (
        <button onClick={() => { setSelectedRecord(r); setModalOpen(true) }} className="text-[#6366F1] hover:bg-[#EEF2FF] p-1.5 rounded transition">
          <Edit3 size={14} />
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Attendance Corrections" subtitle="View and correct student attendance records" badge={`${total} records`} />

      <FilterBar
        filters={
          <>
            <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }} options={departments.map((d: any) => ({ value: String(d.id), label: d.code }))} placeholder="All Departments" />
            <SelectFilter value={semFilter} onChange={(v) => { setSemFilter(v); setPage(1) }} options={semesters.map((s: any) => ({ value: String(s.id), label: `${s.program_name} - Sem ${s.semester_number}` }))} placeholder="All Semesters" />
            <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }}
              className="text-sm px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[#374151] outline-none" />
          </>
        }
      />

      <DataTable columns={columns} data={records} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No attendance records found for the selected filters." />
      <Pagination page={page} pageSize={50} total={total} onChange={setPage} />

      {selectedRecord && (
        <Modal open={modalOpen} title="Correct Attendance" subtitle={`${selectedRecord.student_name} (${selectedRecord.subject_code} - ${new Date(selectedRecord.date).toLocaleDateString("en-IN")})`} onClose={() => setModalOpen(false)}>
          <form onSubmit={(e: any) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            updateMut.mutate({
              record_id: selectedRecord.id,
              new_status: fd.get("status") as string,
              remarks: fd.get("remarks") as string,
            })
          }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Update Status To *</label>
              <select name="status" defaultValue={selectedRecord.status} required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="on_duty">On Duty</option>
                <option value="late">Late</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Correction Remarks (Reason)</label>
              <input name="remarks" defaultValue={selectedRecord.remarks || ""} placeholder="e.g. Medical emergency approved by HOD" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="secondary" onClick={() => setModalOpen(false)} type="button" className="flex-1">Cancel</Btn>
              <Btn variant="primary" type="submit" isLoading={updateMut.isPending} className="flex-1">Save Correction</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
