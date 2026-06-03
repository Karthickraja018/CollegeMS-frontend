"use client"

import { motion } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AHSComponent {
  label: string
  value: number
  weight: number
}

interface AHSData {
  score: number
  grade: string
  color: "green" | "blue" | "amber" | "red" | string
  components: AHSComponent[]
}

interface AcademicHealthScoreProps {
  data?: AHSData | null
  loading?: boolean
  compact?: boolean
}

// ─── Color Map ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { ring: string; text: string; bg: string; bar: string; glow: string }> = {
  green: { ring: "#4F46E5", text: "#4F46E5", bg: "#EEF2FF", bar: "#4F46E5", glow: "transparent" },
  blue: { ring: "#4F46E5", text: "#4F46E5", bg: "#EEF2FF", bar: "#4F46E5", glow: "transparent" },
  amber: { ring: "#4F46E5", text: "#4F46E5", bg: "#EEF2FF", bar: "#4F46E5", glow: "transparent" },
  red: { ring: "#3730A3", text: "#3730A3", bg: "#EEF2FF", bar: "#3730A3", glow: "transparent" },
}

const COMPONENT_COLORS = ["#4F46E5", "rgba(79, 70, 229, 0.8)", "rgba(79, 70, 229, 0.6)", "rgba(79, 70, 229, 0.4)", "rgba(79, 70, 229, 0.2)"]

// ─── Circular Ring SVG ────────────────────────────────────────────────────────

function ScoreRing({
  score,
  color,
  size = 160,
}: {
  score: number
  color: string
  size?: number
}) {
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        style={{ filter: `drop-shadow(0 0 2px ${color}40)` }}
      />
    </svg>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AHSSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-2xl ${compact ? "p-4" : "p-6"} shadow-sm`}
    >
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-40 h-40 rounded-full bg-[#F1F5F9]" />
        <div className="h-6 w-24 rounded-lg bg-[#F1F5F9]" />
        <div className="w-full space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 rounded-lg bg-[#F1F5F9]" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Component Bar ────────────────────────────────────────────────────────────

function ComponentBar({
  label,
  value,
  color,
  index,
}: {
  label: string
  value: number
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#64748B] font-medium">{label}</span>
        <span className="font-bold text-[#334155]">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, delay: 0.7 + index * 0.1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AcademicHealthScore({ data, loading, compact }: AcademicHealthScoreProps) {
  if (loading) return <AHSSkeleton compact={compact} />

  if (!data) {
    return (
      <div
        className={`bg-white border border-[#E2E8F0] rounded-2xl ${compact ? "p-4" : "p-6"} shadow-sm flex flex-col items-center justify-center gap-2 text-center py-10`}
      >
        <span className="text-3xl">📊</span>
        <p className="text-sm font-semibold text-[#475569]">No health data available</p>
        <p className="text-xs text-[#94A3B8]">
          Run an AI analysis to generate the Academic Health Score
        </p>
      </div>
    )
  }

  const palette = COLOR_MAP[data.color] ?? COLOR_MAP.blue
  const ringSize = compact ? 120 : 180

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white border border-[#E2E8F0] rounded-2xl ${compact ? "p-4" : "p-6"} shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative`}
    >
      {/* Glow blob removed */}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Academic Health Score
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: palette.bg, color: palette.text }}
        >
          {data.grade}
        </span>
      </div>

      {/* Ring + Score */}
      <div className="flex flex-col items-center mb-5 relative">
        <ScoreRing score={data.score} color={palette.ring} size={ringSize} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-black tracking-tight leading-none"
            style={{ color: palette.text, fontSize: compact ? "1.75rem" : "2.25rem" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {data.score}
          </motion.span>
          <span className="text-xs text-[#94A3B8] font-semibold mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Component Bars */}
      {data.components && data.components.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1">
            Score Breakdown
          </p>
          {data.components.map((comp, i) => (
            <ComponentBar
              key={comp.label}
              label={comp.label}
              value={Math.round(comp.value)}
              color={COMPONENT_COLORS[i % COMPONENT_COLORS.length]}
              index={i}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
