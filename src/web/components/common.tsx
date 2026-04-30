import { type ReactNode, useMemo, useState } from "react";
import type { CustomerSearchResult } from "../../bank/service";
import type { DashboardData, RiskLevel } from "../../bank/types";
import { formatUsd } from "../lib/format";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, { badge: string; notice: string; icon: string; shell: string }> = {
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    notice: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "text-emerald-600",
    shell: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    notice: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-600",
    shell: "border-amber-200 bg-amber-50 text-amber-800"
  },
  danger: {
    badge: "border-red-200 bg-red-50 text-red-700",
    notice: "border-red-200 bg-red-50 text-red-700",
    icon: "text-red-600",
    shell: "border-red-200 bg-red-50 text-red-700"
  },
  info: {
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    notice: "border-sky-200 bg-sky-50 text-sky-800",
    icon: "text-sky-600",
    shell: "border-sky-200 bg-sky-50 text-sky-800"
  },
  neutral: {
    badge: "border-gray-200 bg-gray-50 text-gray-700",
    notice: "border-gray-200 bg-gray-50 text-gray-700",
    icon: "text-gray-500",
    shell: "border-gray-200 bg-white text-gray-600"
  }
};

export function toneClass(tone: Tone, surface: keyof (typeof toneClasses)[Tone]) {
  return toneClasses[tone][surface];
}

export function statusTone(value: string): Tone {
  const normalized = value.toLowerCase().replaceAll(" ", "_");

  if (["approved", "active", "posted", "success", "succeeded", "ready", "seeded", "standard_review", "pass"].includes(normalized)) {
    return "success";
  }

  if (["pending", "pending_approval", "loading", "review", "enhanced_review", "needs_attention", "manual_review"].includes(normalized)) {
    return "warning";
  }

  if (["error", "failed", "fail", "rejected", "blocked", "expired", "inactive", "insufficient"].includes(normalized)) {
    return "danger";
  }

  if (["image_parsed", "manual_text", "manual_upload", "telegram_openclaw", "manual_web"].includes(normalized)) {
    return "info";
  }

  return "neutral";
}

export function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function Badge({ className = "", tone, value }: { className?: string; tone: Tone; value: string }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${toneClass(tone, "badge")} ${className}`}>
      {value}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={statusTone(value)} value={formatStatusLabel(value)} />;
}

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

export function CustomerTypeahead({
  customers,
  label,
  onChange,
  onSelect,
  placeholder = "Search by client name",
  value
}: {
  customers: CustomerSearchResult[];
  label: string;
  onChange: (value: string) => void;
  onSelect: (customer: CustomerSearchResult) => void;
  placeholder?: string;
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = useMemo(() => {
    const query = value.trim().toLowerCase();
    const filtered = query
      ? customers.filter((customer) =>
          `${customer.name} ${customer.legalName}`.toLowerCase().includes(query)
        )
      : customers;

    return filtered.slice(0, 8);
  }, [customers, value]);

  function selectCustomer(customer: CustomerSearchResult) {
    onSelect(customer);
    setIsOpen(false);
  }

  return (
    <label className="relative grid gap-1 text-sm font-medium text-gray-700">
      {label}
      <input
        autoComplete="off"
        className="min-h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        value={value}
      />
      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {options.length > 0 ? (
            options.map((customer) => (
              <button
                className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm hover:bg-violet-50"
                key={`${customer.id}-${customer.accountId}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCustomer(customer)}
                type="button"
              >
                <span>
                  <span className="block font-semibold text-gray-900">{customer.name}</span>
                  <span className="block text-xs text-gray-500 capitalize">
                    {customer.riskProfile} risk / {formatUsd(customer.balanceCents)}
                  </span>
                </span>
                <StatusBadge value={customer.status} />
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">No matching clients.</p>
          )}
        </div>
      ) : null}
    </label>
  );
}

export function Notice({ tone, text }: { tone: "success" | "error"; text: string }) {
  const displayTone: Tone = tone === "success" ? "success" : "danger";
  const className = `mb-4 rounded-lg border p-4 text-sm font-medium ${toneClass(displayTone, "notice")}`;

  return <div className={className}>{text}</div>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const tone = ({
    low: "success",
    medium: "warning",
    high: "danger"
  } satisfies Record<RiskLevel, Tone>)[risk];

  return <Badge className="uppercase" tone={tone} value={risk} />;
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

export function MiniTable({ columns, rows, emptyText = "No records." }: { columns: string[]; rows: ReactNode[][]; emptyText?: string }) {
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
          {rows.map((row, rowIndex) => (
            <tr className="border-b border-gray-100 last:border-0" key={row.map(String).join("|") || rowIndex}>
              {row.map((cell, cellIndex) => (
                <td className="px-3 py-3 text-sm text-gray-700" key={`${rowIndex}-${cellIndex}`}>
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
