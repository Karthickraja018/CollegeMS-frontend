"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LayoutStore {
  sidebarCollapsed: boolean
  theme: "light" | "dark"
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  toggleTheme: () => void
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "light",
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
    }),
    { name: "layout-store" }
  )
)
