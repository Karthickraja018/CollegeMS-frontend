import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "N/A"
  return `${value.toFixed(decimals)}%`
}

export function getRiskColor(score: number | null | undefined): string {
  if (!score) return "text-slate-400"
  if (score >= 81) return "text-red-400"
  if (score >= 61) return "text-orange-400"
  if (score >= 31) return "text-yellow-400"
  return "text-emerald-400"
}

export function getRiskLabel(score: number | null | undefined): string {
  if (!score) return "Not Analyzed"
  if (score >= 81) return "Critical"
  if (score >= 61) return "High"
  if (score >= 31) return "Medium"
  return "Low"
}

export function getRiskBgColor(score: number | null | undefined): string {
  if (!score) return "bg-slate-800 text-slate-400"
  if (score >= 81) return "bg-red-900/40 text-red-400 border-red-800"
  if (score >= 61) return "bg-orange-900/40 text-orange-400 border-orange-800"
  if (score >= 31) return "bg-yellow-900/40 text-yellow-400 border-yellow-800"
  return "bg-emerald-900/40 text-emerald-400 border-emerald-800"
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
