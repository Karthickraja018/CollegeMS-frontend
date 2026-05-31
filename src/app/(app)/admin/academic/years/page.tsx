"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { academicYearsApi } from "@/services/admin"
import {
  PageHeader, DataTable, Btn, Modal, FormField, Input, ConfirmDialog,
} from "@/components/ui/admin"
import { Plus, Trash2, Edit2, Calendar, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  label: z.string().min(4, "e.g. 2024-25"),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required"),
  is_current: z.boolean().optional().default(false),
})
type Form = z.infer<typeof schema>

export default function AcademicYearsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const { data: years = [], isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: academicYearsApi.list,
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    // @ts-ignore -- zod coerce types with react-hook-form@^7.53`n    resolver: zodResolver(schema),
  })

  const mut = useMutation({
    mutationFn: (data: any) => editing ? academicYearsApi.update(editing.id, data) : academicYearsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["academic-years"] }); closeModal() },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => academicYearsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["academic-years"] }); setDeleteTarget(null) },
  })

  const openCreate = () => { reset({ is_current: false }); setEditing(null); setModalOpen(true) }
  const openEdit = (y: any) => { setEditing(y); reset({ label: y.label, start_date: y.start_date, end_date: y.end_date, is_current: y.is_current }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const columns = [
    {
      key: "label", label: "Academic Year", sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
            <Calendar size={18} className="text-[#6366F1]" />
          </div>
          <div>
            <div className="font-bold text-[#0F172A] font-mono">{row.label}</div>
            {row.is_current && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={11} /> Current Year
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "start_date", label: "Start Date", sortable: true,
      render: (row: any) => new Date(row.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    },
    {
      key: "end_date", label: "End Date",
      render: (row: any) => new Date(row.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    },
    {
      key: "actions", label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant="secondary" icon={Edit2} onClick={() => openEdit(row)}>Edit</Btn>
          <Btn size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget(row)}>Delete</Btn>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Academic Years"
        subtitle={`${years.length} academic years configured`}
        actions={<Btn icon={Plus} onClick={openCreate}>Add Year</Btn>}
      />

      <DataTable columns={columns} data={years} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No academic years configured." />

      <Modal open={modalOpen} title={editing ? "Edit Academic Year" : "Add Academic Year"} onClose={closeModal}>
        <form onSubmit={handleSubmit((d: any) => mut.mutate(d))} className="flex flex-col gap-4">

          <FormField label="Label (e.g. 2024-25)" required error={errors.label?.message}>
            <Input {...register("label")} placeholder="2024-25" className="font-mono" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required error={errors.start_date?.message}>
              <Input {...register("start_date")} type="date" />
            </FormField>
            <FormField label="End Date" required error={errors.end_date?.message}>
              <Input {...register("end_date")} type="date" />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("is_current")} className="rounded" />
            <span className="text-[#374151] font-medium">Mark as Current Year</span>
          </label>
          <div className="flex gap-3 pt-2 border-t border-[#F1F5F9]">
            <Btn type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Btn>
            <Btn type="submit" loading={mut.isPending} className="flex-1">{editing ? "Save" : "Create"}</Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Academic Year?"
        message={`Delete "${deleteTarget?.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

