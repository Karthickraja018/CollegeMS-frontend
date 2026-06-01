import React from "react"
import { GraduationCap } from "lucide-react"

export default function StudentIntelligence() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <GraduationCap className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Student Intelligence</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 col-span-2">
          <h2 className="text-lg font-semibold mb-2">Cohort Tracking</h2>
          <p className="text-sm text-slate-500">Analyze performance across batches and programs.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-2">At-Risk Students</h2>
          <p className="text-sm text-slate-500">AI-detected early warning signals.</p>
        </div>
      </div>
    </div>
  )
}
