"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  Upload,
  Settings,
  ChevronsUpDown,
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  UserCheck,
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Briefcase,
  Bell,
  ScrollText,
  Cpu,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  children?: NavItem[]
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/chat", label: "AI Assistant", icon: MessageSquare },
    ],
  },
  {
    title: "Academic",
    items: [
      {
        href: "/admin/academic",
        label: "Academic Setup",
        icon: BookOpen,
        children: [
          { href: "/admin/academic/years", label: "Academic Years", icon: Calendar },
          { href: "/admin/academic/departments", label: "Departments", icon: Building2 },
          { href: "/admin/academic/programs", label: "Programs", icon: GraduationCap },
          { href: "/admin/academic/semesters", label: "Semesters", icon: Calendar },
          { href: "/admin/academic/subjects", label: "Subjects", icon: BookOpen },
        ],
      },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      {
        href: "/admin/students",
        label: "Students",
        icon: GraduationCap,
        children: [
          { href: "/admin/students", label: "All Students", icon: GraduationCap },
          { href: "/admin/students/at-risk", label: "At-Risk Students", icon: AlertTriangle },
        ],
      },
      { href: "/admin/faculty", label: "Faculty", icon: UserCheck },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        href: "/admin/attendance",
        label: "Attendance",
        icon: ClipboardList,
        children: [
          { href: "/admin/attendance/overview", label: "Overview", icon: BarChart3 },
          { href: "/admin/attendance/defaulters", label: "Defaulters", icon: AlertTriangle },
        ],
      },
      {
        href: "/admin/examinations",
        label: "Examinations",
        icon: FileText,
        children: [
          { href: "/admin/examinations/schedules", label: "Schedules", icon: Calendar },
          { href: "/admin/examinations/marks", label: "Marks", icon: ClipboardList },
          { href: "/admin/examinations/results", label: "Results", icon: BarChart3 },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      {
        href: "/admin/finance",
        label: "Finance",
        icon: DollarSign,
        children: [
          { href: "/admin/finance/structures", label: "Fee Structures", icon: FileText },
          { href: "/admin/finance/accounts", label: "Accounts", icon: DollarSign },
          { href: "/admin/finance/dashboard", label: "Revenue", icon: BarChart3 },
        ],
      },
      {
        href: "/admin/placements",
        label: "Placements",
        icon: Briefcase,
        children: [
          { href: "/admin/placements/drives", label: "Drives", icon: Briefcase },
          { href: "/admin/placements/applications", label: "Applications", icon: ClipboardList },
          { href: "/admin/placements/analytics", label: "Analytics", icon: BarChart3 },
        ],
      },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/upload", label: "Data Import", icon: Upload },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/ai-operations", label: "AI Operations", icon: Cpu },
      { href: "/admin/settings/college", label: "Settings", icon: Settings },
    ],
  },
]

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
  const hasChildren = item.children && item.children.length > 0
  const isParentActive = hasChildren && item.children!.some(
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

export default function Sidebar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try { setUser(JSON.parse(userStr)) } catch (e) {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <aside className="w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col h-full z-10 shadow-sm">
      {/* Logo / Workspace */}
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#F1F5F9] rounded-lg cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            C
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#0F172A] truncate">CollegeMS</div>
            <div className="text-xs text-[#94A3B8] truncate">System Admin</div>
          </div>
          <ChevronsUpDown size={14} className="text-[#94A3B8] flex-shrink-0" />
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
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#0F172A] truncate">{user?.full_name || "Administrator"}</div>
            <div className="text-xs text-[#94A3B8] truncate capitalize">{user?.role?.replace(/_/g, " ") || "System Admin"}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-red-50 hover:text-red-600 text-[#94A3B8] rounded-md transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
