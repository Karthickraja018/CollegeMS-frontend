'use client'

import React, { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, StopCircle } from 'lucide-react'
import { useChatStore, Message } from '@/store/chat-store'
import { ChatLayout } from '@/components/chat/chat-layout'
import { EmptyState } from '@/components/chat/empty-state'
import { MessageList } from '@/components/chat/message-list'
import { ContextPanel } from '@/components/chat/context-panel'
import { useChatHistory } from '@/queries/chat-queries'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// A simple Artifacts Drawer content
function ArtifactsSidebar() {
  const { data: history, isLoading } = useChatHistory()

  return (
    <div className="p-4 flex flex-col gap-6">
      <div>
        <h4 className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Recent Analyses</h4>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="text-sm text-[var(--text-muted)] italic px-2">Loading history...</div>
          ) : history && history.length > 0 ? (
            history.map((item: any) => (
              <div key={item.id} className="text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] p-2 rounded-md cursor-pointer transition-colors line-clamp-2" title={item.result_summary}>
                {item.title}
              </div>
            ))
          ) : (
            <div className="text-sm text-[var(--text-muted)] italic px-2">No recent analyses found</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { 
    messages, addMessage, updateMessage, 
    input, setInput, 
    isLoading, setIsLoading,
    setActiveAgent, setAgentPipeline
  } = useChatStore()
  
  const router = useRouter()
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<(() => void) | null>(null)

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query }
    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", isStreaming: true }

    addMessage(userMsg)
    addMessage(assistantMsg)
    setInput("")
    setIsLoading(true)
    setActiveAgent('query')

    const token = localStorage.getItem("access_token")
    if (!token) {
      setIsLoading(false)
      setActiveAgent(null)
      router.replace('/login')
      return
    }

    let aborted = false

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, conversation_history: messages.slice(-10) }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("user")
          setIsLoading(false)
          setActiveAgent(null)
          router.replace('/login')
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

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
            
            if (event.type === 'agent') {
              setActiveAgent(event.agent)
              setAgentPipeline(event.pipeline || [event.agent])
              updateMessage(assistantId, { agent: event.agent })
            } else if (event.type === 'token') {
              // We need to use functional update to get latest content
              useChatStore.setState(state => {
                const msg = state.messages.find(m => m.id === assistantId)
                if (!msg) return state
                return {
                  messages: state.messages.map(m => m.id === assistantId ? { ...m, content: m.content + event.content } : m)
                }
              })
            } else if (event.type === 'analysis') {
              updateMessage(assistantId, {
                content: event.summary,
                insights: event.insights,
                tableData: event.table,
                chartSpec: event.chart,
                actions: event.actions,
                reportUrl: event.report_url,
                analytics: event.analytics,
                risk_analysis: event.risk_analysis,
              })
            } else if (event.type === 'done') {
              updateMessage(assistantId, { isStreaming: false })
            } else if (event.type === 'error') {
              updateMessage(assistantId, { content: `Error: ${event.message}`, isStreaming: false })
            }
          } catch (e) {
            console.error("Parse error", e)
          }
        }
      }
    } catch (e: any) {
      updateMessage(assistantId, { content: `Sorry, I encountered an error: ${e.message}`, isStreaming: false })
    } finally {
      setIsLoading(false)
      setActiveAgent(null)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <ChatLayout 
      contextPanel={<ContextPanel />}
      sidebarPanel={<ArtifactsSidebar />}
    >
      <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
        {messages.length === 0 ? (
          <EmptyState onSendMessage={sendMessage} />
        ) : (
          <MessageList />
        )}

        {/* Input Area */}
        <div className="px-4 pb-6 pt-2 shrink-0">
          <div className="relative max-w-4xl mx-auto">
            <div className={`
              bg-[var(--bg-surface)] border rounded-2xl p-3 flex items-end gap-3 shadow-sm transition-all duration-200
              ${input.trim() ? 'border-indigo-500/50 shadow-indigo-500/10' : 'border-[var(--border)]'}
              focus-within:border-indigo-500 focus-within:shadow-indigo-500/10
            `}>
              <textarea
                ref={textareaRef}
                placeholder="Message your AI Analyst..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-[15px] resize-none max-h-40 py-2 px-2 custom-scrollbar placeholder:text-[var(--text-muted)]"
              />
              <div className="flex items-center pb-1">
                {isLoading ? (
                  <button 
                    onClick={() => abortRef.current?.()} 
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <StopCircle size={22} />
                  </button>
                ) : (
                  <button 
                    onClick={() => sendMessage(input)} 
                    disabled={!input.trim()} 
                    className={`
                      p-2 rounded-xl transition-all duration-200 flex items-center justify-center
                      ${input.trim() 
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20' 
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed'}
                    `}
                  >
                    <Send size={18} className={input.trim() ? 'translate-x-0.5' : ''} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-center text-xs text-[var(--text-muted)] mt-3">
              CollegeMS AI can make mistakes. Consider verifying critical data.
            </p>
          </div>
        </div>
      </div>
    </ChatLayout>
  )
}
