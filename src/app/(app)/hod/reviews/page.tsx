"use client"

import { useUserStore } from "@/store"
import { useDepartmentReviews, useUpdateReviewStatus } from "@/queries/operations/useOperations"
import { ScrollText, Search, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function DepartmentReviewsPage() {
  const user = useUserStore((s) => s.user)
  const { data, isLoading } = useDepartmentReviews()
  const updateStatusMutation = useUpdateReviewStatus()

  const reviews = data?.reviews || []
  const [search, setSearch] = useState("")

  const filtered = reviews.filter((r: any) => 
    r.period.toLowerCase().includes(search.toLowerCase()) ||
    r.department_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <ScrollText size={24} className="text-[#6366F1]" />
            Department Reviews
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Principal-HOD performance reviews and action items
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Controls */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/20 shadow-sm"
            />
          </div>
          <div className="text-sm text-[#64748B]">
            {filtered.length} reviews
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-4 grid grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-2 py-16 flex flex-col items-center justify-center text-[#94A3B8]">
              <FileText size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No department reviews found.</p>
            </div>
          ) : (
            filtered.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{r.department_name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {r.period}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-slate-700 mb-4 flex-1">
                  <div className="font-semibold text-xs text-slate-500 mb-1 uppercase tracking-wider">Notes</div>
                  {r.notes || <span className="italic text-slate-400">No notes provided.</span>}
                </div>

                {r.focus_areas && r.focus_areas.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Focus Areas</div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.focus_areas.map((fa: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md border border-slate-200">
                          {fa}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Created by {r.reviewer_name}
                  </div>
                  {r.status === "pending" && user?.role === "hod" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "in_progress")}
                      disabled={updateStatusMutation.isPending}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {r.status === "in_progress" && (user?.role === "hod" || user?.role === "principal") && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "completed")}
                      disabled={updateStatusMutation.isPending}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
