"use client"
import { create } from "zustand"

interface FiltersStore {
  selectedDepartmentId: number | null
  selectedSemester: number | null
  selectedBatch: string | null
  riskLevel: "all" | "critical" | "high" | "medium"
  dateRange: { from: string | null; to: string | null }
  setDepartment: (id: number | null) => void
  setSemester: (s: number | null) => void
  setBatch: (b: string | null) => void
  setRiskLevel: (r: "all" | "critical" | "high" | "medium") => void
  setDateRange: (from: string | null, to: string | null) => void
  resetFilters: () => void
}

const defaults = {
  selectedDepartmentId: null,
  selectedSemester: null,
  selectedBatch: null,
  riskLevel: "all" as const,
  dateRange: { from: null, to: null },
}

export const useFiltersStore = create<FiltersStore>()((set) => ({
  ...defaults,
  setDepartment: (id) => set({ selectedDepartmentId: id }),
  setSemester: (s) => set({ selectedSemester: s }),
  setBatch: (b) => set({ selectedBatch: b }),
  setRiskLevel: (r) => set({ riskLevel: r }),
  setDateRange: (from, to) => set({ dateRange: { from, to } }),
  resetFilters: () => set(defaults),
}))
