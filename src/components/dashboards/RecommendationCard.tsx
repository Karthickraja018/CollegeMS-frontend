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

const TYPE_COLOR: Record<Recommendation["type"], string> = {
  attendance: "#6366F1",
  academic: "#8B5CF6",
  intervention: "#EF4444",
  monitoring: "#14B8A6",
}

const SEVERITY_BADGE: Record<string, { bg: string; text: string; ring: string }> = {
  critical: { bg: "#FEF2F2", text: "#DC2626", ring: "#FECACA" },
  high: { bg: "#FFFBEB", text: "#D97706", ring: "#FDE68A" },
  medium: { bg: "#EFF6FF", text: "#2563EB", ring: "#BFDBFE" },
  low: { bg: "#F8FAFC", text: "#64748B", ring: "#E2E8F0" },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecommendationCard({ rec, index = 0 }: RecommendationCardProps) {
  const Icon = TYPE_ICON[rec.type] ?? AlertTriangle
  const iconColor = TYPE_COLOR[rec.type] ?? "#6366F1"
  const severityKey = (rec.severity ?? rec.priority).toLowerCase()
  const badge = SEVERITY_BADGE[severityKey] ?? SEVERITY_BADGE.low

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.09)" }}
      className="bg-white border border-[#E2E8F0] rounded-2xl p-4 transition-all duration-200 cursor-default group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${iconColor}15` }}
          >
            <Icon size={15} style={{ color: iconColor }} />
          </div>
          {/* Problem */}
          <p className="text-sm font-bold text-[#0F172A] leading-snug">{rec.problem}</p>
        </div>

        {/* Severity badge */}
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.ring}` }}
        >
          {severityKey}
        </span>
      </div>

      {/* Recommendation text */}
      <p className="text-xs text-[#475569] leading-relaxed mb-3 pl-[2.625rem]">
        {rec.recommendation}
      </p>

      {/* Impact + Owner */}
      <div className="flex items-center justify-between pl-[2.625rem] gap-2">
        <p className="text-xs italic text-[#14B8A6] font-medium flex-1 min-w-0 truncate">
          ↗ {rec.expected_impact}
        </p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] flex-shrink-0">
          {rec.owner}
        </span>
      </div>
    </motion.div>
  )
}
