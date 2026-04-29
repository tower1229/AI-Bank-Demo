import type { LucideIcon } from "lucide-react";
import type { AuditLogEntry, CustomerSearchResult, OnboardingApplication, ProductDetail } from "../bank/service";
import type { DashboardData, HealthData, SeedStatusData } from "../bank/types";

export type LoadState = "loading" | "ready" | "error";
export type RunAction = (action: () => Promise<string>) => Promise<boolean>;

export interface AppData {
  health: HealthData | null;
  seed: SeedStatusData | null;
  dashboard: DashboardData | null;
  applications: OnboardingApplication[];
  customers: CustomerSearchResult[];
  products: ProductDetail[];
  auditLogs: AuditLogEntry[];
}

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}
