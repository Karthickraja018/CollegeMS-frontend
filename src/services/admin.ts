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

// ─── Academic Years ──────────────────────────────────────────────────────────

export const academicYearsApi = {
  list: () => api.get("/admin/academic/years").then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/years", data).then((r) => r.data),
  update: (id: number, data: any) => api.patch(`/admin/academic/years/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/admin/academic/years/${id}`),
}

// ─── Departments ─────────────────────────────────────────────────────────────

export const departmentsApi = {
  list: (params?: { is_active?: boolean }) =>
    api.get("/admin/academic/departments", { params }).then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/departments", data).then((r) => r.data),
  update: (id: number, data: any) => api.patch(`/admin/academic/departments/${id}`, data).then((r) => r.data),
  toggle: (id: number) => api.patch(`/admin/academic/departments/${id}/toggle`).then((r) => r.data),
}

// ─── Programs ────────────────────────────────────────────────────────────────

export const programsApi = {
  list: (params?: { department_id?: number }) =>
    api.get("/admin/academic/programs", { params }).then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/programs", data).then((r) => r.data),
  update: (id: number, data: any) => api.patch(`/admin/academic/programs/${id}`, data).then((r) => r.data),
}

// ─── Semesters ───────────────────────────────────────────────────────────────

export const semestersApi = {
  list: (params?: { program_id?: number; status?: string }) =>
    api.get("/admin/academic/semesters", { params }).then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/semesters", data).then((r) => r.data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/admin/academic/semesters/${id}/status`, null, { params: { new_status: status } }).then((r) => r.data),
}

// ─── Subjects ────────────────────────────────────────────────────────────────

export const subjectsApi = {
  list: (params?: { department_id?: number; program_id?: number; semester_number?: number; search?: string }) =>
    api.get("/admin/academic/subjects", { params }).then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/subjects", data).then((r) => r.data),
  update: (id: number, data: any) => api.patch(`/admin/academic/subjects/${id}`, data).then((r) => r.data),
  deactivate: (id: number) => api.delete(`/admin/academic/subjects/${id}`),
}

// ─── Faculty Assignments ─────────────────────────────────────────────────────

export const facultyAssignApi = {
  list: (params?: { semester_id?: number; department_id?: number }) =>
    api.get("/admin/academic/faculty-assignments", { params }).then((r) => r.data),
  create: (data: any) => api.post("/admin/academic/faculty-assignments", data).then((r) => r.data),
  delete: (id: number) => api.delete(`/admin/academic/faculty-assignments/${id}`),
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
}

// ─── Students (Admin) ────────────────────────────────────────────────────────

