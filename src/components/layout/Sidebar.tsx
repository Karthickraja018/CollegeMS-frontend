"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  Upload,
  UserCog,
  GraduationCap,
  LogOut,
  Zap,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/upload", label: "Upload Center", icon: Upload },
  { href: "/users", label: "User Management", icon: UserCog },
]
import { useState, useEffect } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366F1, #14B8A6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={16} color="white" />
          </div>
          <span className="sidebar-logo-text">CollegeMS</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, paddingLeft: 42 }}>
          AI Platform
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 12px 8px", fontWeight: 600 }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        {user && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              <span className={`badge badge-indigo`} style={{ fontSize: 10 }}>
                {user.role?.toUpperCase()}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
