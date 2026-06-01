import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"

export const syncKeys = {
  history: (page: number) => ["sync", "history", page] as const,
}

export function useSyncHistory(page = 1) {
  return useQuery({
    queryKey: syncKeys.history(page),
    queryFn: () => api.get("/data-sync/history", { params: { page } }).then((r) => r.data),
    staleTime: 30_000,
  })
}

export function useUploadStudents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, commit }: { formData: FormData; commit: boolean }) =>
      api.post(`/data-sync/upload/students?commit=${commit}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sync"] }),
  })
}

export function useUploadAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, commit }: { formData: FormData; commit: boolean }) =>
      api.post(`/data-sync/upload/attendance?commit=${commit}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sync"] }),
  })
}

export function useUploadMarks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, commit }: { formData: FormData; commit: boolean }) =>
      api.post(`/data-sync/upload/marks?commit=${commit}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sync"] }),
  })
}
