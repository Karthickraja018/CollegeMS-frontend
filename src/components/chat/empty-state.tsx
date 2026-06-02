import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, BarChart3, Users, Clock, AlertTriangle } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  { text: "Analyze attendance patterns", icon: Clock },
  { text: "Compare department performance", icon: BarChart3 },
  { text: "Find at-risk students", icon: AlertTriangle },
  { text: "Review faculty workload", icon: Users },
]

interface EmptyStateProps {
  onSendMessage: (msg: string) => void
}

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-2xl mx-auto h-full min-h-[500px]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-8 border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
      >
        <Sparkles size={32} className="text-indigo-500" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-semibold text-[var(--text-primary)] mb-4 tracking-tight text-center"
      >
        What would you like to analyze?
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[var(--text-secondary)] text-center mb-12 text-base leading-relaxed"
      >
        I'm your AI Data Analyst. I can query institutional records, visualize trends, build reports, and help you find actionable insights across all departments.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={() => onSendMessage(prompt.text)}
            className="group relative overflow-hidden flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors text-[var(--text-muted)]">
                <prompt.icon size={18} />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{prompt.text}</span>
            </div>
            <Send size={14} className="text-[var(--text-muted)] group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
