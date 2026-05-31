import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Pre-existing helpers used by legacy pages ─────────────────────────────

export function formatDate(dateString: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-IN", opts || { day: "numeric", month: "short", year: "numeric" })
}

export function formatPercentage(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "—"
  return `${Number(value).toFixed(decimals)}%`
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return "Critical"
  if (score >= 60) return "High"
  if (score >= 40) return "Medium"
  return "Low"
}

export function getRiskBgColor(score: number): string {
  if (score >= 80) return "bg-red-100 text-red-700"
  if (score >= 60) return "bg-orange-100 text-orange-700"
  if (score >= 40) return "bg-amber-100 text-amber-700"
  return "bg-emerald-100 text-emerald-700"
}
