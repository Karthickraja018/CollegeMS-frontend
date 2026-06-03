import React from 'react'
import { Copy, RefreshCw, Download, Pin, Bookmark, Code2 } from 'lucide-react'
import { useExportExcel } from '@/queries/chat-queries'

interface MessageActionsProps {
  content: string
  hasTable?: boolean
  hasChart?: boolean
  onViewSql?: () => void
  tableData?: any
}

export function MessageActions({ content, hasTable, hasChart, onViewSql, tableData }: MessageActionsProps) {
  const exportExcel = useExportExcel()

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  const handleExportCSV = () => {
    if (!tableData || !tableData.rows || tableData.rows.length === 0) return
    const keys = Object.keys(tableData.rows[0])
    const csvContent = [
      keys.join(','),
      ...tableData.rows.map((row: any) => keys.map(k => JSON.stringify(row[k] ?? "")).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'export.csv'
    link.click()
  }

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={handleCopy} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors" title="Copy Text">
        <Copy size={14} />
      </button>
      
      {hasTable && (
        <>
          <button onClick={handleExportCSV} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors" title="Export CSV">
            <Download size={14} />
          </button>
        </>
      )}
      
      {onViewSql && (
        <button onClick={onViewSql} className="p-1.5 text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-md transition-colors" title="View SQL">
          <Code2 size={14} />
        </button>
      )}
      
      <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors" title="Bookmark">
        <Bookmark size={14} />
      </button>
    </div>
  )
}
