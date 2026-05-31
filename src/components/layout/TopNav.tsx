"use client"
import { Bell, Search, Command } from "lucide-react"

export default function TopNav() {
  return (
    <header className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="flex-1 flex items-center">
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-sm text-[#94A3B8] w-[320px] cursor-text hover:border-[#CBD5E1] transition-colors duration-200">
          <Search size={16} />
          <span>Search anything...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="bg-white border border-[#E2E8F0] rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm"><Command size={10} /></kbd>
            <kbd className="bg-white border border-[#E2E8F0] rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full text-xs font-medium text-[#475569]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          Academic Year 2026
        </div>
        
        <button className="relative p-2 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] rounded-lg transition-colors duration-200">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white"></span>
        </button>
      </div>
    </header>
  )
}
