import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ApiResponse, DashboardData, HealthData, RiskLevel, SeedStatusData } from "../bank/types";
import type {
  AuditLogEntry,
  CustomerPortfolio,
  CustomerSearchResult,
  OnboardingApplication,
  ProductDetail
} from "../bank/service";

type LoadState = "loading" | "ready" | "error";
type Tab = "Dashboard" | "Onboarding" | "Customers" | "Transfers" | "Products" | "Audit";

interface AppData {
  health: HealthData | null;
  seed: SeedStatusData | null;
  dashboard: DashboardData | null;
  applications: OnboardingApplication[];
  customers: CustomerSearchResult[];
  products: ProductDetail[];
  auditLogs: AuditLogEntry[];
}

const navigation: Tab[] = ["Dashboard", "Onboarding", "Customers", "Transfers", "Products", "Audit"];

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
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<AppData>(emptyData);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function runAction(action: () => Promise<string>) {
    try {
      setMessage(await action());
      setError(null);
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
      setMessage(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 lg:flex">
      <aside className="bg-[#111111] text-gray-400 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64">
        <div className="flex min-h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#FF5A00] text-sm font-black text-white">
            AB
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Core Bank System</p>
            <p className="text-xs text-gray-500">Private banking console</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:space-y-1 lg:overflow-visible">
          {navigation.map((item) => (
            <button
              className={`min-h-10 shrink-0 rounded-md px-3 text-left text-sm font-medium transition lg:w-full ${
                item === activeTab
                  ? "border-l-4 border-[#FF5A00] bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              key={item}
              onClick={() => setActiveTab(item)}
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
              <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{activeTab}</h1>
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

          {message ? <Notice tone="success" text={message} /> : null}
          {error ? <Notice tone="error" text={error} /> : null}

          {activeTab === "Dashboard" ? <DashboardView data={data} /> : null}
          {activeTab === "Onboarding" ? <OnboardingView applications={data.applications} runAction={runAction} /> : null}
          {activeTab === "Customers" ? <CustomersView initialCustomers={data.customers} /> : null}
          {activeTab === "Transfers" ? <TransfersView customers={data.customers} runAction={runAction} /> : null}
          {activeTab === "Products" ? (
            <ProductsView customers={data.customers} products={data.products} runAction={runAction} />
          ) : null}
          {activeTab === "Audit" ? <AuditView auditLogs={data.auditLogs} /> : null}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ data }: { data: AppData }) {
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
          <SectionHeader title="Client Book" detail="Seed clients used for transfer and product-purchase demos." />
          <CustomerTable customers={data.dashboard?.customers ?? []} />
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Investment Products" detail="Available to manual and MCP purchase flows." />
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
          <SectionHeader title="Recent Activity" detail="Audit events from seed data and live operations." />
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

function OnboardingView({
  applications,
  runAction
}: {
  applications: OnboardingApplication[];
  runAction: (action: () => Promise<string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    customerName: "Alice Wong",
    documentType: "passport",
    documentNumber: "DEMOA12345",
    dateOfBirth: "1984-05-18",
    documentExpiryDate: "2032-05-18",
    nationality: "Demo Republic",
    residentialAddress: "18 Marina View, Singapore",
    occupationTitle: "Family office director",
    initialDepositUsd: "800000",
    sourceOfFunds: "Investment income and company dividends",
    isPep: false
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = usdToCents(form.initialDepositUsd);
    if (!window.confirm(`Submit onboarding application for ${form.customerName} with ${formatUsd(amount)} initial deposit?`)) {
      return;
    }

    await runAction(async () => {
      const response = await postJson<OnboardingApplication>("/api/onboarding/applications", {
        confirmed: true,
        customerName: form.customerName,
        documentCaptureMethod: "manual_text",
        documentProvided: true,
        documentType: form.documentType,
        documentNumber: form.documentNumber,
        dateOfBirth: form.dateOfBirth,
        documentExpiryDate: form.documentExpiryDate,
        nationality: form.nationality,
        residentialAddress: form.residentialAddress,
        occupationTitle: form.occupationTitle,
        initialDepositCents: amount,
        currency: "USD",
        sourceOfFunds: form.sourceOfFunds,
        isPep: form.isPep
      });
      return response.displayMessage ?? "Onboarding application submitted.";
    });
  }

  async function approve(application: OnboardingApplication) {
    if (!window.confirm(`Approve onboarding application for ${application.customerName}?`)) {
      return;
    }

    await runAction(async () => {
      const response = await postJson<OnboardingApplication>(`/api/onboarding/applications/${application.id}/approve`, {
        confirmed: true
      });
      return response.displayMessage ?? "Application approved.";
    });
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Create Application" detail="Manual web submission uses the same service as MCP." />
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <TextInput label="Customer name" value={form.customerName} onChange={(customerName) => setForm({ ...form, customerName })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Document type" value={form.documentType} onChange={(documentType) => setForm({ ...form, documentType })} />
            <TextInput label="Document number" value={form.documentNumber} onChange={(documentNumber) => setForm({ ...form, documentNumber })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Date of birth" value={form.dateOfBirth} onChange={(dateOfBirth) => setForm({ ...form, dateOfBirth })} />
            <TextInput label="Document expiry" value={form.documentExpiryDate} onChange={(documentExpiryDate) => setForm({ ...form, documentExpiryDate })} />
          </div>
          <TextInput label="Nationality" value={form.nationality} onChange={(nationality) => setForm({ ...form, nationality })} />
          <TextInput label="Residential address" value={form.residentialAddress} onChange={(residentialAddress) => setForm({ ...form, residentialAddress })} />
          <TextInput label="Occupation/title" value={form.occupationTitle} onChange={(occupationTitle) => setForm({ ...form, occupationTitle })} />
          <TextInput label="Initial deposit USD" value={form.initialDepositUsd} onChange={(initialDepositUsd) => setForm({ ...form, initialDepositUsd })} />
          <TextInput label="Source of funds" value={form.sourceOfFunds} onChange={(sourceOfFunds) => setForm({ ...form, sourceOfFunds })} />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              checked={form.isPep}
              className="h-4 w-4 rounded border-gray-300"
              onChange={(event) => setForm({ ...form, isPep: event.target.checked })}
              type="checkbox"
            />
            PEP / enhanced review
          </label>
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Submit application
          </button>
        </form>
      </article>

      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Applications" detail="Pending applications can only be approved in this console." />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                {["Client", "Status", "Initial deposit", "Review", "Created", ""].map((heading) => (
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr className="border-b border-gray-100 last:border-0" key={application.id}>
                  <td className="px-3 py-4 text-sm font-medium text-gray-900">{application.customerName}</td>
                  <td className="px-3 py-4 text-sm text-gray-600">{application.status.replaceAll("_", " ")}</td>
                  <td className="px-3 py-4 text-sm font-semibold text-gray-900">{formatUsd(application.initialDepositCents)}</td>
                  <td className="px-3 py-4 text-sm text-gray-600">{application.initialReview.replaceAll("_", " ")}</td>
                  <td className="px-3 py-4 text-sm text-gray-500">{formatTime(application.createdAt)}</td>
                  <td className="px-3 py-4 text-right">
                    {application.status === "pending_approval" ? (
                      <button
                        className="min-h-9 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => approve(application)}
                        type="button"
                      >
                        Approve
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function CustomersView({ initialCustomers }: { initialCustomers: CustomerSearchResult[] }) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const [portfolio, setPortfolio] = useState<CustomerPortfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  async function search(event: FormEvent) {
    event.preventDefault();
    try {
      setCustomers(await fetchJson<CustomerSearchResult[]>(`/api/customers?query=${encodeURIComponent(query)}`));
      setError(null);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Search failed.");
    }
  }

  async function loadPortfolio(customerId: string) {
    try {
      setPortfolio(await fetchJson<CustomerPortfolio>(`/api/customers/${customerId}/portfolio`));
      setError(null);
    } catch (portfolioError) {
      setError(portfolioError instanceof Error ? portfolioError.message : "Portfolio failed to load.");
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Customer Search" detail="Search by customer name or account number." />
        <form className="mt-5 flex gap-3" onSubmit={search}>
          <input
            className="min-h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zhang San or PB-USD-1028"
            value={query}
          />
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Search
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 space-y-3">
          {customers.map((customer) => (
            <button
              className="block w-full rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
              key={`${customer.id}-${customer.accountId}`}
              onClick={() => loadPortfolio(customer.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-sm font-semibold text-gray-900">{customer.name}</strong>
                  <p className="mt-1 text-sm text-gray-500">{customer.accountNumber}</p>
                </div>
                <RiskBadge risk={customer.riskProfile} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{formatUsd(customer.balanceCents)}</p>
            </button>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Portfolio" detail="Accounts, holdings, and recent transactions." />
        {portfolio ? (
          <div className="mt-5 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{portfolio.customer.name}</h3>
              <p className="mt-1 text-sm text-gray-500">Risk profile: {portfolio.customer.riskProfile}</p>
            </div>
            <MiniTable
              columns={["Account", "Status", "Balance"]}
              rows={portfolio.accounts.map((account) => [
                account.accountNumber,
                account.status,
                formatUsd(account.balanceCents)
              ])}
            />
            <MiniTable
              columns={["Holding", "Risk", "Value"]}
              rows={portfolio.holdings.map((holding) => [
                holding.productName,
                holding.riskLevel,
                formatUsd(holding.marketValueCents)
              ])}
              emptyText="No holdings yet."
            />
            <MiniTable
              columns={["Transaction", "Amount", "Date"]}
              rows={portfolio.recentTransactions.map((transaction) => [
                transaction.transactionType.replaceAll("_", " "),
                formatUsd(transaction.amountCents),
                formatTime(transaction.createdAt)
              ])}
            />
          </div>
        ) : (
          <p className="mt-5 text-sm text-gray-500">Select a customer to load portfolio details.</p>
        )}
      </article>
    </section>
  );
}

function TransfersView({
  customers,
  runAction
}: {
  customers: CustomerSearchResult[];
  runAction: (action: () => Promise<string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fromAccountNumber: "PB-USD-1028",
    toAccountNumber: "PB-USD-4186",
    amountUsd: "100000",
    memo: "Family office fees"
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = usdToCents(form.amountUsd);
    if (!window.confirm(`Execute transfer of ${formatUsd(amount)} from ${form.fromAccountNumber} to ${form.toAccountNumber}?`)) {
      return;
    }

    await runAction(async () => {
      const response = await postJson<{ displayMessage: string }>("/api/transfers", {
        confirmed: true,
        fromAccountNumber: form.fromAccountNumber,
        toAccountNumber: form.toAccountNumber,
        amountCents: amount,
        currency: "USD",
        memo: form.memo
      });
      return response.displayMessage ?? "Transfer completed.";
    });
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="New Transfer" detail="Internal USD account-to-account only." />
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <TextInput label="From account number" value={form.fromAccountNumber} onChange={(fromAccountNumber) => setForm({ ...form, fromAccountNumber })} />
          <TextInput label="To account number" value={form.toAccountNumber} onChange={(toAccountNumber) => setForm({ ...form, toAccountNumber })} />
          <TextInput label="Amount USD" value={form.amountUsd} onChange={(amountUsd) => setForm({ ...form, amountUsd })} />
          <TextInput label="Memo" value={form.memo} onChange={(memo) => setForm({ ...form, memo })} />
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Execute transfer
          </button>
        </form>
      </article>
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Available Accounts" detail="Use these account numbers for manual transfers." />
        <div className="mt-5">
          <CustomerSearchTable customers={customers} />
        </div>
      </article>
    </section>
  );
}

function ProductsView({
  customers,
  products,
  runAction
}: {
  customers: CustomerSearchResult[];
  products: ProductDetail[];
  runAction: (action: () => Promise<string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    accountNumber: "PB-USD-1028",
    productId: "seed-product-balanced",
    amountUsd: "250000",
    riskMismatchAcknowledged: false
  });

  const selectedProduct = products.find((product) => product.id === form.productId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = usdToCents(form.amountUsd);
    const productName = selectedProduct?.name ?? form.productId;
    if (!window.confirm(`Purchase ${formatUsd(amount)} of ${productName} from ${form.accountNumber}?`)) {
      return;
    }

    await runAction(async () => {
      const response = await postJson<{ displayMessage: string }>("/api/product-purchases", {
        confirmed: true,
        accountNumber: form.accountNumber,
        productId: form.productId,
        amountCents: amount,
        currency: "USD",
        riskMismatchAcknowledged: form.riskMismatchAcknowledged
      });
      return response.displayMessage ?? "Product purchase completed.";
    });
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Purchase Product" detail="Manual purchase uses the shared bank service." />
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <TextInput label="Funding account number" value={form.accountNumber} onChange={(accountNumber) => setForm({ ...form, accountNumber })} />
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Product
            <select
              className="min-h-10 rounded-md border border-gray-300 px-3 text-sm"
              onChange={(event) => setForm({ ...form, productId: event.target.value })}
              value={form.productId}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <TextInput label="Amount USD" value={form.amountUsd} onChange={(amountUsd) => setForm({ ...form, amountUsd })} />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              checked={form.riskMismatchAcknowledged}
              className="h-4 w-4 rounded border-gray-300"
              onChange={(event) => setForm({ ...form, riskMismatchAcknowledged: event.target.checked })}
              type="checkbox"
            />
            Risk mismatch acknowledged
          </label>
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Purchase product
          </button>
        </form>
      </article>
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Products and Accounts" detail="Review minimums, risk levels, and funding accounts." />
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            {products.map((product) => (
              <div className="rounded-lg border border-gray-200 p-4" key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <strong className="text-sm font-semibold text-gray-900">{product.name}</strong>
                  <RiskBadge risk={product.riskLevel} />
                </div>
                <p className="mt-2 text-sm text-gray-500">Minimum {formatUsd(product.minimumSubscriptionCents)}</p>
              </div>
            ))}
          </div>
          <CustomerSearchTable customers={customers} />
        </div>
      </article>
    </section>
  );
}

function AuditView({ auditLogs }: { auditLogs: AuditLogEntry[] }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Audit Log" detail="Manual web and Telegram/OpenClaw operations appear together." />
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[880px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {["Action", "Source", "Operator", "Entity", "Result", "Time"].map((heading) => (
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr className="border-b border-gray-100 last:border-0" key={log.id}>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">{log.action.replaceAll("_", " ")}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{log.source.replaceAll("_", " ")}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{log.operatorDisplayName ?? log.operatorId}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{log.entityType ?? "-"}</td>
                <td className="px-3 py-4 text-sm text-gray-500">{log.resultMessage}</td>
                <td className="px-3 py-4 text-sm text-gray-500">{formatTime(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
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

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.displayMessage ?? `Request failed: ${url}`);
  }

  return payload.data;
}

async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.displayMessage ?? `Request failed: ${url}`);
  }

  return payload;
}

function CustomerTable({ customers }: { customers: DashboardData["customers"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[620px] w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
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

function CustomerSearchTable({ customers }: { customers: CustomerSearchResult[] }) {
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

function MiniTable({ columns, rows, emptyText = "No records." }: { columns: string[]; rows: string[][]; emptyText?: string }) {
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

function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{detail}</p>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-gray-700">
      {label}
      <input
        className="min-h-10 rounded-md border border-gray-300 px-3 text-sm"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function Notice({ tone, text }: { tone: "success" | "error"; text: string }) {
  const className =
    tone === "success"
      ? "mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
      : "mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700";

  return <div className={className}>{text}</div>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
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

function usdToCents(value: string): number {
  const parsed = Number(value.replaceAll(",", ""));

  if (!Number.isFinite(parsed)) {
    throw new Error("Amount must be a valid USD number.");
  }

  return Math.round(parsed * 100);
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
