import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"

export const opKeys = {
  communications: ["operations", "communications"] as const,
  reviews: ["operations", "reviews"] as const,
}

// --- Communications ---

export function useCommunications() {
  return useQuery({
    queryKey: opKeys.communications,
    queryFn: () => api.get("/communications").then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useSendCommunication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { recipient_id: number; subject: string; message: string; message_type?: string; priority?: string }) =>
      api.post("/communications", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opKeys.communications })
    },
  })
}

// --- Reviews ---

export function useDepartmentReviews() {
  return useQuery({
    queryKey: opKeys.reviews,
    queryFn: () => api.get("/reviews").then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { department_id: number; period: string; focus_areas: string[]; notes?: string }) =>
      api.post("/reviews", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opKeys.reviews })
    },
  })
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/reviews/${id}/status`, null, { params: { status } }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opKeys.reviews })
    },
  })
}
