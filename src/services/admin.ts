/**
 * Admin API service functions.
 * All functions call the FastAPI backend admin routes.
 */
import { api } from "./api"

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const dashboardApi = {
  getKPIs: () => api.get("/admin/dashboard/kpis").then((r) => r.data),
  getInsights: () => api.get("/admin/dashboard/ai-insights").then((r) => r.data),
  getRecentActivity: (limit = 10) =>
    api.get("/admin/dashboard/recent-activity", { params: { limit } }).then((r) => r.data),
}


// ─── Departments ─────────────────────────────────────────────────────────────

export const departmentsApi = {
  list: (params?: { is_active?: boolean }) =>
    api.get("/admin/academic/departments", { params }).then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/departments", data).then((r) => r.data),
  update: (id: number, data: any) => api.patch(`/admin/academic/departments/${id}`, data).then((r) => r.data),
  toggle: (id: number) => api.patch(`/admin/academic/departments/${id}/toggle`).then((r) => r.data),
  getOverview: () => api.get("/admin/academic/departments/overview").then((r) => r.data),
}


// ─── Users ───────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: {
    role?: string
    department_id?: number
    is_active?: boolean
    search?: string
    page?: number
    page_size?: number
  }) => api.get("/admin/users", { params }).then((r) => r.data),
  get: (id: number) => api.get(`/admin/users/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/admin/users", data).then((r) => r.data),
  update: (id: number, data: any) => api.patch(`/admin/users/${id}`, data).then((r) => r.data),
  resetPassword: (id: number, newPassword: string) =>
    api.post(`/admin/users/${id}/reset-password`, { new_password: newPassword }).then((r) => r.data),
  toggle: (id: number) => api.patch(`/admin/users/${id}/toggle`).then((r) => r.data),
  getActivity: (id: number, limit = 20) =>
    api.get(`/admin/users/${id}/activity`, { params: { limit } }).then((r) => r.data),
  getInsights: () => api.get("/admin/users/insights/ai").then((r) => r.data),
  bulkAction: (data: { user_ids: number[], action: string, value?: string }) =>
    api.post("/admin/users/bulk", data).then((r) => r.data),
}


// ─── Analytics (existing, re-exported) ──────────────────────────────────────

export const analyticsApi = {
  getDashboard: () => api.get("/analytics/dashboard").then((r) => r.data),
  getAttendanceTrend: (months = 6, department_id?: number) =>
    api.get("/analytics/attendance-trend", { params: { months, department_id } }).then((r) => r.data),
  getDepartmentPerformance: () => api.get("/analytics/department-performance").then((r) => r.data),
  getSubjectPassRates: (params?: { department_id?: number; semester?: number }) =>
    api.get("/analytics/subject-pass-rates", { params }).then((r) => r.data),
}




// ─── Phase 2: Audit Logs ──────────────────────────────────────────────────────

export const auditApi = {
  getLogs: (params?: { user_id?: number; table_name?: string; action?: string; date_from?: string; date_to?: string; page?: number; page_size?: number }) =>
    api.get("/admin/audit/logs", { params }).then((r) => r.data),
  getStats: () => api.get("/admin/audit/stats").then((r) => r.data),
}

// ─── Phase 2: AI Operations ────────────────────────────────────────────────────

export const aiOpsApi = {
  getStats: () => api.get("/admin/ai/stats").then((r) => r.data),
  getSessions: (params?: { page?: number; page_size?: number }) =>
    api.get("/admin/ai/sessions", { params }).then((r) => r.data),
  triggerRiskScan: () => api.post("/admin/ai/risk/trigger-scan").then((r) => r.data),
}


// ─── Phase 2: Settings ────────────────────────────────────────────────────────

export const settingsApi = {
  getCollege: () => api.get("/admin/settings/college").then((r) => r.data),
  updateCollege: (data: any) => api.patch("/admin/settings/college", data).then((r) => r.data),
  getNaac: () => api.get("/admin/settings/naac").then((r) => r.data),
}

