"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, Database, TrendingUp, BarChart3, FileText, Bot, StopCircle, User } from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const SUGGESTED_PROMPTS = [
  "Show students with attendance below 75%",
  "Compare CSE and ECE department performance",
  "Show attendance trend for the last 6 months",
  "Generate a semester performance report for CSE",
]

const AGENT_CONFIG: Record<string, { label: string; color: string; icon: any; className: string }> = {
  query: { label: "Query Agent", color: "#6366F1", icon: Database, className: "badge-indigo" },
  performance: { label: "Performance Agent", color: "#F59E0B", icon: TrendingUp, className: "badge-warning" },
  visualization: { label: "Visualization Agent", color: "#14B8A6", icon: BarChart3, className: "badge-teal" },
  report: { label: "Report Agent", color: "#10B981", icon: FileText, className: "badge-success" },
}

const CHART_COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"]

function ChartRenderer({ spec }: { spec: any }) {
  if (!spec) return null
  const { chartType, data, xAxis, yAxis, series, title } = spec

  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: -20, bottom: 0 },
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "var(--bg-elevated)", opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            {(series || []).map((s: any, i: number) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || CHART_COLORS[i]} radius={[4, 4, 0, 0]} animationDuration={800} maxBarSize={40} />
            ))}
          </BarChart>
        )
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            {(series || []).map((s: any, i: number) => (
              <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || CHART_COLORS[i]} strokeWidth={2} dot={{ r: 4, fill: "var(--bg-surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              {(series || []).map((s: any, i: number) => (
                <linearGradient key={s.dataKey} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color || CHART_COLORS[i]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color || CHART_COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            {(series || []).map((s: any, i: number) => (
              <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || CHART_COLORS[i]} fill={`url(#grad_${i})`} strokeWidth={2} />
            ))}
          </AreaChart>
        )
      case "pie":
        const pieKey = series?.[0]?.dataKey || "value"
        return (
          <PieChart>
            <Pie data={data} dataKey={pieKey} nameKey={xAxis?.dataKey} cx="50%" cy="50%" outerRadius={80} animationDuration={800}>
              {data?.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ marginTop: 16, background: "var(--bg-card)", borderRadius: 12, padding: "20px 24px", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{title}</div>}
      <ResponsiveContainer width="100%" height={260}>
        {renderChart() as any}
      </ResponsiveContainer>
    </div>
  )
}

function DataTable({ data }: { data: any[] }) {
  if (!data) return null
  if (data.length === 0) {
    return (
      <div style={{ marginTop: 16, padding: "24px", borderRadius: 12, border: "1px dashed var(--border)", textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-surface)" }}>
        No records found matching your query.
      </div>
    )
  }
  const columns = Object.keys(data[0])
  const displayCols = columns.slice(0, 6)

  return (
    <div style={{ marginTop: 16, overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
      <table className="data-table">
        <thead>
          <tr>
            {displayCols.map(col => (
              <th key={col}>{col.replace(/_/g, " ").toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, i) => (
            <tr key={i}>
              {displayCols.map(col => (
                <td key={col}>{String(row[col] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          Showing 10 of {data.length} records. For a full list, generate a report.
        </div>
      )}
    </div>
  )
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  tableData?: any[]
  chartSpec?: any
  reportUrl?: string
  isStreaming?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query }
    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", isStreaming: true }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput("")
    setIsLoading(true)

    const token = localStorage.getItem("access_token")
    let aborted = false

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, conversation_history: [] }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      abortRef.current = () => {
        aborted = true
        reader.cancel()
      }

      let buffer = ""
      while (!aborted) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const event = JSON.parse(line.slice(6))
            setMessages(prev => prev.map(m => {
              if (m.id !== assistantId) return m
              switch (event.type) {
                case "agent":
                  return { ...m, agent: event.agent }
                case "token":
                  return { ...m, content: m.content + event.content }
                case "table":
                  return { ...m, tableData: event.data }
                case "chart":
                  return { ...m, chartSpec: event.spec }
                case "report":
                  return { ...m, reportUrl: event.url }
                case "done":
                  return { ...m, isStreaming: false }
                case "error":
                  return { ...m, content: m.content || `Error: ${event.message}`, isStreaming: false }
                default:
                  return m
              }
            }))
          } catch {}
        }
      }
    } catch (e: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `Sorry, I encountered an error: ${e.message}`, isStreaming: false }
          : m
      ))
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--header-height) - 64px)", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>AI Assistant</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Ask anything about your institutional data</p>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 32 }}>
        
        {messages.length === 0 && (
          <div style={{ margin: "auto", width: "100%", maxWidth: 500, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--indigo-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
              <Sparkles size={32} color="var(--indigo)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>How can I help you today?</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
              I can analyze attendance patterns, compare department performance, or generate complete PDF reports on demand.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <motion.button 
                  key={p} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => sendMessage(p)} 
                  className="card hover:border-[var(--indigo)] transition-colors cursor-pointer text-left"
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface)" }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{p}</span>
                  <Send size={14} color="var(--text-muted)" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const agentCfg = msg.agent ? AGENT_CONFIG[msg.agent] : null
          const AgentIcon = agentCfg?.icon

          return (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: 16, maxWidth: "100%", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
            >
              {/* Avatar */}
              <div style={{ 
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: msg.role === "user" ? "var(--bg-elevated)" : "var(--indigo-glow)",
                border: "1px solid var(--border)",
                color: msg.role === "user" ? "var(--text-secondary)" : "var(--indigo)"
              }}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Content */}
              <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                
                {agentCfg && (
                  <div className={`badge ${agentCfg.className}`} style={{ alignSelf: "flex-start" }}>
                    {AgentIcon && <AgentIcon size={12} />}
                    {agentCfg.label}
                  </div>
                )}

                <div style={{ 
                  background: msg.role === "user" ? "var(--indigo)" : "transparent",
                  color: msg.role === "user" ? "white" : "var(--text-primary)",
                  padding: msg.role === "user" ? "12px 16px" : "0",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "0",
                  fontSize: 15, lineHeight: 1.6
                }}>
                  {msg.content || (msg.isStreaming ? (
                    <span style={{ display: "inline-block", width: 8, height: 16, background: "var(--indigo)", animation: "pulse 1s infinite" }} />
                  ) : "")}
                </div>

                {msg.tableData && <DataTable data={msg.tableData} />}
                {msg.chartSpec && <ChartRenderer spec={msg.chartSpec} />}
                
                {msg.reportUrl && (
                  <motion.a 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    href={`${API_URL}${msg.reportUrl}`} target="_blank" rel="noopener noreferrer"
                    className="btn btn-secondary" style={{ marginTop: 8, display: "inline-flex", fontSize: 13, alignSelf: "flex-start", background: "var(--bg-surface)" }}
                  >
                    <FileText size={16} color="var(--indigo)" /> Download PDF Report
                  </motion.a>
                )}
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} style={{ height: 1 }} />
      </div>

      {/* Input Area */}
      <div style={{ marginTop: 24, position: "relative" }}>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          transition: "border-color 0.2s"
        }}
        className="focus-within:border-[var(--indigo)]"
        >
          <textarea
            ref={textareaRef}
            placeholder="Ask AI to query data, compare metrics, or generate reports..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ 
              flex: 1, background: "transparent", border: "none", outline: "none", 
              color: "var(--text-primary)", fontSize: 15, resize: "none", maxHeight: 160,
              paddingTop: 8, paddingBottom: 8, lineHeight: 1.5, fontFamily: "inherit"
            }}
          />
          <div style={{ display: "flex", alignItems: "center", paddingBottom: 4 }}>
            {isLoading ? (
              <button onClick={() => abortRef.current?.()} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--danger)", padding: 8, borderRadius: 8 }} className="hover:bg-[var(--bg-elevated)] transition-colors">
                <StopCircle size={20} />
              </button>
            ) : (
              <button 
                onClick={() => sendMessage(input)} 
                disabled={!input.trim()} 
                style={{
                  background: input.trim() ? "var(--indigo)" : "var(--bg-elevated)",
                  border: "none", borderRadius: 10, padding: 10,
                  cursor: input.trim() ? "pointer" : "default",
                  color: input.trim() ? "white" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}
                className={input.trim() ? "hover:bg-[var(--indigo-dim)]" : ""}
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center", fontWeight: 500 }}>
          CollegeMS AI can make mistakes. Verify critical reports before acting.
        </p>
      </div>

    </div>
  )
}
