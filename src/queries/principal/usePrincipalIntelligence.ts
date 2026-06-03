/**
 * TanStack Query hooks for Principal Intelligence — Faculty & HOD endpoints.
 * All hooks require principal role (enforced on backend via JWT).
 */
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const principalKeys = {
  faculty: ["principal", "faculty"] as const,
  facultyProfile: (id: number) => ["principal", "faculty", id] as const,
  facultyCompliance: ["principal", "faculty", "compliance"] as const,
  facultyRankings: ["principal", "faculty", "rankings"] as const,
  hod: ["principal", "hod"] as const,
  hodProfile: (id: number) => ["principal", "hod", id] as const,
  hodRankings: ["principal", "hod", "rankings"] as const,
  deptUnderperforming: (deptId: number) => ["principal", "dept", deptId, "underperforming"] as const,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FacultyMetric {
  id: number
  full_name: string
  email: string
  employee_id: string | null
  designation: string | null
  experience_years: number | null
  qualification: string | null
  role: string
  dept_id: number
  dept_name: string
  dept_code: string
  attendance_submission_pct: number | null
  marks_submission_pct: number | null
  metric_pass_rate: number | null
  metric_avg_att: number | null
  feedback_score: number | null
  classes_conducted: number | null
  ai_usage_count: number | null
  report_count: number | null
  latest_month: string | null
  live_student_att: number | null
  live_pass_rate: number | null
  subjects_count: number
  students_taught: number
  compliance_score: number | null
  performance_grade: string
  performance_color: "green" | "blue" | "amber" | "red" | "gray"
}

export interface FacultyProfile {
  faculty: {
    id: number
    full_name: string
    email: string
    employee_id: string | null
    designation: string | null
    experience_years: number | null
    qualification: string | null
    phone: string | null
    role: string
    last_login: string | null
    dept_id: number
    dept_name: string
    dept_code: string
  }
  performance_trend: PerformanceTrendPoint[]
  subjects: SubjectOutcome[]
  at_risk_students: RiskStudent[]
  failed_subject_students: RiskStudent[]
  low_attendance_students: RiskStudent[]
}

export interface PerformanceTrendPoint {
  month: string
  attendance_submission_pct: number | null
  marks_submission_pct: number | null
  student_pass_rate: number | null
  avg_student_attendance: number | null
  feedback_score: number | null
  classes_conducted: number | null
  ai_usage_count: number | null
  report_count: number | null
}

export interface SubjectOutcome {
  id: number
  name: string
  code: string
  semester_number: number
  students_taught: number
  pass_rate: number | null
  avg_marks: number | null
}

export interface RiskStudent {
  student_id?: number
  id?: number
  name: string
  roll_number: string
  current_semester: number
  department?: string
  risk_score: number
  attendance_pct: number | null
  avg_marks?: number | null
  marks_pct?: number | null
  risk_level: "critical" | "high" | "medium" | "low"
}

export interface HodMetric {
  id: number
  full_name: string
  email: string
  employee_id: string | null
  designation: string | null
  experience_years: number | null
  qualification: string | null
  dept_id: number
  dept_name: string
  dept_code: string
  dept_health_score: number | null
  faculty_compliance_rate: number | null
  student_risk_count: number
  hod_pass_rate: number | null
  hod_att_rate: number | null
  review_meetings_held: number
  faculty_feedback_avg: number | null
  latest_month: string | null
  faculty_count: number
  student_count: number
  hod_grade: string
  hod_color: "green" | "blue" | "amber" | "red" | "gray"
}

export interface HodProfile {
  hod: {
    id: number
    full_name: string
    email: string
    employee_id: string | null
    designation: string | null
    experience_years: number | null
    qualification: string | null
    phone: string | null
    last_login: string | null
    dept_id: number
    dept_name: string
    dept_code: string
  }
  performance_trend: HodTrendPoint[]
  faculty_compliance: FacultyCompliance[]
  at_risk_students: RiskStudent[]
  dept_kpis: {
    total_students: number
    avg_attendance: number
    pass_rate: number
    at_risk_count: number
  }
}

export interface HodTrendPoint {
  month: string
  dept_health_score: number | null
  faculty_compliance_rate: number | null
  student_risk_count: number
  pass_rate: number | null
  attendance_rate: number | null
  review_meetings_held: number
  faculty_feedback_avg: number | null
}

export interface FacultyCompliance {
  id: number
  full_name: string
  employee_id: string | null
  designation: string | null
  attendance_submission_pct: number | null
  marks_submission_pct: number | null
  student_pass_rate: number | null
  feedback_score: number | null
  latest_month: string | null
  compliance_score: number | null
  is_compliant: boolean
}

export interface UnderperformingGroup {
  faculty_id: number
  faculty_name: string
  employee_id: string | null
  subjects: {
    subject_id: number
    subject_name: string
    subject_code: string
    semester: number
    students: {
      student_id: number
      name: string
      roll_number: string
      semester: number
      risk_score: number
      attendance_pct: number
      marks_pct: number
    }[]
  }[]
  total_underperforming: number
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** All faculty with latest performance metrics */
export function useFacultyList() {
  return useQuery<FacultyMetric[]>({
    queryKey: principalKeys.faculty,
    queryFn: () => api.get("/principal/faculty").then((r) => r.data ?? []),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

/** Full faculty profile with 6-month trend */
export function useFacultyProfile(userId: number | null) {
  return useQuery<FacultyProfile>({
    queryKey: principalKeys.facultyProfile(userId!),
    queryFn: () => api.get(`/principal/faculty/${userId}`).then((r) => r.data),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/** Non-compliant faculty list */
export function useFacultyCompliance() {
  return useQuery({
    queryKey: principalKeys.facultyCompliance,
    queryFn: () => api.get("/principal/faculty/compliance").then((r) => r.data ?? []),
    staleTime: 5 * 60 * 1000,
  })
}

/** Faculty top/bottom rankings */
export function useFacultyRankings() {
  return useQuery({
    queryKey: principalKeys.facultyRankings,
    queryFn: () => api.get("/principal/faculty/rankings").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

/** All HODs with their scores */
export function useHodList() {
  return useQuery<HodMetric[]>({
    queryKey: principalKeys.hod,
    queryFn: () => api.get("/principal/hod").then((r) => r.data ?? []),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

/** Full HOD profile with dept trend and faculty compliance */
export function useHodProfile(userId: number | null) {
  return useQuery<HodProfile>({
    queryKey: principalKeys.hodProfile(userId!),
    queryFn: () => api.get(`/principal/hod/${userId}`).then((r) => r.data),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/** HOD rankings */
export function useHodRankings() {
  return useQuery({
    queryKey: principalKeys.hodRankings,
    queryFn: () => api.get("/principal/hod/rankings").then((r) => r.data?.rankings ?? []),
    staleTime: 5 * 60 * 1000,
  })
}

/** Underperforming students grouped by faculty in a department */
export function useDeptUnderperforming(deptId: number | null) {
  return useQuery<{ faculty_groups: UnderperformingGroup[] }>({
    queryKey: principalKeys.deptUnderperforming(deptId!),
    queryFn: () =>
      api.get(`/principal/departments/${deptId}/underperforming`).then((r) => r.data),
    enabled: !!deptId,
    staleTime: 5 * 60 * 1000,
  })
}
