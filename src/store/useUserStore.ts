"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "college_admin" | "admin" | "principal" | "hod" | "faculty" | "staff" | "student"

export interface CurrentUser {
  id: number
  email: string
  full_name: string
  role: UserRole
  department_id: number | null
}

interface UserStore {
  user: CurrentUser | null
  token: string | null
  setUser: (user: CurrentUser | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  isAdmin: () => boolean
  isPrincipal: () => boolean
  isHod: () => boolean
  isFaculty: () => boolean
  isInstitutionWide: () => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        set({ user: null, token: null })
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          localStorage.removeItem("user")
        }
      },
      isAdmin: () => ["admin", "college_admin"].includes(get().user?.role ?? ""),
      isPrincipal: () => get().user?.role === "principal",
      isHod: () => get().user?.role === "hod",
      isFaculty: () => get().user?.role === "faculty",
      isInstitutionWide: () => ["admin", "college_admin", "principal"].includes(get().user?.role ?? ""),
    }),
    { name: "user-store", partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
