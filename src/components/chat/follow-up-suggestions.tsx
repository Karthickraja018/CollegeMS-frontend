import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="mt-6 border-t border-[var(--border)] pt-4">
      <h4 className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Suggested Follow-ups</h4>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(suggestion)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-full hover:border-indigo-500/50 hover:text-indigo-500 transition-colors"
          >
            <span>{suggestion}</span>
            <ArrowRight size={14} className="opacity-50" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
