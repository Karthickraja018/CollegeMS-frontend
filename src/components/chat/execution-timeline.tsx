import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface TimelineStep {
  id: string
  label: string
  status: StepStatus
}

interface ExecutionTimelineProps {
  steps: TimelineStep[]
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case 'completed': return <CheckCircle2 size={14} className="text-emerald-500" />
    case 'running': return <Loader2 size={14} className="text-indigo-500 animate-spin" />
    case 'failed': return <XCircle size={14} className="text-red-500" />
    default: return <Circle size={14} className="text-[var(--border)]" />
  }
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  if (!steps || steps.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 w-fit min-w-[250px] shadow-sm">
      <div className="text-xs font-medium text-[var(--text-muted)] mb-1 uppercase tracking-wider">Agent Execution</div>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-3 relative">
          {index < steps.length - 1 && (
            <div className="absolute left-[6px] top-[14px] w-[2px] h-full bg-[var(--border)] -z-10" />
          )}
          <div className="bg-[var(--bg-surface)] py-0.5 z-10">
            {getStatusIcon(step.status)}
          </div>
          <span className={`text-sm ${step.status === 'running' ? 'text-[var(--text-primary)] font-medium' : step.status === 'completed' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
            {step.label}
          </span>
          {step.status === 'running' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto"
              transition={{ repeat: Infinity, duration: 0.8, direction: 'alternate' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
