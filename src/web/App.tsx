import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { AuditLogEntry, CustomerSearchResult, OnboardingApplication, ProductDetail } from "../bank/service";
import type { DashboardData, HealthData, SeedStatusData } from "../bank/types";
import { AppShell } from "./components/AppShell";
import { fetchJson } from "./lib/api";
import { getActiveNavigationItem, getPageTitle } from "./navigation";
import { AuditPage } from "./pages/AuditPage";
import { ClientBookPage } from "./pages/ClientBookPage";
import { ClientLifecyclePage, NewClientApplicationPage } from "./pages/ClientLifecyclePage";
import { DashboardPage } from "./pages/DashboardPage";
import { InvestmentOrderEntryPage, InvestmentOrdersPage } from "./pages/InvestmentOrdersPage";
import { PaymentInstructionPage, PaymentsPage } from "./pages/PaymentsPage";
import type { AppData, LoadState } from "./types";

const emptyData: AppData = {
  health: null,
  seed: null,
  dashboard: null,
  applications: [],
  customers: [],
  products: [],
  auditLogs: []
};

export default function App() {
  const location = useLocation();
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<AppData>(emptyData);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeItem = getActiveNavigationItem(location.pathname);
  const pageTitle = getPageTitle(location.pathname, activeItem.name);

  async function refresh() {
    try {
      const [health, seed, dashboard, applications, customers, products, auditLogs] = await Promise.all([
        fetchJson<HealthData>("/api/health"),
        fetchJson<SeedStatusData>("/api/seed/status"),
        fetchJson<DashboardData>("/api/dashboard"),
        fetchJson<OnboardingApplication[]>("/api/onboarding/applications"),
        fetchJson<CustomerSearchResult[]>("/api/customers"),
        fetchJson<ProductDetail[]>("/api/products"),
        fetchJson<AuditLogEntry[]>("/api/audit-logs")
      ]);

      setData({ health, seed, dashboard, applications, customers, products, auditLogs });
      setState("ready");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load console data.");
      setState("error");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const statusLabel = useMemo(() => {
    if (state === "loading") {
      return "Loading";
    }

    if (state === "error") {
      return "Needs attention";
    }

    return data.seed?.seeded ? "Seeded" : "Seed missing";
  }, [data.seed?.seeded, state]);

  async function runAction(action: () => Promise<string>): Promise<boolean> {
    try {
      setMessage(await action());
      setError(null);
      await refresh();
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
      setMessage(null);
      return false;
    }
  }

  return (
    <AppShell
      activeItem={activeItem}
      currentPath={location.pathname}
      error={error}
      healthCheckedAt={data.health?.checkedAt ?? null}
      message={message}
      pageTitle={pageTitle}
      state={state}
      statusLabel={statusLabel}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage data={data} />} />
        <Route path="/client-lifecycle" element={<ClientLifecyclePage applications={data.applications} runAction={runAction} />} />
        <Route path="/client-lifecycle/new" element={<NewClientApplicationPage runAction={runAction} />} />
        <Route path="/client-book" element={<ClientBookPage initialCustomers={data.customers} />} />
        <Route path="/payments" element={<PaymentsPage customers={data.customers} />} />
        <Route path="/payments/new" element={<PaymentInstructionPage runAction={runAction} />} />
        <Route path="/investment-orders" element={<InvestmentOrdersPage customers={data.customers} products={data.products} />} />
        <Route path="/investment-orders/new" element={<InvestmentOrderEntryPage products={data.products} runAction={runAction} />} />
        <Route path="/audit-log" element={<AuditPage auditLogs={data.auditLogs} />} />
        <Route path="/onboarding" element={<Navigate to="/client-lifecycle" replace />} />
        <Route path="/customers" element={<Navigate to="/client-book" replace />} />
        <Route path="/transfers" element={<Navigate to="/payments" replace />} />
        <Route path="/products" element={<Navigate to="/investment-orders" replace />} />
        <Route path="/audit" element={<Navigate to="/audit-log" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
