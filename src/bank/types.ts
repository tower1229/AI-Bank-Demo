export type Currency = "USD";
export type RiskLevel = "low" | "medium" | "high";

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  errorCode?: string;
  displayMessage?: string;
}

export interface HealthData {
  service: "ai-bank-demo";
  workerOk: boolean;
  d1Ok: boolean;
  checkedAt: string;
}

export interface SeedStatusData {
  seeded: boolean;
  counts: {
    customers: number;
    accounts: number;
    products: number;
    holdings: number;
    transactions: number;
    auditLogs: number;
    pendingOnboardingApplications: number;
  };
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  riskProfile: RiskLevel;
  accountNumber: string;
  currency: Currency;
  balanceCents: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  minimumSubscriptionCents: number;
  lockupMonths: number;
  expectedYieldLabel: string | null;
}

export interface ActivitySummary {
  id: string;
  action: string;
  source: string;
  status: string;
  resultMessage: string | null;
  createdAt: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  customers: CustomerSummary[];
  products: ProductSummary[];
  recentActivity: ActivitySummary[];
}
