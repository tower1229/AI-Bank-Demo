import type { AppData } from "../types";
import { CustomerTable, RiskBadge, SectionHeader } from "../components/common";
import { formatTime, formatUsd } from "../lib/format";

const placeholderMetrics = [
  { label: "Active Clients", value: "-", detail: "Waiting for D1 data" },
  { label: "Cash Balance", value: "-", detail: "Waiting for D1 data" },
  { label: "Product Holdings", value: "-", detail: "Waiting for D1 data" },
  { label: "Pending Applications", value: "-", detail: "Waiting for D1 data" }
];

export function DashboardPage({ data }: { data: AppData }) {
  return (
    <>
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
          <SectionHeader title="Relationship Manager Client Book" detail="Active private banking relationships and cash accounts." />
          <CustomerTable customers={data.dashboard?.customers ?? []} />
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Product Shelf" detail="Approved investment products available for client orders." />
          <div className="mt-5 space-y-3">
            {(data.dashboard?.products ?? []).map((product) => (
              <div className="rounded-lg border border-gray-200 bg-white p-4 transition hover:bg-gray-50" key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-sm font-semibold text-gray-900">{product.name}</strong>
                    <p className="mt-1 text-sm leading-5 text-gray-500">{product.expectedYieldLabel}</p>
                  </div>
                  <RiskBadge risk={product.riskLevel} />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600">
                  Minimum {formatUsd(product.minimumSubscriptionCents)}
                  {product.lockupMonths > 0 ? ` / ${product.lockupMonths} month lockup` : ""}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Recent Operational Activity" detail="Latest audit trail entries across manual and AI-assisted channels." />
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
    </>
  );
}
