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
  Settings,
  ChevronsUpDown,
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/students", label: "Students", icon: Users },
]

const analyticsNavItems = [
  { href: "/analytics", label: "Performance", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
]

const adminNavItems = [
  { href: "/upload", label: "Upload Center", icon: Upload },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {}
    }
  }, [])

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-6">
      <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-3 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "text-[#6366F1] bg-[#6366F1]/10" 
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 top-[15%] bottom-[15%] w-1 bg-[#6366F1] rounded-r-md shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <aside className="w-[280px] bg-white border-r border-[#E2E8F0] flex flex-col h-full z-10 shadow-sm relative">
      {/* Workspace Switcher */}
      <div className="p-4">
        <div className="flex items-center justify-between p-2 hover:bg-[#F1F5F9] rounded-lg cursor-pointer transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">CollegeMS</div>
              <div className="text-xs font-medium text-[#475569]">Enterprise Plan</div>
            </div>
          </div>
          <ChevronsUpDown size={16} className="text-[#94A3B8]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto mt-2">
        <NavGroup title="Main" items={mainNavItems} />
        <NavGroup title="Analytics" items={analyticsNavItems} />
        <NavGroup title="Administration" items={adminNavItems} />
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#F1F5F9] rounded-lg cursor-pointer transition-colors duration-200">
          <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#475569] text-sm font-semibold">
            {user?.full_name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#0F172A] truncate">{user?.full_name || "Administrator"}</div>
            <div className="text-xs font-medium text-[#94A3B8] truncate">{user?.role || "System Admin"}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
