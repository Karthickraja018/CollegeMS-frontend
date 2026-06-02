import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, ChevronDown, ChevronRight, Database, Clock } from 'lucide-react'

interface SqlTransparencyProps {
  sql: string
  executionTime?: number
  rowsReturned?: number
}

export function SqlTransparency({ sql, executionTime, rowsReturned }: SqlTransparencyProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!sql) return null

  return (
    <div className="mt-4 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-surface)] w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">SQL Transparency</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            {executionTime && (
              <span className="flex items-center gap-1"><Clock size={12} /> {executionTime}ms</span>
            )}
            {rowsReturned !== undefined && (
              <span className="flex items-center gap-1"><Database size={12} /> {rowsReturned} rows</span>
            )}
          </div>
          {isOpen ? <ChevronDown size={16} className="text-[var(--text-muted)]" /> : <ChevronRight size={16} className="text-[var(--text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-[var(--border)]"
          >
            <div className="p-4 bg-[#0d1117]">
              <pre className="text-sm font-mono text-[#c9d1d9] whitespace-pre-wrap break-words leading-relaxed">
                {sql}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
