import type {
  ActivitySummary,
  CustomerSummary,
  DashboardData,
  HealthData,
  ProductSummary,
  SeedStatusData
} from "./types";

type CountRow = { count: number };
type SumRow = { total: number | null };

async function countRows(db: D1Database, table: string, where = "1 = 1"): Promise<number> {
  const row = await db.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${where}`).first<CountRow>();
  return row?.count ?? 0;
}

async function sumCents(db: D1Database, table: string, column: string, where = "1 = 1"): Promise<number> {
  const row = await db.prepare(`SELECT SUM(${column}) AS total FROM ${table} WHERE ${where}`).first<SumRow>();
  return row?.total ?? 0;
}

export async function getHealth(db: D1Database): Promise<HealthData> {
  await db.prepare("SELECT 1").first();

  return {
    service: "ai-bank-demo",
    workerOk: true,
    d1Ok: true,
    checkedAt: new Date().toISOString()
  };
}

export async function getSeedStatus(db: D1Database): Promise<SeedStatusData> {
  const [
    customers,
    accounts,
    products,
    holdings,
    transactions,
    auditLogs,
    pendingOnboardingApplications
  ] = await Promise.all([
    countRows(db, "customers", "id LIKE 'seed-%'"),
    countRows(db, "accounts", "id LIKE 'seed-%'"),
    countRows(db, "products", "id LIKE 'seed-%'"),
    countRows(db, "holdings", "id LIKE 'seed-%'"),
    countRows(db, "transactions", "id LIKE 'seed-%'"),
    countRows(db, "audit_logs", "id LIKE 'seed-%'"),
    countRows(db, "onboarding_applications", "status = 'pending_approval'")
  ]);

  return {
    seeded: customers >= 3 && accounts >= 3 && products >= 3,
    counts: {
      customers,
      accounts,
      products,
      holdings,
      transactions,
      auditLogs,
      pendingOnboardingApplications
    }
  };
}

export async function getDashboard(db: D1Database): Promise<DashboardData> {
  const [
    customerCount,
    totalBalanceCents,
    totalHoldingsCents,
    pendingOnboardingApplications,
    recentActivityResult,
    customerResult,
    productResult
  ] = await Promise.all([
    countRows(db, "customers", "status = 'active'"),
    sumCents(db, "accounts", "balance_cents", "status = 'active'"),
    sumCents(db, "holdings", "market_value_cents"),
    countRows(db, "onboarding_applications", "status = 'pending_approval'"),
    db
      .prepare(
        `SELECT
          id,
          action,
          source,
          status,
          result_message AS resultMessage,
          created_at AS createdAt
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 8`
      )
      .all<ActivitySummary>(),
    db
      .prepare(
        `SELECT
          c.id,
          c.display_name AS name,
          c.risk_profile AS riskProfile,
          a.account_number AS accountNumber,
          a.currency,
          a.balance_cents AS balanceCents
        FROM customers c
        JOIN accounts a ON a.customer_id = c.id
        WHERE c.status = 'active'
        ORDER BY c.display_name ASC`
      )
      .all<CustomerSummary>(),
    db
      .prepare(
        `SELECT
          id,
          name,
          risk_level AS riskLevel,
          minimum_subscription_cents AS minimumSubscriptionCents,
          lockup_months AS lockupMonths,
          expected_yield_label AS expectedYieldLabel
        FROM products
        WHERE status = 'active'
        ORDER BY minimum_subscription_cents ASC`
      )
      .all<ProductSummary>()
  ]);

  return {
    metrics: [
      {
        label: "Active Clients",
        value: String(customerCount),
        detail: "Seed relationship-manager client book"
      },
      {
        label: "Cash Balance",
        value: formatUsd(totalBalanceCents),
        detail: "Across active USD private banking accounts"
      },
      {
        label: "Product Holdings",
        value: formatUsd(totalHoldingsCents),
        detail: "Current demo market value"
      },
      {
        label: "Pending Applications",
        value: String(pendingOnboardingApplications),
        detail: "Awaiting web-console approval"
      }
    ],
    customers: customerResult.results ?? [],
    products: productResult.results ?? [],
    recentActivity: recentActivityResult.results ?? []
  };
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}
