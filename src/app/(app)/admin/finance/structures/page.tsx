"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { financeApi, programsApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Btn, Modal } from "@/components/ui/admin"
import { Plus, Banknote } from "lucide-react"
import { useState } from "react"

export default function FeeStructuresPage() {
  const [ayFilter, setAyFilter] = useState("")
  const [programFilter, setProgramFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  const qc = useQueryClient()

  const { data: structures = [], isLoading } = useQuery({
    queryKey: ["fee-structures", ayFilter, programFilter],
    queryFn: () => financeApi.listStructures({
      academic_year: ayFilter || undefined,
      program_id: programFilter ? Number(programFilter) : undefined,
    }),
    staleTime: 30_000,
  })

  const { data: programs = [] } = useQuery({ queryKey: ["programs"], queryFn: () => programsApi.list() })

  const createMut = useMutation({
    mutationFn: (data: any) => financeApi.createStructure(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee-structures"] }); setModalOpen(false) },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => financeApi.deleteStructure(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fee-structures"] }),
  })

  const columns = [
    {
      key: "academic_year", label: "Year",
      render: (r: any) => <span className="font-mono text-sm font-semibold">{r.academic_year}</span>,
    },
    {
      key: "program_name", label: "Program",
      render: (r: any) => (
        <div>
          <div className="font-semibold text-sm text-[#0F172A]">{r.program_name}</div>
          <div className="text-xs text-[#94A3B8]">{r.department_name}</div>
        </div>
      ),
    },
    { key: "batch", label: "Batch", render: (r: any) => r.batch || "All" },
    { key: "semester", label: "Semester", render: (r: any) => r.semester ? `Sem ${r.semester}` : "All" },
    { key: "tuition_fee", label: "Tuition", render: (r: any) => `₹${Number(r.tuition_fee).toLocaleString("en-IN")}` },
    { key: "total_amount", label: "Total Fee", render: (r: any) => <span className="font-bold text-[#6366F1]">₹{Number(r.total_amount).toLocaleString("en-IN")}</span> },
    {
      key: "actions", label: "",
      render: (r: any) => (
        <button onClick={() => { if(confirm("Delete this fee structure?")) deleteMut.mutate(r.id) }} className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 transition font-medium">
          Delete
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fee Structures"
        subtitle="Manage program-wise fee templates"
        badge={`${structures.length} templates`}
        actions={<Btn variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Add Structure</Btn>}
      />

      <FilterBar
        filters={
          <>
            <SelectFilter value={ayFilter} onChange={setAyFilter} options={["2024-25", "2023-24", "2022-23"].map(y => ({ value: y, label: y }))} placeholder="All Years" />
            <SelectFilter value={programFilter} onChange={setProgramFilter} options={programs.map((p: any) => ({ value: String(p.id), label: p.code }))} placeholder="All Programs" />
          </>
        }
      />

      <DataTable columns={columns} data={structures} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No fee structures found." />

      <Modal open={modalOpen} title="Create Fee Structure" onClose={() => setModalOpen(false)}>
        <form onSubmit={(e: any) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          createMut.mutate({
            academic_year: fd.get("academic_year"),
            program_id: Number(fd.get("program_id")),
            batch: fd.get("batch") || null,
            semester: fd.get("semester") ? Number(fd.get("semester")) : null,
            tuition_fee: Number(fd.get("tuition_fee")),
            hostel_fee: Number(fd.get("hostel_fee")),
            transport_fee: Number(fd.get("transport_fee")),
            other_fees: Number(fd.get("other_fees")),
          })
        }} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-[#374151]">Academic Year *</label>
              <select name="academic_year" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-[#374151]">Program *</label>
              <select name="program_id" required className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                <option value="">— Select Program —</option>
                {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Batch (Optional)</label>
              <input name="batch" placeholder="e.g. 2021-2025" className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Semester (Optional)</label>
              <input name="semester" type="number" min={1} max={10} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            
            <div className="col-span-2 border-t border-[#E2E8F0] my-2"></div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Tuition Fee *</label>
              <input name="tuition_fee" type="number" required defaultValue={0} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Hostel Fee *</label>
              <input name="hostel_fee" type="number" required defaultValue={0} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Transport Fee *</label>
              <input name="transport_fee" type="number" required defaultValue={0} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Other Fees *</label>
              <input name="other_fees" type="number" required defaultValue={0} className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setModalOpen(false)} type="button" className="flex-1">Cancel</Btn>
            <Btn variant="primary" type="submit" isLoading={createMut.isPending} className="flex-1">Create</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
