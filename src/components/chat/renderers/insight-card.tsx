import React from 'react'
import { Lightbulb } from 'lucide-react'

interface InsightCardProps {
  insights: string[]
}

export function InsightCard({ insights }: InsightCardProps) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="mt-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={18} className="text-indigo-500" />
        <h3 className="font-semibold text-[var(--text-primary)] text-sm tracking-tight">Key Findings</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, index) => (
          <li key={index} className="flex gap-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
