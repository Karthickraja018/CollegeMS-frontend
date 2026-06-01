"use client"
import { create } from "zustand"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  type?: "text" | "table" | "chart" | "insights" | "recommendations"
  data?: any
  timestamp: number
}

interface ChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  currentAgent: string | null
  panelOpen: boolean
  addMessage: (msg: ChatMessage) => void
  appendToLast: (content: string) => void
  setStreaming: (v: boolean) => void
  setCurrentAgent: (agent: string | null) => void
  setPanelOpen: (v: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: [],
  isStreaming: false,
  currentAgent: null,
  panelOpen: true,
  addMessage: (msg) => set({ messages: [...get().messages, msg] }),
  appendToLast: (content) => {
    const msgs = [...get().messages]
    if (msgs.length && msgs[msgs.length - 1].role === "assistant") {
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: msgs[msgs.length - 1].content + content }
      set({ messages: msgs })
    }
  },
  setStreaming: (v) => set({ isStreaming: v }),
  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  setPanelOpen: (v) => set({ panelOpen: v }),
  clearMessages: () => set({ messages: [], currentAgent: null }),
}))
