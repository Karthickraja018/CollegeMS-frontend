"use client"

import { useUserStore } from "@/store"
import { useCommunications, useSendCommunication } from "@/queries/operations/useOperations"
import { MessageSquare, Search, Send, Clock, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function CommunicationsPage() {
  const user = useUserStore((s) => s.user)
  const { data, isLoading } = useCommunications()
  const sendMutation = useSendCommunication()

  const communications = data?.communications || []
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({
    recipient_id: "",
    subject: "",
    message: "",
    message_type: "alert",
    priority: "normal"
  })

  const filtered = communications.filter((c: any) => 
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.recipient_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recipient_id || !form.subject || !form.message) return
    sendMutation.mutate({
      recipient_id: parseInt(form.recipient_id),
      subject: form.subject,
      message: form.message,
      message_type: form.message_type,
      priority: form.priority
    }, {
      onSuccess: () => {
        setForm({ ...form, subject: "", message: "" })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <MessageSquare size={24} className="text-[#6366F1]" />
            Communication Center
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Send and track internal notifications to faculty and students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Compose Form */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Compose Message</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Recipient ID (User ID)</label>
                <input
                  value={form.recipient_id}
                  onChange={e => setForm({...form, recipient_id: e.target.value})}
                  className="w-full text-sm p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#6366F1]"
                  placeholder="e.g. 23"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Type</label>
                <select
                  value={form.message_type}
                  onChange={e => setForm({...form, message_type: e.target.value})}
                  className="w-full text-sm p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="alert">Alert</option>
                  <option value="reminder">Reminder</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}
                  className="w-full text-sm p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Subject</label>
                <input
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  className="w-full text-sm p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#6366F1]"
                  placeholder="Message subject"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] mb-1 block">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full text-sm p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#6366F1] min-h-[100px] resize-y"
                  placeholder="Type your message here..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#6366F1] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#4F46E5] disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
                {sendMutation.isPending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search communications..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/20 shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-[#94A3B8]">
                  <MessageSquare size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No communications found.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {filtered.map((c: any) => (
                    <div key={c.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-semibold text-[#0F172A]">{c.subject}</div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            c.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            c.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {c.priority}
                          </span>
                          <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-[#475569] mb-2">{c.message}</div>
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <span className="text-[#64748B]">To: <span className="text-[#0F172A]">{c.recipient_name}</span></span>
                        {c.read_at ? (
                          <span className="text-emerald-600">Read on {new Date(c.read_at).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-amber-500 flex items-center gap-1">
                            <AlertCircle size={12} /> Unread
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
