export function usdToCents(value: string): number {
  const parsed = Number(value.replaceAll(",", ""));

  if (!Number.isFinite(parsed)) {
    throw new Error("Amount must be a valid USD number.");
  }

  return Math.round(parsed * 100);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
