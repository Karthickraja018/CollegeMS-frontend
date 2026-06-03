import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

export const deptKeys = {
  list: ["departments", "list"] as const,
  overview: (id: number) => ["departments", "overview", id] as const,
  subjects: (id: number, sem?: number) => ["departments", "subjects", id, sem] as const,
  faculty: (id: number) => ["departments", "faculty", id] as const,
  trends: (id: number) => ["departments", "trends", id] as const,
  risk: (id: number) => ["departments", "risk", id] as const,
  compare: ["departments", "compare"] as const,
}

export function useDepartmentList() {
  return useQuery({
    queryKey: deptKeys.list,
    queryFn: () => api.get("/department-intelligence/").then((r) => r.data),
    staleTime: 300_000,
  })
}

export function useDepartmentOverview(deptId: number | null) {
  return useQuery({
    queryKey: deptKeys.overview(deptId!),
    queryFn: () => api.get(`/department-intelligence/${deptId}/overview`).then((r) => r.data),
    enabled: deptId != null,
    staleTime: 60_000,
  })
}

export function useDepartmentSubjects(deptId: number | null, semester?: number) {
  return useQuery({
    queryKey: deptKeys.subjects(deptId!, semester),
    queryFn: () =>
      api
        .get(`/department-intelligence/${deptId}/subject-analysis`, {
          params: semester ? { semester } : {},
        })
        .then((r) => r.data),
    enabled: deptId != null,
    staleTime: 60_000,
  })
}

export function useDepartmentFaculty(deptId: number | null) {
  return useQuery({
    queryKey: deptKeys.faculty(deptId!),
    queryFn: () =>
      api.get(`/department-intelligence/${deptId}/faculty-performance`).then((r) => r.data),
    enabled: deptId != null,
    staleTime: 120_000,
  })
}

export function useDepartmentTrends(deptId: number | null) {
  return useQuery({
    queryKey: deptKeys.trends(deptId!),
    queryFn: () =>
      api.get(`/department-intelligence/${deptId}/student-trends`).then((r) => r.data),
    enabled: deptId != null,
    staleTime: 120_000,
  })
}

export function useDepartmentRiskDistribution(deptId: number | null) {
  return useQuery({
    queryKey: deptKeys.risk(deptId!),
    queryFn: () =>
      api.get(`/department-intelligence/${deptId}/risk-distribution`).then((r) => r.data),
    enabled: deptId != null,
    staleTime: 120_000,
  })
}

export function useDepartmentComparison() {
  return useQuery({
    queryKey: deptKeys.compare,
    queryFn: () => api.get("/department-intelligence/compare").then((r) => r.data),
    staleTime: 120_000,
  })
}
