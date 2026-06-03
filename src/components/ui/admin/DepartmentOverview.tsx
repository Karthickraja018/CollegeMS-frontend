import React from "react"
import { Building2, Users, AlertCircle, CheckCircle2 } from "lucide-react"

export function DepartmentOverview({ departments, loading }: { departments: any[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
            <div className="h-4 bg-slate-200 w-1/2 rounded mb-4"></div>
            <div className="h-3 bg-slate-100 w-full rounded mb-2"></div>
            <div className="h-3 bg-slate-100 w-3/4 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-500">
        No departments found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((dept, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Building2 size={18} className="text-indigo-500" />
              {dept.name}
            </div>
            {dept.health_status === "Healthy" && <CheckCircle2 size={18} className="text-emerald-500" />}
            {dept.health_status === "Stable" && <CheckCircle2 size={18} className="text-blue-500" />}
            {dept.health_status === "Needs Attention" && <AlertCircle size={18} className="text-amber-500" />}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Faculty Count</span>
              <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                {dept.faculty_count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">HOD</span>
              <span className="font-medium text-slate-700 truncate max-w-[140px]" title={dept.hod_name || "Unassigned"}>
                {dept.hod_name || "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 mt-2">
              <span className="text-slate-500">Status</span>
              <span className={`font-medium ${
                dept.health_status === "Healthy" ? "text-emerald-600" :
                dept.health_status === "Stable" ? "text-blue-600" :
                "text-amber-600"
              }`}>
                {dept.health_status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
