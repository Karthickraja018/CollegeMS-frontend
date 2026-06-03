import React from "react"
import { Sparkles } from "lucide-react"

export function InsightsPanel({ insights, loading }: { insights: string[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-200 w-1/4 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (!insights || insights.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6 flex items-start gap-4">
      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 flex-shrink-0">
        <Sparkles size={20} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-2">AI Insights</h3>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
          {insights.map((insight, idx) => (
            <li key={idx}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