export const studentsAdminApi = {
  list: (params?: {
    department_id?: number
    program_id?: number
    status?: string
    batch?: string
    current_semester?: number
    risk_level?: string
    search?: string
    page?: number
    page_size?: number
  }) => api.get("/admin/students", { params }).then((r) => r.data),
  getProfile: (id: number) => api.get(`/admin/students/${id}`).then((r) => r.data),
  updateStatus: (id: number, newStatus: string) =>
    api.post(`/admin/students/${id}/status`, { new_status: newStatus }).then((r) => r.data),
  promote: (id: number) => api.post(`/admin/students/${id}/promote`).then((r) => r.data),
  getAtRiskDashboard: (params?: { department_id?: number; risk_level?: string }) =>
    api.get("/admin/students/at-risk/dashboard", { params }).then((r) => r.data),
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

// ─── Phase 2: Attendance ─────────────────────────────────────────────────────

export const attendanceApi = {
  getSummary: (params?: { semester_id?: number; department_id?: number }) =>
    api.get("/admin/attendance/summary", { params }).then((r) => r.data),
  getDefaulters: (params?: { semester_id?: number; department_id?: number; threshold?: number; page?: number; page_size?: number }) =>
    api.get("/admin/attendance/defaulters", { params }).then((r) => r.data),
  getTrends: (params?: { semester_id?: number; department_id?: number }) =>
    api.get("/admin/attendance/trends", { params }).then((r) => r.data),
  getDeptHeatmap: (params?: { semester_id?: number }) =>
    api.get("/admin/attendance/department-heatmap", { params }).then((r) => r.data),
  getRecords: (params?: any) =>
    api.get("/admin/attendance/records", { params }).then((r) => r.data),
  correctRecord: (data: { record_id: number; new_status: string; remarks?: string }) =>
    api.post("/admin/attendance/corrections", data).then((r) => r.data),
}

// ─── Phase 2: Examinations ────────────────────────────────────────────────────

export const examsApi = {
  listSchedules: (params?: { semester_id?: number; subject_id?: number; exam_type?: string }) =>
    api.get("/admin/exams/schedules", { params }).then((r) => r.data),
  createSchedule: (data: any) => api.post("/admin/exams/schedules", data).then((r) => r.data),
  updateSchedule: (id: number, data: any) => api.patch(`/admin/exams/schedules/${id}`, data).then((r) => r.data),
  cancelSchedule: (id: number) => api.delete(`/admin/exams/schedules/${id}`),
  listMarks: (params?: { semester_id?: number; subject_id?: number; exam_type?: string; page?: number; page_size?: number }) =>
    api.get("/admin/exams/marks", { params }).then((r) => r.data),
  getResultsAnalysis: (semester_id: number, params?: { department_id?: number }) =>
    api.get("/admin/exams/results/analysis", { params: { semester_id, ...params } }).then((r) => r.data),
}

// ─── Phase 2: Finance ─────────────────────────────────────────────────────────

export const financeApi = {
  listStructures: (params?: { program_id?: number; academic_year?: string }) =>
    api.get("/admin/finance/structures", { params }).then((r) => r.data),
  createStructure: (data: any) => api.post("/admin/finance/structures", data).then((r) => r.data),
  updateStructure: (id: number, data: any) => api.patch(`/admin/finance/structures/${id}`, data).then((r) => r.data),
  deleteStructure: (id: number) => api.delete(`/admin/finance/structures/${id}`),
  listAccounts: (params?: { status?: string; academic_year?: string; department_id?: number; search?: string; page?: number; page_size?: number }) =>
    api.get("/admin/finance/accounts", { params }).then((r) => r.data),
  updateAccount: (id: number, data: any) => api.patch(`/admin/finance/accounts/${id}`, data).then((r) => r.data),
  listTransactions: (params?: { fee_account_id?: number; student_id?: number; mode?: string; date_from?: string; date_to?: string; page?: number; page_size?: number }) =>
    api.get("/admin/finance/transactions", { params }).then((r) => r.data),
  recordPayment: (data: any) => api.post("/admin/finance/transactions", data).then((r) => r.data),
  getDashboard: (academic_year?: string) =>
    api.get("/admin/finance/dashboard", { params: { academic_year } }).then((r) => r.data),
  getOverdue: () => api.get("/admin/finance/overdue").then((r) => r.data),
}

// ─── Phase 2: Placements ──────────────────────────────────────────────────────

export const placementsApi = {
  listDrives: (params?: { status?: string; drive_type?: string; search?: string; page?: number; page_size?: number }) =>
    api.get("/admin/placements/drives", { params }).then((r) => r.data),
  createDrive: (data: any) => api.post("/admin/placements/drives", data).then((r) => r.data),
  updateDrive: (id: number, data: any) => api.patch(`/admin/placements/drives/${id}`, data).then((r) => r.data),
  deleteDrive: (id: number) => api.delete(`/admin/placements/drives/${id}`),
  listApplications: (params?: { drive_id?: number; student_id?: number; status?: string; page?: number; page_size?: number }) =>
    api.get("/admin/placements/applications", { params }).then((r) => r.data),
  updateApplicationStatus: (id: number, data: { status: string; round_cleared?: number; notes?: string }) =>
    api.patch(`/admin/placements/applications/${id}/status`, data).then((r) => r.data),
  getAnalytics: (academic_year?: string) =>
    api.get("/admin/placements/analytics", { params: { academic_year } }).then((r) => r.data),
}

// ─── Phase 2: Notifications ────────────────────────────────────────────────────

export const notificationsApi = {
  list: (params?: { user_id?: number; type?: string; is_read?: boolean; page?: number; page_size?: number }) =>
    api.get("/admin/notifications", { params }).then((r) => r.data),
  getUnreadCount: () => api.get("/admin/notifications/unread-count").then((r) => r.data),
  broadcast: (data: { title: string; body: string; type?: string; role?: string; department_id?: number; action_url?: string }) =>
    api.post("/admin/notifications/broadcast", data).then((r) => r.data),
  markRead: (id: number) => api.patch(`/admin/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post("/admin/notifications/mark-all-read").then((r) => r.data),
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

// ─── Phase 2: Reports ─────────────────────────────────────────────────────────

export const reportsAdminApi = {
  list: (params?: { report_type?: string; status?: string; page?: number; page_size?: number }) =>
    api.get("/admin/reports", { params }).then((r) => r.data),
  create: (data: { title: string; report_type: string; format?: string; parameters?: any }) =>
    api.post("/admin/reports", data).then((r) => r.data),
}

// ─── Phase 2: Settings ────────────────────────────────────────────────────────

export const settingsApi = {
  getCollege: () => api.get("/admin/settings/college").then((r) => r.data),
  updateCollege: (data: any) => api.patch("/admin/settings/college", data).then((r) => r.data),
  getNaac: () => api.get("/admin/settings/naac").then((r) => r.data),
}

// ─── Phase 4: Import ──────────────────────────────────────────────────────────

export const importApi = {
  importStudents: (formData: FormData) =>
    api.post("/admin/import/students", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  importFaculty: (formData: FormData) =>
    api.post("/admin/import/faculty", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
}
