'use client'

import React from 'react'
import { useChatStore } from '@/store/chat-store'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, History, Library, Database } from 'lucide-react'

interface ChatLayoutProps {
  children: React.ReactNode
  sidebarPanel: React.ReactNode
}

export function ChatLayout({ children, sidebarPanel }: ChatLayoutProps) {
  const { isContextPanelOpen, toggleContextPanel, isArtifactDrawerOpen, toggleArtifactDrawer } = useChatStore()

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] bg-[var(--bg-default)] overflow-hidden w-full relative">
      
      {/* Left Sidebar Drawer (Artifacts/History) */}
      <AnimatePresence initial={false}>
        {isArtifactDrawerOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="h-full border-r border-[var(--border)] bg-[var(--bg-surface)] flex-shrink-0 z-20"
          >
            <div className="w-[320px] h-full flex flex-col">
              <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]">
                <span className="font-semibold text-sm">Workspace</span>
                <button onClick={toggleArtifactDrawer} className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md text-[var(--text-muted)]">
                  <PanelLeftClose size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {sidebarPanel}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg-default)] relative transition-all duration-300 z-10">
        
        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-30">
          <div className="pointer-events-auto">
            {!isArtifactDrawerOpen && (
              <button 
                onClick={toggleArtifactDrawer}
                className="p-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg shadow-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                title="Open Workspace"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden w-full max-w-4xl mx-auto flex flex-col">
           {children}
        </div>
      </div>



    </div>
  )
}
