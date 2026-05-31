"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, Database, TrendingUp, BarChart3, FileText, Zap, StopCircle } from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const SUGGESTED_PROMPTS = [
  "Show students with attendance below 75%",
  "Compare CSE and ECE department performance",
  "Show attendance trend for the last 6 months",
  "Which subjects have the lowest pass rates?",
  "Generate a semester performance report for CSE",
  "Identify students with declining marks",
  "Show top 10 students in semester 5",
]

const AGENT_CONFIG: Record<string, { label: string; color: string; icon: any; className: string }> = {
  query: { label: "Query Agent", color: "#818CF8", icon: Database, className: "agent-query" },
  performance: { label: "Performance Agent", color: "#F87171", icon: TrendingUp, className: "agent-perf" },
  visualization: { label: "Visualization Agent", color: "#2DD4BF", icon: BarChart3, className: "agent-viz" },
  report: { label: "Report Agent", color: "#FCD34D", icon: FileText, className: "agent-report" },
}

const CHART_COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"]

function ChartRenderer({ spec }: { spec: any }) {
  if (!spec) return null
  const { chartType, data, xAxis, yAxis, series, title } = spec

  const commonProps = {
    data,
    margin: { top: 5, right: 10, left: 0, bottom: 5 },
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {(series || []).map((s: any, i: number) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || CHART_COLORS[i]} radius={[4, 4, 0, 0]} animationDuration={800} />
            ))}
          </BarChart>
        )
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
            {(series || []).map((s: any, i: number) => (
              <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || CHART_COLORS[i]} strokeWidth={2} dot={false} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
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
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ marginTop: 12, background: "var(--bg-surface)", borderRadius: 10, padding: "12px 8px 8px", border: "1px solid var(--border)" }}>
      {title && <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, paddingLeft: 8 }}>{title}</div>}
      <ResponsiveContainer width="100%" height={200}>
        {renderChart() as any}
      </ResponsiveContainer>
    </div>
  )
}

function DataTable({ data }: { data: any[] }) {
  if (!data) return null
  if (data.length === 0) {
    return (
      <div style={{ marginTop: 12, padding: "12px", borderRadius: 8, border: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-surface)" }}>
        No records found.
      </div>
    )
  }
  const columns = Object.keys(data[0])
  const displayCols = columns.slice(0, 6) // Limit columns in chat

  return (
    <div style={{ marginTop: 12, overflowX: "auto", borderRadius: 8, border: "1px solid var(--border)" }}>
      <table className="data-table" style={{ fontSize: 12 }}>
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
        <div style={{ padding: "8px 14px", fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
          Showing 10 of {data.length} records
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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="white" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 18 }}>AI Assistant</h1>
            <p className="page-subtitle">Ask anything about your institutional data</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflow: "auto" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(20,184,166,0.2))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Zap size={24} color="var(--indigo)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>What would you like to know?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
              Ask in natural language — the AI will query your database and visualize results
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)} style={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: 20, padding: "7px 14px", fontSize: 13, color: "var(--text-secondary)",
                  cursor: "pointer", transition: "all 0.15s",
                }} onMouseEnter={e => { (e.target as any).style.borderColor = "var(--indigo)"; (e.target as any).style.color = "var(--text-primary)" }}
                  onMouseLeave={e => { (e.target as any).style.borderColor = "var(--border)"; (e.target as any).style.color = "var(--text-secondary)" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          const agentCfg = msg.agent ? AGENT_CONFIG[msg.agent] : null
          const AgentIcon = agentCfg?.icon

          return (
            <div key={msg.id} className={`message-bubble ${msg.role}`}>
              {msg.role === "user" ? (
                <div className="message-content-user">{msg.content}</div>
              ) : (
                <div>
                  {agentCfg && (
                    <div className={`agent-badge ${agentCfg.className}`}>
                      {AgentIcon && <AgentIcon size={10} />}
                      {agentCfg.label}
                    </div>
                  )}
                  <div className={`message-content-assistant ${msg.isStreaming ? "streaming-cursor" : ""}`}>
                    {msg.content || (msg.isStreaming ? "" : "…")}
                  </div>
                  {msg.tableData && <DataTable data={msg.tableData} />}
                  {msg.chartSpec && <ChartRenderer spec={msg.chartSpec} />}
                  {msg.reportUrl && (
                    <a href={`${API_URL}${msg.reportUrl}`} target="_blank" rel="noopener noreferrer"
                      className="btn btn-teal" style={{ marginTop: 12, display: "inline-flex", fontSize: 13 }}>
                      <FileText size={14} /> Download Report
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area" style={{ flexShrink: 0 }}>
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask about students, attendance, performance, reports…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ lineHeight: "1.5", paddingTop: 2 }}
          />
          {isLoading ? (
            <button onClick={() => abortRef.current?.()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}>
              <StopCircle size={20} />
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim()} style={{
              background: input.trim() ? "var(--indigo)" : "var(--bg-hover)",
              border: "none", borderRadius: 8, padding: "7px 10px",
              cursor: input.trim() ? "pointer" : "default",
              color: input.trim() ? "white" : "var(--text-muted)",
              transition: "all 0.15s",
            }}>
              <Send size={16} />
            </button>
          )}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
