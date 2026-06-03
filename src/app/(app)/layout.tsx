"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Providers from "@/components/Providers"
import Sidebar from "@/components/layout/Sidebar"
import { useUserStore } from "@/store"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setUser = useUserStore((s) => s.setUser)
  const setToken = useUserStore((s) => s.setToken)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      router.replace("/login")
      return
    }

    // Hydrate user from localStorage into Zustand store
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr)
        setUser(parsed)
        setToken(token)
      } catch {
        // Malformed user JSON — redirect to login
        localStorage.removeItem("user")
        localStorage.removeItem("access_token")
        router.replace("/login")
        return
      }
    }

    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-pulse">
            C
          </div>
          <div className="text-sm text-[#94A3B8] font-medium">Loading platform...</div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Providers>
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
