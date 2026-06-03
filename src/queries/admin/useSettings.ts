import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"

export interface CollegeSettings {
  id?: number
  name?: string
  code?: string
  settings: {
    risk_score_threshold?: number
    attendance_threshold?: number
    pass_mark_threshold?: number
    [key: string]: any
  }
}

export const adminSettingsKeys = {
  all: ["adminSettings"] as const,
  college: () => [...adminSettingsKeys.all, "college"] as const,
}

export function useCollegeSettings() {
  return useQuery<CollegeSettings>({
    queryKey: adminSettingsKeys.college(),
    queryFn: async () => {
      const res = await api.get("/admin/settings/college")
      return res.data
    },
  })
}

export function useUpdateCollegeSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CollegeSettings>) => {
      const res = await api.patch("/admin/settings/college", data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.college() })
    },
  })
}
