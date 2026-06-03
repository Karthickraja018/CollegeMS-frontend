import React from "react"
import { Shield, Check, Minus } from "lucide-react"

const MATRIX_DATA = [
  { module: "Users", admin: "Full", principal: "View", hod: "View", faculty: "No" },
  { module: "Departments", admin: "Full", principal: "View", hod: "View", faculty: "No" },
  { module: "Attendance", admin: "Full", principal: "View", hod: "Manage", faculty: "Manage" },
  { module: "Marks", admin: "Full", principal: "View", hod: "Manage", faculty: "Manage" },
  { module: "Reports", admin: "Full", principal: "Full", hod: "Department", faculty: "Limited" },
  { module: "AI Copilot", admin: "Full", principal: "Full", hod: "Full", faculty: "Limited" },
]

function PermissionBadge({ level }: { level: string }) {
  if (level === "Full") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><Check size={12}/> Full</span>
  }
  if (level === "View") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">View</span>
  }
  if (level === "Manage") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Manage</span>
  }
  if (level === "Department") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Dept</span>
  }
  if (level === "Limited") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Limited</span>
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"><Minus size={12}/> None</span>
}

export function PermissionMatrix() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold">
        <Shield size={18} className="text-indigo-600" />
        Role-Based Permissions Matrix
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Module</th>
              <th className="px-6 py-4 font-semibold text-center">Admin</th>
              <th className="px-6 py-4 font-semibold text-center">Principal</th>
              <th className="px-6 py-4 font-semibold text-center">HOD</th>
              <th className="px-6 py-4 font-semibold text-center">Faculty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MATRIX_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{row.module}</td>
                <td className="px-6 py-4 text-center"><PermissionBadge level={row.admin} /></td>
                <td className="px-6 py-4 text-center"><PermissionBadge level={row.principal} /></td>
                <td className="px-6 py-4 text-center"><PermissionBadge level={row.hod} /></td>
                <td className="px-6 py-4 text-center"><PermissionBadge level={row.faculty} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
