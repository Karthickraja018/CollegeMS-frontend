import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

export const studentKeys = {
  atRisk: (params: Record<string, any>) => ["students", "at-risk", params] as const,
  profile: (id: number) => ["students", "profile", id] as const,
  attendanceTrend: (id: number) => ["students", "attendance-trend", id] as const,
  marksTrend: (id: number) => ["students", "marks-trend", id] as const,
  recommendations: (id: number) => ["students", "recommendations", id] as const,
  interventions: (id: number) => ["students", "interventions", id] as const,
}

export function useAtRiskStudents(params: {
  page?: number
  page_size?: number
  department_id?: number | null
  risk_level?: string
  semester?: number | null
  search?: string
}) {
  return useQuery({
    queryKey: studentKeys.atRisk(params),
    queryFn: () =>
      api.get("/student-intelligence/at-risk", {
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
      }).then((r) => r.data),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  })
}

export function useStudentProfile(studentId: number | null) {
  return useQuery({
    queryKey: studentKeys.profile(studentId!),
    queryFn: () => api.get(`/student-intelligence/${studentId}/profile`).then((r) => r.data),
    enabled: studentId != null,
    staleTime: 60_000,
  })
}

export function useStudentAttendanceTrend(studentId: number | null, months = 6) {
  return useQuery({
    queryKey: studentKeys.attendanceTrend(studentId!),
    queryFn: () => api.get(`/student-intelligence/${studentId}/attendance-trend`, { params: { months } }).then((r) => r.data),
    enabled: studentId != null,
    staleTime: 60_000,
  })
}

export function useStudentMarksTrend(studentId: number | null) {
  return useQuery({
    queryKey: studentKeys.marksTrend(studentId!),
    queryFn: () => api.get(`/student-intelligence/${studentId}/marks-trend`).then((r) => r.data),
    enabled: studentId != null,
    staleTime: 60_000,
  })
}

export function useStudentRecommendations(studentId: number | null) {
  return useQuery({
    queryKey: studentKeys.recommendations(studentId!),
    queryFn: () => api.get(`/student-intelligence/${studentId}/recommendations`).then((r) => r.data),
    enabled: studentId != null,
    staleTime: 300_000,
  })
}

export function useStudentInterventions(studentId: number | null) {
  return useQuery({
    queryKey: studentKeys.interventions(studentId!),
    queryFn: () => api.get(`/student-intelligence/${studentId}/interventions`).then((r) => r.data),
    enabled: studentId != null,
    staleTime: 60_000,
  })
}

export function useStudentWeeklyAttendance(studentId: number | null) {
  return useQuery({
    queryKey: ["students", "weekly-attendance", studentId!],
    queryFn: () => api.get(`/student-intelligence/${studentId}/weekly-attendance`).then((r) => r.data),
    enabled: studentId != null,
    staleTime: 60_000,
  })
}
