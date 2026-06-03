import { api } from "./api";

export interface PrincipalDashboardMetrics {
  academic_health: number;
  attendance: number;
  pass_rate: number;
  placement_rate: number;
  risk_students: number;
  faculty_count: number;
}

export interface ExecutiveSummary {
  summary: string;
}

export interface DepartmentMetric {
  department: string;
  health_score: number;
  attendance: number;
  pass_rate: number;
  risk_students: number;
}

export interface RiskStudent {
  id: number;
  name: string;
  department: string;
  risk_score: number;
  risk_level: 'high' | 'medium' | 'low' | 'critical';
  dropout_probability: number;
  arrear_probability: number;
}

export interface RiskSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AccreditationMetric {
  nba_readiness: number;
  naac_readiness: number;
  documentation: number;
}

export interface AIRecommendation {
  recommendations: string[];
}

export const principalApi = {
  getDashboard: () => api.get<PrincipalDashboardMetrics>("/principal/dashboard"),
  getExecutiveSummary: () => api.get<ExecutiveSummary>("/principal/executive-summary"),
  getDepartments: () => api.get<DepartmentMetric[]>("/principal/departments"),
  getRiskStudents: () => api.get<RiskStudent[]>("/principal/risk-students"),
  getRiskSummary: () => api.get<RiskSummary>("/principal/risk-summary"),
  getAccreditation: () => api.get<AccreditationMetric>("/principal/accreditation"),
  getRecommendations: () => api.post<AIRecommendation>("/principal/recommendations"),
  postAiQuery: (query: string) => api.post<{ response: string }>("/principal/ai-query", { query }),
};
