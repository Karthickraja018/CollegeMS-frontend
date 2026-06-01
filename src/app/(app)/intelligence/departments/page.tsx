import React from "react"
import { Building2 } from "lucide-react"

export default function DepartmentIntelligence() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Building2 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Department Intelligence</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-2">Faculty Performance</h2>
          <p className="text-sm text-slate-500">Teaching loads, outcomes, and research metrics.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-2">Placement Outcomes</h2>
          <p className="text-sm text-slate-500">Department-wise placement and package distribution.</p>
        </div>
      </div>
    </div>
  )
}
