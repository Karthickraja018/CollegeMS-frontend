import React from "react"
import { FileText } from "lucide-react"

export default function AccreditationReports() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <FileText className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Accreditation & Reports</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <h2 className="text-lg font-semibold mb-2 text-primary">NAAC Report Generator</h2>
          <p className="text-sm text-slate-500">Generate structured data points for NAAC AQAR.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <h2 className="text-lg font-semibold mb-2 text-primary">NBA Report Generator</h2>
          <p className="text-sm text-slate-500">Compile outcome-based education (OBE) metrics.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <h2 className="text-lg font-semibold mb-2 text-primary">Custom AI Reports</h2>
          <p className="text-sm text-slate-500">Query the AI to generate ad-hoc statistical reports.</p>
        </div>
      </div>
    </div>
  )
}
