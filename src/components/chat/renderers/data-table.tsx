import React, { useRef, useState } from 'react'
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

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  
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
        <div 
          style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
        >
          <table className="w-full text-left border-collapse" style={{ minWidth: data.columns.length * 120 }}>
            <thead className="sticky top-0 bg-[var(--bg-elevated)] z-10 shadow-sm text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
              <tr>
                {data.columns.map(col => (
                  <th 
                    key={col} 
                    className="px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--bg-surface)] transition-colors whitespace-nowrap"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.replace(/_/g, ' ')}
                      {sortConfig?.key === col && (
                        sortConfig.direction === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = processedRows[virtualRow.index]
                return (
                  <tr 
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]/50 transition-colors group"
                  >
                    {data.columns.map(col => (
                      <td key={col} className="px-4 py-2.5 text-sm text-[var(--text-primary)] truncate max-w-[200px]" title={String(row[col] ?? '')}>
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
