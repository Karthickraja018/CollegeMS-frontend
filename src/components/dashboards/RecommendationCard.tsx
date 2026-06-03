"use client"

import { motion } from "framer-motion"
import { Calendar, BookOpen, AlertTriangle, Eye } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  type: "attendance" | "academic" | "intervention" | "monitoring"
  priority: "critical" | "high" | "medium" | "low"
  severity?: string
  problem: string
  recommendation: string
  expected_impact: string
  owner: string
}

interface RecommendationCardProps {
  rec: Recommendation
  index?: number
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<Recommendation["type"], React.ElementType> = {
  attendance: Calendar,
  academic: BookOpen,
  intervention: AlertTriangle,
  monitoring: Eye,
}

const SEVERITY_BORDER: Record<string, string> = {
  critical: "border-l-4 border-l-[#3730A3]",
  high: "border-l-4 border-l-[#4F46E5]",
  medium: "border-l-4 border-l-[#4F46E5]",
  low: "border-l border-l-[#E2E8F0]",
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecommendationCard({ rec, index = 0 }: RecommendationCardProps) {
  const Icon = TYPE_ICON[rec.type] ?? AlertTriangle
  const severityKey = (rec.severity ?? rec.priority).toLowerCase()
  const borderClass = SEVERITY_BORDER[severityKey] ?? SEVERITY_BORDER.low

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      className={`bg-white border border-[#E2E8F0] ${borderClass} rounded-2xl p-4 transition-all duration-200 cursor-default group`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2FF]">
            <Icon size={15} className="text-[#4F46E5]" />
          </div>
          {/* Problem */}
          <p className="text-sm font-bold text-[#0F172A] leading-snug">{rec.problem}</p>
        </div>

        {/* Severity badge */}
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
          {severityKey}
        </span>
      </div>

      {/* Recommendation text */}
      <p className="text-xs text-[#475569] leading-relaxed mb-3 pl-[2.625rem]">
        {rec.recommendation}
      </p>

      {/* Impact + Owner */}
      <div className="flex items-center justify-between pl-[2.625rem] gap-2">
        <p className="text-xs italic text-[#4F46E5] font-medium flex-1 min-w-0 truncate">
          ↗ {rec.expected_impact}
        </p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] flex-shrink-0">
          {rec.owner}
        </span>
      </div>
    </motion.div>
  )
}
