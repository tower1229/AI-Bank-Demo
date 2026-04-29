import type { CustomerSearchResult } from "../../bank/service";
import type { DashboardData, RiskLevel } from "../../bank/types";
import { formatUsd } from "../lib/format";

export function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{detail}</p>
    </div>
  );
}

export function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {label}
      <input
        className="min-h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

export function Notice({ tone, text }: { tone: "success" | "error"; text: string }) {
  const className =
    tone === "success"
      ? "mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
      : "mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700";

  return <div className={className}>{text}</div>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const className = {
    low: "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-700"
  }[risk];

  return (
    <span className={`inline-flex min-h-6 items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase ${className}`}>
      {risk}
    </span>
  );
}

export function CustomerTable({ customers }: { customers: DashboardData["customers"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[620px] w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left w-8">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
            </th>
            {["Client", "Account", "Risk", "Cash balance"].map((heading) => (
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={customer.id}>
              <td className="px-4 py-4 text-left">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
              </td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{customer.accountNumber}</td>
              <td className="px-4 py-4">
                <RiskBadge risk={customer.riskProfile} />
              </td>
              <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatUsd(customer.balanceCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerSearchTable({ customers }: { customers: CustomerSearchResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[420px] w-full border-collapse">
        <tbody>
          {customers.map((customer) => (
            <tr className="border-b border-gray-100 last:border-0" key={`${customer.id}-${customer.accountId}`}>
              <td className="py-3 pr-3 text-sm font-medium text-gray-900">{customer.name}</td>
              <td className="px-3 py-3 text-sm text-gray-600">{customer.accountNumber}</td>
              <td className="py-3 pl-3 text-right text-sm font-semibold text-gray-900">{formatUsd(customer.balanceCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MiniTable({ columns, rows, emptyText = "No records." }: { columns: string[]; rows: string[][]; emptyText?: string }) {
  if (rows.length === 0) {
    return <p className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((column) => (
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-gray-100 last:border-0" key={row.join("|")}>
              {row.map((cell) => (
                <td className="px-3 py-3 text-sm text-gray-700" key={cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
