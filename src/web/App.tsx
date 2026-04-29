import { useEffect, useMemo, useState } from "react";
import type { ApiResponse, DashboardData, HealthData, SeedStatusData } from "../bank/types";

type LoadState = "loading" | "ready" | "error";

interface AppData {
  health: HealthData | null;
  seed: SeedStatusData | null;
  dashboard: DashboardData | null;
}

const navigation = ["Dashboard", "Onboarding", "Customers", "Transfers", "Products", "Audit"];

export default function App() {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<AppData>({
    health: null,
    seed: null,
    dashboard: null
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [health, seed, dashboard] = await Promise.all([
          fetchJson<HealthData>("/api/health"),
          fetchJson<SeedStatusData>("/api/seed/status"),
          fetchJson<DashboardData>("/api/dashboard")
        ]);

        if (!cancelled) {
          setData({ health, seed, dashboard });
          setState("ready");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
          setState("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 lg:flex">
      <aside className="bg-[#111111] text-gray-400 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64">
        <div className="flex min-h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#FF5A00] text-sm font-black text-white">
            AB
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Bank Demo</p>
            <p className="text-xs text-gray-500">Private banking console</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:space-y-1 lg:overflow-visible">
          {navigation.map((item, index) => (
            <button
              className={`min-h-10 shrink-0 rounded-md px-3 text-left text-sm font-medium transition lg:w-full ${
                index === 0
                  ? "border-l-4 border-[#FF5A00] bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-gray-500">
                Relationship manager workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={statusClass(state)}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {statusLabel}
              </span>
              <span className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm">
                {data.health?.checkedAt ? formatTime(data.health.checkedAt) : "Waiting for API"}
              </span>
            </div>
          </header>

          {state === "error" ? (
            <section className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-5">
              <h2 className="text-base font-semibold text-gray-900">Dashboard could not load</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{error}</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Run local D1 migrations and seed data, then restart the Worker.
              </p>
            </section>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Bank metrics">
            {(data.dashboard?.metrics ?? placeholderMetrics).map((metric) => (
              <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm" key={metric.label}>
                <span className="text-xs font-semibold uppercase tracking-normal text-gray-500">{metric.label}</span>
                <strong className="mt-4 block text-3xl font-bold text-gray-900">{metric.value}</strong>
                <p className="mt-3 text-sm leading-5 text-gray-500">{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:row-span-2">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Client Book</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Seed clients used for transfer and product-purchase demos.
                  </p>
                </div>
                <span className="inline-flex min-h-7 items-center rounded-md bg-gray-100 px-2.5 text-xs font-semibold text-gray-700">
                  USD only
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[620px] w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-normal text-gray-500">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500">
                        Risk
                      </th>
                      <th className="py-3 pl-4 text-right text-xs font-medium uppercase tracking-normal text-gray-500">
                        Cash balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.dashboard?.customers ?? []).map((customer) => (
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={customer.id}>
                        <td className="py-4 pr-4 text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{customer.accountNumber}</td>
                        <td className="px-4 py-4">
                          <RiskBadge risk={customer.riskProfile} />
                        </td>
                        <td className="py-4 pl-4 text-right text-sm font-semibold text-gray-900">
                          {formatUsd(customer.balanceCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Investment Products</h2>
              <p className="mt-1 text-sm text-gray-500">
                Available to future manual and MCP purchase flows.
              </p>
              <div className="mt-5 space-y-3">
                {(data.dashboard?.products ?? []).map((product) => (
                  <div
                    className="rounded-lg border border-gray-200 bg-white p-4 transition hover:bg-gray-50"
                    key={product.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="text-sm font-semibold text-gray-900">{product.name}</strong>
                        <p className="mt-1 text-sm leading-5 text-gray-500">{product.expectedYieldLabel}</p>
                      </div>
                      <RiskBadge risk={product.riskLevel} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-600">
                      Minimum {formatUsd(product.minimumSubscriptionCents)}
                      {product.lockupMonths > 0 ? ` · ${product.lockupMonths} month lockup` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="mt-1 text-sm text-gray-500">
                Audit events from seed data and future operations.
              </p>
              <div className="mt-5 space-y-3">
                {(data.dashboard?.recentActivity ?? []).map((activity) => (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4" key={activity.id}>
                    <div className="flex items-start justify-between gap-3">
                      <strong className="text-sm font-semibold capitalize text-gray-900">
                        {activity.action.replaceAll("_", " ")}
                      </strong>
                      <time className="shrink-0 text-xs text-gray-500">{formatTime(activity.createdAt)}</time>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-gray-500">{activity.resultMessage}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Phase 1 Boundary</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-500">
              This console currently verifies the Cloudflare Worker, D1 schema, seed data, and
              read-only dashboard. Manual onboarding, transfer, product purchase, and MCP tools are
              intentionally reserved for the next implementation phase.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Telegram stays in OpenClaw", "MCP route is a 501 placeholder", "Shared service layer starts in src/bank"].map(
                (item) => (
                  <span
                    className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600"
                    key={item}
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const placeholderMetrics = [
  { label: "Active Clients", value: "-", detail: "Waiting for D1 data" },
  { label: "Cash Balance", value: "-", detail: "Waiting for D1 data" },
  { label: "Product Holdings", value: "-", detail: "Waiting for D1 data" },
  { label: "Pending Applications", value: "-", detail: "Waiting for D1 data" }
];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.displayMessage ?? `Request failed: ${url}`);
  }

  return payload.data;
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const className = {
    low: "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-700"
  }[risk];

  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase ${className}`}>
      {risk}
    </span>
  );
}

function statusClass(state: LoadState): string {
  if (state === "ready") {
    return "inline-flex min-h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800";
  }

  if (state === "error") {
    return "inline-flex min-h-9 items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700";
  }

  return "inline-flex min-h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600";
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
