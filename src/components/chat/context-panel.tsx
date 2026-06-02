import React from 'react'
import { useChatStore } from '@/store/chat-store'
import { Database, TrendingUp, BarChart3, FileText, Layers, Hash } from 'lucide-react'

const AGENT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  query: { label: "Query Agent", icon: Database, color: "text-indigo-500" },
  performance: { label: "Performance Agent", icon: TrendingUp, color: "text-amber-500" },
  visualization: { label: "Visualization Agent", icon: BarChart3, color: "text-teal-500" },
  report: { label: "Report Agent", icon: FileText, color: "text-emerald-500" },
}

export function ContextPanel() {
  const { activeAgent, agentPipeline } = useChatStore()

  const currentAgent = activeAgent ? AGENT_CONFIG[activeAgent] : null
  const CurrentIcon = currentAgent?.icon

  return (
    <div className="flex flex-col gap-6 p-5">
      
      {/* Active Agent Status */}
      <div>
        <h4 className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Current Brain</h4>
        <div className="bg-[var(--bg-default)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3">
          {CurrentIcon ? (
            <div className={`p-2 rounded-lg bg-[var(--bg-elevated)] ${currentAgent.color}`}>
              <CurrentIcon size={20} />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              <Layers size={20} />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {currentAgent ? currentAgent.label : 'Idle'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {currentAgent ? 'Actively processing' : 'Waiting for input'}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Pipeline */}
      {agentPipeline.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Execution Pipeline</h4>
          <div className="flex flex-wrap gap-2">
            {agentPipeline.map((agent, i) => {
              const cfg = AGENT_CONFIG[agent]
              if (!cfg) return null
              const Icon = cfg.icon
              return (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-xs font-medium">
                  <Icon size={12} className={cfg.color} />
                  <span>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Extracted Entities */}
      <div>
        <h4 className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Semantic Entities</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5"><Hash size={14} className="text-[var(--text-muted)]"/> Departments</span>
            <span className="text-[var(--text-primary)] font-medium">All</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5"><Hash size={14} className="text-[var(--text-muted)]"/> Metrics</span>
            <span className="text-[var(--text-primary)] font-medium">Attendance, Performance</span>
          </div>
        </div>
      </div>

    </div>
  )
}
