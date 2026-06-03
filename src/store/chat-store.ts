import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  tableData?: {
    columns: string[]
    rows: any[]
    row_count: number
    source?: string
  }
  chartSpec?: any
  reportUrl?: string
  isStreaming?: boolean
  insights?: string[]
  actions?: string[]
  analytics?: any
  risk_analysis?: any
}

interface ChatState {
  // Input State
  input: string
  setInput: (input: string) => void
  
  // UI State
  isContextPanelOpen: boolean
  setContextPanelOpen: (isOpen: boolean) => void
  toggleContextPanel: () => void
  
  isArtifactDrawerOpen: boolean
  setArtifactDrawerOpen: (isOpen: boolean) => void
  toggleArtifactDrawer: () => void
  
  // Conversation State
  sessionKey: string | null
  setSessionKey: (key: string | null) => void
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  clearMessages: () => void
  
  // Agent Execution Status
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  activeAgent: string | null
  setActiveAgent: (agent: string | null) => void
  agentPipeline: string[]
  setAgentPipeline: (pipeline: string[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  input: '',
  setInput: (input) => set({ input }),
  
  isContextPanelOpen: false,
  setContextPanelOpen: (isOpen) => set({ isContextPanelOpen: isOpen }),
  toggleContextPanel: () => set((state) => ({ isContextPanelOpen: !state.isContextPanelOpen })),
  
  isArtifactDrawerOpen: false,
  setArtifactDrawerOpen: (isOpen) => set({ isArtifactDrawerOpen: isOpen }),
  toggleArtifactDrawer: () => set((state) => ({ isArtifactDrawerOpen: !state.isArtifactDrawerOpen })),
  
  sessionKey: null,
  setSessionKey: (sessionKey) => set({ sessionKey }),
  messages: [],
  setMessages: (messages) => set((state) => ({
    messages: typeof messages === 'function' ? messages(state.messages) : messages
  })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map((m) => m.id === id ? { ...m, ...updates } : m)
  })),
  clearMessages: () => set({ messages: [], sessionKey: null }),
  
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  activeAgent: null,
  setActiveAgent: (activeAgent) => set({ activeAgent }),
  agentPipeline: [],
  setAgentPipeline: (agentPipeline) => set({ agentPipeline }),
}))
