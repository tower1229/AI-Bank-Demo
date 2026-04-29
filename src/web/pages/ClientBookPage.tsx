import { FormEvent, useEffect, useState } from "react";
import type { CustomerPortfolio, CustomerSearchResult } from "../../bank/service";
import { MiniTable, RiskBadge, SectionHeader } from "../components/common";
import { fetchJson } from "../lib/api";
import { formatTime, formatUsd } from "../lib/format";

export function ClientBookPage({ initialCustomers }: { initialCustomers: CustomerSearchResult[] }) {
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
        <SectionHeader title="Client Book Search" detail="Search by client name or private banking account number." />
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
        <SectionHeader title="Client 360 Portfolio" detail="Accounts, holdings, and recent account activity." />
        {portfolio ? (
          <div className="mt-5 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{portfolio.customer.name}</h3>
              <p className="mt-1 text-sm text-gray-500">Risk profile: {portfolio.customer.riskProfile}</p>
            </div>
            <MiniTable
              columns={["Account", "Status", "Balance"]}
              rows={portfolio.accounts.map((account) => [account.accountNumber, account.status, formatUsd(account.balanceCents)])}
            />
            <MiniTable
              columns={["Holding", "Risk", "Value"]}
              rows={portfolio.holdings.map((holding) => [holding.productName, holding.riskLevel, formatUsd(holding.marketValueCents)])}
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
