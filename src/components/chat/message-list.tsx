import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bot, User, Database, TrendingUp, BarChart3, FileText } from 'lucide-react'
import { useChatStore, Message } from '@/store/chat-store'
import { MarkdownRenderer } from './renderers/markdown-renderer'
import { DataTable } from './renderers/data-table'
import { ChartRenderer } from './renderers/chart-renderer'
import { InsightCard } from './renderers/insight-card'
import { SqlTransparency } from './renderers/sql-transparency'
import { MessageActions } from './message-actions'
import { ExecutionTimeline } from './execution-timeline'

const AGENT_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  query: { label: "Query Agent", icon: Database, className: "badge-indigo" },
  performance: { label: "Performance Agent", icon: TrendingUp, className: "badge-warning" },
  visualization: { label: "Visualization Agent", icon: BarChart3, className: "badge-teal" },
  report: { label: "Report Agent", icon: FileText, className: "badge-success" },
}

export function MessageList() {
  const { messages, isLoading, agentPipeline } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user'
    const agentCfg = msg.agent ? AGENT_CONFIG[msg.agent] : null
    const AgentIcon = agentCfg?.icon

    return (
      <motion.div 
        key={msg.id || `msg-${index}`} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-4 w-full group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
          isUser 
            ? 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)]' 
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Area */}
        <div className={`flex flex-col gap-2 max-w-[85%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          
          {!isUser && agentCfg && (
            <div className={`badge ${agentCfg.className}`}>
              {AgentIcon && <AgentIcon size={12} />}
              {agentCfg.label}
            </div>
          )}

          {!isUser && msg.isStreaming && (
            <ExecutionTimeline steps={[
              { id: '1', label: 'Processing Request', status: 'completed' },
              { id: '2', label: 'Running Agents', status: 'running' }
            ]} />
          )}

          <div className={`${
            isUser 
              ? 'bg-indigo-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[15px]' 
              : 'bg-transparent text-[var(--text-primary)] w-full'
          }`}>
            {isUser ? (
              msg.content
            ) : (
              <MarkdownRenderer content={msg.content} isStreaming={msg.isStreaming} />
            )}
          </div>

          {!isUser && msg.insights && msg.insights.length > 0 && <InsightCard insights={msg.insights} />}
          {!isUser && msg.tableData && <DataTable data={msg.tableData} />}
          {!isUser && msg.chartSpec && <ChartRenderer spec={msg.chartSpec} />}
          
          {/* Example SQL - normally passed from backend, stubbing for UI */}
          {!isUser && msg.sql && !msg.isStreaming && (
            <SqlTransparency 
              sql={msg.sql}
              rowsReturned={msg.tableData?.row_count}
            />
          )}

          {!isUser && !msg.isStreaming && (
            <MessageActions 
              content={msg.content}
              hasTable={!!msg.tableData}
              hasChart={!!msg.chartSpec}
              tableData={msg.tableData}
            />
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-8 custom-scrollbar">
      {messages.map(renderMessage)}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}
