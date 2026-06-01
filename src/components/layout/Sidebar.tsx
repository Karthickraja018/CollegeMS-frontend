"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  Upload,
  Settings,
  GraduationCap,
  BookOpen,
  Building2,
  AlertTriangle,
  ScrollText,
  Cpu,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore, UserRole } from "@/store"

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  children?: NavItem[]
}

type NavGroup = {
  title: string
  items: NavItem[]
}

// ─── Role-based nav configuration ────────────────────────────────────────────

function getNavGroups(role: UserRole | undefined): NavGroup[] {
  switch (role) {
    case "admin":
    case "college_admin":
      return [
        {
          title: "Intelligence",
          items: [
            { href: "/chat", label: "AI Copilot", icon: MessageSquare },
            { href: "/dashboard", label: "System Dashboard", icon: LayoutDashboard },
          ],
        },
        {
          title: "Management",
          items: [
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/academic", label: "Academic Setup", icon: BookOpen },
            { href: "/sync", label: "Data Sync", icon: Upload },
          ],
        },
        {
          title: "System",
          items: [
            { href: "/admin/ai-operations", label: "AI Operations", icon: Cpu },
            { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
            { href: "/admin/settings/college", label: "Settings", icon: Settings },
          ],
        },
      ]

    case "principal":
      return [
        {
          title: "Intelligence",
          items: [
            { href: "/chat", label: "AI Copilot", icon: MessageSquare },
            { href: "/dashboard", label: "Institutional Pulse", icon: LayoutDashboard },
          ],
        },
        {
          title: "Analytics",
          items: [
            { href: "/intelligence/students", label: "Student Intelligence", icon: GraduationCap },
            { href: "/intelligence/departments", label: "Department Intelligence", icon: Building2 },
            { href: "/accreditation", label: "Accreditation & Reports", icon: FileText },
          ],
        },
        {
          title: "System",
          items: [
            { href: "/admin/settings/college", label: "Settings", icon: Settings },
          ],
        },
      ]

    case "hod":
      return [
        {
          title: "Intelligence",
          items: [
            { href: "/chat", label: "AI Copilot", icon: MessageSquare },
            { href: "/dashboard", label: "Department Dashboard", icon: LayoutDashboard },
          ],
        },
        {
          title: "Analytics",
          items: [
            { href: "/intelligence/students", label: "Student Intelligence", icon: GraduationCap },
            { href: "/intelligence/departments", label: "Department Intelligence", icon: Building2 },
          ],
        },
        {
          title: "Reports",
          items: [
            { href: "/accreditation", label: "Department Reports", icon: FileText },
          ],
        },
      ]

    case "faculty":
      return [
        {
          title: "Intelligence",
          items: [
            { href: "/chat", label: "AI Copilot", icon: MessageSquare },
            { href: "/dashboard", label: "My Students", icon: LayoutDashboard },
          ],
        },
        {
          title: "Students",
          items: [
            { href: "/intelligence/students", label: "Student Intelligence", icon: GraduationCap },
            {
              href: "/intelligence/students?risk_level=critical",
              label: "Risk Alerts",
              icon: AlertTriangle,
            },
          ],
        },
      ]

    default:
      return []
  }
}

// ─── Role badge config ────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, { label: string; colors: string }> = {
  admin:        { label: "Admin",     colors: "bg-purple-100 text-purple-700" },
  college_admin:{ label: "Admin",     colors: "bg-purple-100 text-purple-700" },
  principal:    { label: "Principal", colors: "bg-blue-100 text-blue-700" },
  hod:          { label: "HOD",       colors: "bg-teal-100 text-teal-700" },
  faculty:      { label: "Faculty",   colors: "bg-green-100 text-green-700" },
}

// ─── NavLink ─────────────────────────────────────────────────────────────────

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  // For query-param links, match by full href including search params
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && !item.href.includes("?") && pathname.startsWith(item.href + "/"))
  const hasChildren = item.children && item.children.length > 0
  const isParentActive =
    hasChildren &&
    item.children!.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
    )
  const [open, setOpen] = useState(isParentActive || isActive)
  const Icon = item.icon

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isParentActive
              ? "text-[#6366F1] bg-[#6366F1]/10"
              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          <Icon size={18} strokeWidth={isParentActive ? 2.5 : 2} />
          <span className="flex-1 text-left">{item.label}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-[#94A3B8]" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-[#E2E8F0] pl-2">
                {item.children!.map((child) => (
                  <NavLink key={child.href} item={child} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "text-[#6366F1] bg-[#6366F1]/10"
          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
      }`}
      style={{ paddingLeft: `${12 + depth * 12}px` }}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute left-0 top-[15%] bottom-[15%] w-1 bg-[#6366F1] rounded-r-md shadow-sm"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon size={depth > 0 ? 15 : 18} strokeWidth={isActive ? 2.5 : 2} />
      <span>{item.label}</span>
    </Link>
  )
}

// ─── Skeleton sidebar ─────────────────────────────────────────────────────────

function SidebarSkeleton() {
  return (
    <aside className="w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col h-full z-10 shadow-sm">
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-lg bg-[#E2E8F0] animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-[#E2E8F0] rounded animate-pulse w-24" />
            <div className="h-2.5 bg-[#E2E8F0] rounded animate-pulse w-16" />
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-4">
        {[1, 2, 3].map((g) => (
          <div key={g} className="space-y-1.5">
            <div className="h-2 bg-[#E2E8F0] rounded animate-pulse w-14 mx-3 mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-[#F1F5F9] rounded-lg animate-pulse mx-1" />
            ))}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-[#E2E8F0] animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-[#E2E8F0] rounded animate-pulse w-20" />
            <div className="h-2.5 bg-[#E2E8F0] rounded animate-pulse w-14" />
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)

  if (!user) {
    return <SidebarSkeleton />
  }

  const navGroups = getNavGroups(user.role)
  const badge = ROLE_BADGE[user.role]
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const roleLabel = user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <aside className="w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col h-full z-10 shadow-sm">
      {/* Logo / Workspace */}
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#F1F5F9] rounded-lg cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            C
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#0F172A] truncate">CollegeMS</div>
            <div className="text-xs text-[#94A3B8] truncate">Academic Intelligence</div>
          </div>
          {badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${badge.colors}`}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin space-y-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-widest px-3 mb-1.5">
              {group.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href + item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#0F172A] truncate">{user.full_name}</div>
            <div className="text-xs text-[#94A3B8] truncate">{roleLabel}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-red-50 hover:text-red-600 text-[#94A3B8] rounded-md transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
