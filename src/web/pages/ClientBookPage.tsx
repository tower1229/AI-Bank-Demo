import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CustomerPortfolio, CustomerSearchResult } from "../../bank/service";
import { CustomerTypeahead, MiniTable, Notice, RiskBadge, SectionHeader, StatusBadge } from "../components/common";
import { fetchJson } from "../lib/api";
import { formatTime, formatUsd } from "../lib/format";

export function ClientBookPage({ initialCustomers }: { initialCustomers: CustomerSearchResult[] }) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
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

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Client Book Search" detail="Search by client name and select from matching clients." />
      <form className="mt-5 flex gap-3" onSubmit={search}>
        <div className="flex-1">
          <CustomerTypeahead
            customers={initialCustomers}
            label="Client name"
            onChange={setQuery}
            onSelect={(customer) => {
              setQuery(customer.name);
              setCustomers([customer]);
            }}
            placeholder="Zhang San"
            value={query}
        />
        </div>
        <button className="min-h-10 self-end rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
          Search
        </button>
      </form>
      {error ? <Notice tone="error" text={error} /> : null}
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left w-8">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
              </th>
              {["Client", "Account", "Risk", "Cash balance", ""].map((heading) => (
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={`${customer.id}-${customer.accountId}`}>
                <td className="px-4 py-4 text-left">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{customer.accountNumber}</td>
                <td className="px-4 py-4">
                  <RiskBadge risk={customer.riskProfile} />
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatUsd(customer.balanceCents)}</td>
                <td className="px-4 py-4 text-right">
                  <Link className="text-sm font-semibold text-violet-700 hover:text-violet-900" to={`/client-book/${customer.id}`}>
                    View 360
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function ClientPortfolioPage() {
  const { customerId } = useParams();
  const [portfolio, setPortfolio] = useState<CustomerPortfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      if (!customerId) {
        setError("Customer id is missing.");
        return;
      }

      try {
        const data = await fetchJson<CustomerPortfolio>(`/api/customers/${customerId}/portfolio`);

        if (!cancelled) {
          setPortfolio(data);
          setError(null);
        }
      } catch (portfolioError) {
        if (!cancelled) {
          setError(portfolioError instanceof Error ? portfolioError.message : "Portfolio failed to load.");
        }
      }
    }

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Client 360 Portfolio" detail="Accounts, holdings, and recent account activity." />
      {error ? <Notice tone="error" text={error} /> : null}
      {portfolio ? (
        <div className="mt-5 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{portfolio.customer.name}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              Risk profile: <RiskBadge risk={portfolio.customer.riskProfile} />
            </div>
          </div>
          <MiniTable
            columns={["Account", "Status", "Balance"]}
            rows={portfolio.accounts.map((account) => [account.accountNumber, <StatusBadge value={account.status} />, formatUsd(account.balanceCents)])}
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
      ) : error ? null : (
        <p className="mt-5 text-sm text-gray-500">Loading client portfolio...</p>
      )}
    </article>
  );
}
