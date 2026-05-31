/**
 * Shared UI primitives for the admin module.
 * All components are theme-consistent and reusable across all admin pages.
 */

"use client"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, 
  Search, X, AlertCircle, Loader2, ChevronUp, ChevronDown,
  ChevronsUpDown, Check
} from "lucide-react"
import { useState, ReactNode, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  badge?: string
}

export function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#6366F1]/10 text-[#6366F1] rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-[#94A3B8] font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: number
  trendLabel?: string
  color?: string
  index?: number
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, color = "#6366F1", index = 0 }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-lg hover:border-[#C7D2FE] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            }`}
          >
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</div>
      {trendLabel && (
        <div className="text-xs text-[#94A3B8] mt-3 pt-3 border-t border-[#F1F5F9]">{trendLabel}</div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  // Student status
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  detained: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  arrear: "bg-red-50 text-red-700 ring-1 ring-red-200",
  passed_out: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  discontinued: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  transferred_out: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  // Fee status
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  partially_paid: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  due: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  overdue: "bg-red-50 text-red-700 ring-1 ring-red-200",
  waived: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  // Semester status
  upcoming: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  ongoing: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  completed: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  results_published: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  // Roles
  college_admin: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  admin: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  principal: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  hod: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  faculty: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  staff: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  // Generic
  true: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  false: "bg-red-50 text-red-600 ring-1 ring-red-200",
  // Semantic tokens used by Phase 2 pages
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  default: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
}

/**
 * StatusBadge — accepts either:
 *   <StatusBadge value="active" />                   (legacy)
 *   <StatusBadge status="success" label="Paid" />    (Phase 2 semantic)
 */
export function StatusBadge(props: { value?: string | boolean; status?: string; label?: string }) {
  const { value, status, label } = props
  const key = (status ?? String(value ?? "")).toLowerCase().replace(/ /g, "_")
  const style = statusStyles[key] || "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
  const displayLabel = label ?? (value !== undefined ? String(value).replace(/_/g, " ") : key.replace(/_/g, " "))
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize", style)}>
      {displayLabel}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK BADGE
// ─────────────────────────────────────────────────────────────────────────────

export function RiskBadge({ score }: { score: number }) {
  let label: string
  let className: string
  if (score >= 80) {
    label = "Critical"
    className = "bg-red-100 text-red-700 ring-1 ring-red-300"
  } else if (score >= 60) {
    label = "High"
    className = "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
  } else if (score >= 40) {
    label = "Medium"
    className = "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
  } else {
    label = "Low"
    className = "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label} · {score}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  search?: string
  onSearch?: (v: string) => void
  placeholder?: string
  searchPlaceholder?: string  // alias for placeholder used by Phase 2
  filters?: ReactNode
  actions?: ReactNode
}

export function FilterBar({ search, onSearch, placeholder, searchPlaceholder, filters, actions }: FilterBarProps) {
  const ph = searchPlaceholder ?? placeholder ?? "Search…"
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
      {onSearch !== undefined && (
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={ph}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] placeholder:text-[#CBD5E1] transition-all"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
      {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
      {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT FILTER
// ─────────────────────────────────────────────────────────────────────────────

interface SelectFilterProps {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function SelectFilter({ value, onChange, options, placeholder = "All", className }: SelectFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] text-[#475569] cursor-pointer transition-all",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  rowKey?: (row: T) => string | number
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === "asc" ? cmp : -cmp
  })

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-[#0F172A] select-none",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="text-[#CBD5E1]">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ChevronsUpDown size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" style={{ width: `${Math.random() * 40 + 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                    <AlertCircle size={32} strokeWidth={1.5} />
                    <span className="text-sm font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <motion.tr
                  key={rowKey ? rowKey(row) : idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  className={cn(
                    "hover:bg-[#F8FAFC] transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-[#334155]", col.className)}>
                      {col.render ? col.render(row) : (
                        <span className="font-medium">{row[col.key] ?? "—"}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-xs text-[#94A3B8]">
        Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                p === page
                  ? "bg-[#6366F1] text-white shadow-sm"
                  : "border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 max-w-sm w-full mx-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-[#6366F1]/10"}`}>
              <AlertCircle size={20} className={danger ? "text-red-500" : "text-[#6366F1]"} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">{title}</h3>
            <p className="text-sm text-[#64748B]">{message}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                  danger
                    ? "bg-red-500 hover:bg-red-600 shadow-red-100 shadow-sm"
                    : "bg-[#6366F1] hover:bg-[#4F46E5] shadow-[#6366F1]/20 shadow-sm"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL SHELL
// ─────────────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  width?: string
}

export function Modal({ open, title, subtitle, onClose, children, width = "max-w-lg" }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cn("bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full overflow-hidden", width)}
          >
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">{title}</h2>
                {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#475569] hover:bg-[#F1F5F9] transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  hint?: string
}

export function FormField({ label, required, error, children, hint }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-[#94A3B8] mt-1">{hint}</p>}
    </div>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] placeholder:text-[#CBD5E1] transition-all bg-white",
        className
      )}
    />
  )
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] bg-white cursor-pointer transition-all text-[#334155]",
        className
      )}
    >
      {children}
    </select>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SPINNER
// ─────────────────────────────────────────────────────────────────────────────

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="text-[#6366F1] animate-spin" />
        <span className="text-sm text-[#94A3B8] font-medium">Loading…</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: ReactNode
}) {
  const Ico = Icon || AlertCircle
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
        <Ico size={24} className="text-[#94A3B8]" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#374151]">{title}</div>
        {description && <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY BUTTON
// ─────────────────────────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  loading?: boolean
  isLoading?: boolean  // alias for loading (Phase 2)
  icon?: React.ElementType
  size?: "sm" | "md"
}

export function Btn({ variant = "primary", loading, isLoading, icon: Icon, children, className, size = "md", ...props }: BtnProps) {
  const busy = loading || isLoading
  const styles = {
    primary: "bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm shadow-[#6366F1]/20",
    secondary: "bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200",
    ghost: "bg-transparent hover:bg-[#F1F5F9] text-[#475569]",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  }
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant], sizes[size], className
      )}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
      {children}
    </button>
  )
}
