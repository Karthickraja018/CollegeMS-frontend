"use client"

import { useUserStore } from "@/store"
import { AdminDashboard } from "@/components/dashboards/AdminDashboard"
import { PrincipalDashboard } from "@/components/dashboards/PrincipalDashboard"
import { HodDashboard } from "@/components/dashboards/HodDashboard"
import { FacultyDashboard } from "@/components/dashboards/FacultyDashboard" // trigger rebuild

/**
 * Role Router — shows the correct dashboard based on user role.
 * Each role gets a completely different dashboard with role-scoped data.
 *
 * Admin/College Admin  → AdminDashboard (system ops + institution-wide)
 * Principal            → PrincipalDashboard (institutional intelligence)
 * HOD                  → HodDashboard (department intelligence)
 * Faculty              → FacultyDashboard (assigned students)
 */
export default function DashboardPage() {
  const user = useUserStore((s) => s.user)
  const role = user?.role

  if (!role) {
    return (
      <div className="flex flex-col gap-6 max-w-[1600px]">
        <div className="h-32 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (role === "admin" || role === "college_admin") {
    return <AdminDashboard />
  }

  if (role === "principal") {
    return <PrincipalDashboard />
  }

  if (role === "hod") {
    return <HodDashboard />
  }

  if (role === "faculty") {
    return <FacultyDashboard />
  }

  // Fallback: unknown role
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-lg font-semibold text-[#0F172A]">Access Restricted</div>
        <div className="text-sm text-[#94A3B8] mt-1">Your role ({role}) does not have dashboard access.</div>
      </div>
    </div>
  )
}
