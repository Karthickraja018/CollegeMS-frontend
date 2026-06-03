import { useQuery, useMutation } from '@tanstack/react-query'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Fetch history stub
export const useChatHistory = () => {
  return useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/chat/history`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      })
      if (!response.ok) return []
      const data = await response.json()
      return data.history || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch single session
export const useChatSession = (sessionKey: string | null) => {
  return useQuery({
    queryKey: ['chatSession', sessionKey],
    queryFn: async () => {
      if (!sessionKey) return []
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/chat/history/${sessionKey}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      })
      if (!response.ok) return []
      const data = await response.json()
      return data.messages || []
    },
    enabled: !!sessionKey,
    staleTime: 5 * 60 * 1000,
  })
}

// Generate Excel Export stub (Backend)
export const useExportExcel = () => {
  return useMutation({
    mutationFn: async ({ messageId, data }: { messageId: string, data: any }) => {
      // Send data to backend to get an Excel file
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/reports/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to generate Excel export')
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    }
  })
}
