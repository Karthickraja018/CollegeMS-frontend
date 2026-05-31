"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@/services/admin"
import { PageHeader, DataTable, FilterBar, SelectFilter, Pagination, Btn, Modal, StatusBadge } from "@/components/ui/admin"
import { Bell, Send, CheckCheck } from "lucide-react"
import { useState } from "react"

const TYPE_OPTS = [
  { value: "attendance_alert", label: "Attendance Alert" },
  { value: "marks_alert", label: "Marks Alert" },
  { value: "fee_overdue", label: "Fee Overdue" },
  { value: "at_risk_flag", label: "At-Risk Flag" },
  { value: "placement_drive", label: "Placement Drive" },
  { value: "general", label: "General" },
]

const ROLE_OPTS = [
  { value: "college_admin", label: "Admin" },
  { value: "principal", label: "Principal" },
  { value: "hod", label: "HOD" },
  { value: "faculty", label: "Faculty" },
  { value: "staff", label: "Staff" },
]

const TYPE_COLORS: Record<string, string> = {
  attendance_alert: "warning", marks_alert: "warning", fee_overdue: "danger",
  at_risk_flag: "danger", placement_drive: "success", general: "default",
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("")
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>()
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({ title: "", body: "", type: "general", role: "" })

  const qc = useQueryClient()

  const { data: result, isLoading } = useQuery({
    queryKey: ["notifications", page, typeFilter, isReadFilter],
    queryFn: () => notificationsApi.list({
      page, page_size: 30,
      type: typeFilter || undefined,
      is_read: isReadFilter,
    }),
    staleTime: 30_000,
  })

  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 15_000,
  })

  const markAllMut = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const broadcastMut = useMutation({
    mutationFn: (data: any) => notificationsApi.broadcast(data),
    onSuccess: (data) => {
      setBroadcastOpen(false)
      setBroadcastForm({ title: "", body: "", type: "general", role: "" })
      alert(`✅ Broadcast sent to ${data.sent_to} users`)
    },
  })

  const notifications = result?.data || []
  const total = result?.total || 0
  const unreadCount = unreadData?.unread_count || 0

  const columns = [
    {
      key: "title", label: "Notification",
      render: (r: any) => (
        <div>
          <div className={`font-semibold text-sm ${r.is_read ? "text-[#64748B]" : "text-[#0F172A]"}`}>{r.title}</div>
          <div className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">{r.body}</div>
        </div>
      ),
    },
    { key: "type", label: "Type", render: (r: any) => <StatusBadge status={TYPE_COLORS[r.type] || "default"} label={r.type.replace(/_/g, " ")} /> },
    {
      key: "recipient_name", label: "Recipient",
      render: (r: any) => (
        <div>
          <div className="text-sm font-semibold text-[#334155]">{r.recipient_name}</div>
          <div className="text-xs text-[#94A3B8]">{r.role}</div>
        </div>
      ),
    },
    {
      key: "is_read", label: "Status",
      render: (r: any) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.is_read ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}>
          {r.is_read ? "Read" : "Unread"}
        </span>
      ),
    },
    {
      key: "created_at", label: "Sent",
      render: (r: any) => (
        <span className="text-xs font-mono text-[#94A3B8]">
          {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="In-app notification center and broadcast system"
        badge={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" icon={CheckCheck} onClick={() => markAllMut.mutate()}>Mark All Read</Btn>
            <Btn variant="primary" icon={Send} onClick={() => setBroadcastOpen(true)}>Broadcast</Btn>
          </div>
        }
      />

      <FilterBar
        filters={
          <>
            <SelectFilter value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1) }} options={TYPE_OPTS} placeholder="All Types" />
            <select
              value={isReadFilter === undefined ? "" : String(isReadFilter)}
              onChange={e => { setIsReadFilter(e.target.value === "" ? undefined : e.target.value === "true"); setPage(1) }}
              className="text-sm px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[#374151] outline-none"
            >
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </>
        }
      />

      <DataTable columns={columns} data={notifications} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No notifications found." />
      <Pagination page={page} pageSize={30} total={total} onChange={setPage} />

      {/* Broadcast Modal */}
      <Modal open={broadcastOpen} title="Broadcast Notification" onClose={() => setBroadcastOpen(false)}>
        <form onSubmit={(e: any) => {
          e.preventDefault()
          broadcastMut.mutate(broadcastForm)
        }} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#374151]">Title *</label>
            <input required value={broadcastForm.title} onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))}
              className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#374151]">Message *</label>
            <textarea required value={broadcastForm.body} onChange={e => setBroadcastForm(f => ({ ...f, body: e.target.value }))}
              rows={3}
              className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Type</label>
              <select value={broadcastForm.type} onChange={e => setBroadcastForm(f => ({ ...f, type: e.target.value }))}
                className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#374151]">Target Role (optional)</label>
              <select value={broadcastForm.role} onChange={e => setBroadcastForm(f => ({ ...f, role: e.target.value }))}
                className="text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#6366F1]/30">
                <option value="">All Users</option>
                {ROLE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Btn variant="secondary" onClick={() => setBroadcastOpen(false)} type="button" className="flex-1">Cancel</Btn>
            <Btn variant="primary" type="submit" isLoading={broadcastMut.isPending} icon={Send} className="flex-1">Send Broadcast</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
