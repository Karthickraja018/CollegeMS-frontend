import React, { useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface DataTableProps {
  data: {
    columns: string[]
    rows: any[]
    row_count: number
    source?: string
  }
}

const formatValue = (val: any) => {
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val : Number(val.toFixed(2))
  }
  if (typeof val === 'string') {
    // try to parse if it's a long decimal
    if (/^-?\d+\.\d{3,}$/.test(val)) {
      return Number(parseFloat(val).toFixed(2))
    }
  }
  return String(val ?? '')
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  
  // Calculate column widths based on max content length
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {}
    if (!data || !data.columns) return widths
    data.columns.forEach(col => {
      let maxLen = col.length
      data.rows.forEach(row => {
        const valStr = String(formatValue(row[col]))
        if (valStr.length > maxLen) {
          maxLen = valStr.length
        }
      })
      // Approximate pixel width: ~8px per char + 32px padding, min 120, max 400
      widths[col] = Math.max(120, Math.min(400, maxLen * 8 + 32))
    })
    return widths
  }, [data])

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-xl border border-dashed border-[var(--border)] text-center text-[var(--text-muted)] text-sm bg-[var(--bg-surface)]">
        No records found.
      </div>
    )
  }

  // Filter and Sort
  let processedRows = [...data.rows]
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    processedRows = processedRows.filter(row => 
      data.columns.some(col => String(row[col] ?? '').toLowerCase().includes(term))
    )
  }

  if (sortConfig) {
    processedRows.sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal === bVal) return 0
      const isAsc = sortConfig.direction === 'asc'
      if (aVal == null) return isAsc ? -1 : 1
      if (bVal == null) return isAsc ? 1 : -1
      return aVal > bVal ? (isAsc ? 1 : -1) : (isAsc ? -1 : 1)
    })
  }

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: processedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  })

  const handleSort = (col: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === col && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: col, direction })
  }

  const totalTableWidth = data.columns.reduce((acc, col) => acc + (columnWidths[col] || 120), 0)

  return (
    <div className="mt-4 flex flex-col border border-[var(--border)] rounded-xl bg-[var(--bg-card)] shadow-sm overflow-hidden w-full max-w-full">
      
      {/* Toolbar */}
      <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between gap-4">
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[var(--bg-default)] border border-[var(--border)] rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
          {data.source && <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md">Source: {data.source}</span>}
          <span>{processedRows.length} of {data.row_count} rows</span>
        </div>
      </div>

      {/* Table Area */}
      <div 
        ref={parentRef} 
        className="w-full max-h-[400px] overflow-auto custom-scrollbar"
      >
        <div className="w-full text-left bg-[var(--bg-card)] block" style={{ minWidth: totalTableWidth }}>
          <div className="sticky top-0 bg-[var(--bg-elevated)] z-10 shadow-sm text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium flex border-b border-[var(--border)]">
            {data.columns.map(col => (
              <div 
                key={col} 
                style={{ width: columnWidths[col] }}
                className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-surface)] transition-colors flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap"
                onClick={() => handleSort(col)}
              >
                {col.replace(/_/g, ' ')}
                {sortConfig?.key === col && (
                  sortConfig.direction === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />
                )}
              </div>
            ))}
          </div>
          <div 
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = processedRows[virtualRow.index]
              return (
                <div 
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex border-b border-[var(--border)] hover:bg-[var(--bg-surface)]/50 transition-colors group"
                >
                  {data.columns.map(col => (
                    <div 
                      key={col} 
                      style={{ width: columnWidths[col] }}
                      className="px-4 py-2.5 text-sm text-[var(--text-primary)] truncate flex-shrink-0" 
                      title={String(row[col] ?? '')}
                    >
                      {formatValue(row[col])}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
