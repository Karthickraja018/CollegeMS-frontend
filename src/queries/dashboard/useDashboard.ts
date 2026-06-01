/**
 * TanStack Query hooks for dashboard data.
 * All hooks are role-scoped — the backend JWT determines which data is returned.
 */

import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const dashboardKeys = {
  kpis: ["dashboard", "kpis"] as const,
  insights: ["dashboard", "insights"] as const,
  health: ["dashboard", "health"] as const,
  rankings: ["dashboard", "rankings"] as const,
  deptPerformance: ["analytics", "dept-performance"] as const,
  attendanceTrend: (months: number, deptId?: number) =>
    ["analytics", "attendance-trend", months, deptId] as const,
  subjectPassRates: ["analytics", "subject-pass-rates"] as const,
  atRisk: (limit: number) => ["student-intelligence", "at-risk", limit] as const,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AHSComponent {
  label: string
  value: number
  weight: number
}

export interface AcademicHealthScore {
  score: number
  grade: string
  color: "green" | "blue" | "amber" | "red" | string
  components: AHSComponent[]
}

export interface DashboardKPIs {
  // Admin
  total_users?: number
  total_students?: number
  total_departments?: number
  total_faculty?: number
  total_reports?: number
  total_ai_queries?: number
  active_semesters?: number
  total_programs?: number
  // Principal / HOD / Faculty shared
  avg_attendance?: number
  pass_rate?: number
  pass_percentage?: number   // alias used by some role endpoints
  at_risk_students?: number
  // HOD-specific
  dept_students?: number
  dept_attendance?: number
  dept_faculty?: number      // HOD: faculty count in dept
  dept_subjects?: number     // HOD: subject count in dept
  faculty_count?: number
  department_name?: string
  // Faculty-specific
  assigned_students?: number
  assigned_subjects?: number
  avg_marks?: number
  // Shared AHS
  academic_health?: AcademicHealthScore
}

export interface InsightRecommendation {
  type: "attendance" | "academic" | "intervention" | "monitoring"
  priority: "critical" | "high" | "medium" | "low"
  severity?: string
  problem: string
  recommendation: string
  expected_impact: string
  owner: string
}

export interface InsightCard {
  title: string
  description: string
  category: string
  severity: string
}

export interface DashboardInsights {
  insights: InsightCard[]
  recommendations: InsightRecommendation[]
  generated_at?: string
}

export interface DepartmentRanking {
  rank: number
  department_id: number
  department_name: string
  ahs_score: number
  ahs_grade: string
  ahs_color: string
  attendance_rate: number
  pass_rate: number
  at_risk_count: number
}

export interface DeptPerformance {
  department: string
  ahs_score: number
  attendance: number
  pass_rate: number
}

export interface AttendanceTrend {
  month: string
  attendance: number
  pass_rate: number
}

export interface AtRiskStudent {
  id: number
  name: string
  roll_number: string
  risk_score: number
  attendance_percentage: number
  marks_average: number
  department?: string
}

export interface SubjectPassRate {
  subject: string
  pass_rate: number
  total_students: number
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Role-scoped KPI summary — backend picks scope from JWT */
export function useDashboardKPIs() {
  return useQuery<DashboardKPIs>({
    queryKey: dashboardKeys.kpis,
    queryFn: () => api.get("/dashboard/kpis").then((r) => r.data),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

/** AI-powered insights & recommendations — role-scoped */
export function useDashboardInsights() {
  return useQuery<DashboardInsights>({
    queryKey: dashboardKeys.insights,
    queryFn: () => api.get("/dashboard/insights").then((r) => r.data),
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

/** Academic health score only */
export function useAcademicHealth() {
  return useQuery<AcademicHealthScore>({
    queryKey: dashboardKeys.health,
    queryFn: () => api.get("/dashboard/health").then((r) => r.data),
    staleTime: 120_000,
  })
}

/** Department rankings — principal-level endpoint */
export function useDepartmentRankings() {
  return useQuery<DepartmentRanking[]>({
    queryKey: dashboardKeys.rankings,
    queryFn: () => api.get("/dashboard/department-rankings").then((r) => r.data),
    staleTime: 120_000,
  })
}

/** Attendance trend over time */
export function useAttendanceTrend(months = 6, departmentId?: number) {
  return useQuery<AttendanceTrend[]>({
    queryKey: dashboardKeys.attendanceTrend(months, departmentId),
    queryFn: () =>
      api
        .get("/analytics/attendance-trend", { params: { months, department_id: departmentId } })
        .then((r) => r.data),
    staleTime: 120_000,
  })
}

/** Department performance for bar chart */
export function useDeptPerformance() {
  return useQuery<DeptPerformance[]>({
    queryKey: dashboardKeys.deptPerformance,
    queryFn: () => api.get("/analytics/department-performance").then((r) => r.data),
    staleTime: 120_000,
  })
}

/** At-risk students (role-scoped) */
export function useAtRiskStudents(limit = 5) {
  return useQuery<AtRiskStudent[]>({
    queryKey: dashboardKeys.atRisk(limit),
    queryFn: async () => {
      const { data } = await api.get(`/student-intelligence/at-risk`, { params: { limit } })
      return Array.isArray(data) ? data : (data.results ?? [])
    },
    staleTime: 120_000,
  })
}

/** Subject pass rates — top 5 (HOD-scoped) */
export function useSubjectPassRates() {
  return useQuery<SubjectPassRate[]>({
    queryKey: dashboardKeys.subjectPassRates,
    queryFn: () =>
      api.get("/analytics/subject-pass-rates", { params: { limit: 5 } }).then((r) => r.data),
    staleTime: 120_000,
  })
}
