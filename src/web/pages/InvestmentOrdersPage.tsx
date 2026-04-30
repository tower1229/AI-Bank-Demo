import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { CustomerSearchResult, ProductDetail, ProductPortfolio } from "../../bank/service";
import { CustomerTypeahead, MiniTable, Notice, RiskBadge, SectionHeader, TextInput } from "../components/common";
import { useConfirm } from "../hooks/useConfirm";
import { fetchJson, postJson } from "../lib/api";
import { formatTime, formatUsd, usdToCents } from "../lib/format";
import type { RunAction } from "../types";

export function InvestmentOrdersPage({
  products
}: {
  products: ProductDetail[];
}) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="Product Shelf" detail="Select an approved product to start a subscription order." />
        <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" to="/investment-orders/new">
          <Plus className="h-4 w-4" />
          New custom order
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left w-8">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
              </th>
              {["Product", "Risk", "Minimum subscription", "Lockup", "Yield label", ""].map((heading) => (
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={product.id}>
                <td className="px-4 py-4 text-left">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                </td>
                <td className="px-4 py-4 text-sm font-medium">
                  <Link className="text-violet-700 hover:text-violet-900" to={`/investment-orders/${product.id}`}>
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <RiskBadge risk={product.riskLevel} />
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatUsd(product.minimumSubscriptionCents)}</td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {product.lockupMonths > 0 ? `${product.lockupMonths} months` : "None"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{product.expectedYieldLabel ?? "-"}</td>
                <td className="px-4 py-4 text-right">
                  <Link className="text-sm font-semibold text-violet-700 hover:text-violet-900" to={`/investment-orders/${product.id}`}>
                    View detail
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

export function InvestmentOrderEntryPage({
  customers,
  products,
  runAction
}: {
  customers: CustomerSearchResult[];
  products: ProductDetail[];
  runAction: RunAction;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirm = useConfirm();
  const [form, setForm] = useState({
    customerName: "Zhang San",
    productId: searchParams.get("productId") ?? "seed-product-balanced",
    amountUsd: "250000",
    riskMismatchAcknowledged: false
  });

  const selectedProduct = products.find((product) => product.id === form.productId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = usdToCents(form.amountUsd);
    const productName = selectedProduct?.name ?? form.productId;
    const isConfirmed = await confirm({
      title: "Confirm Investment Order",
      description: `Purchase ${formatUsd(amount)} of ${productName} for ${form.customerName}?`,
      confirmText: "Book Order"
    });

    if (!isConfirmed) return;

    const succeeded = await runAction(async () => {
      const response = await postJson<{ displayMessage: string }>("/api/product-purchases", {
        confirmed: true,
        customerName: form.customerName,
        productId: form.productId,
        amountCents: amount,
        currency: "USD",
        riskMismatchAcknowledged: form.riskMismatchAcknowledged
      });
      return response.displayMessage ?? "Product purchase completed.";
    });

    if (succeeded) navigate("/investment-orders");
  }

  return (
    <article className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Order Details" detail="Choose a funding account, product, and subscription amount." />
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <CustomerTypeahead
          customers={customers}
          label="Client"
          onChange={(customerName) => setForm({ ...form, customerName })}
          onSelect={(customer) => setForm({ ...form, customerName: customer.name })}
          value={form.customerName}
        />
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Product shelf item
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
        <TextInput label="Subscription amount USD" value={form.amountUsd} onChange={(amountUsd) => setForm({ ...form, amountUsd })} />
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            checked={form.riskMismatchAcknowledged}
            className="h-4 w-4 rounded border-gray-300"
            onChange={(event) => setForm({ ...form, riskMismatchAcknowledged: event.target.checked })}
            type="checkbox"
          />
          Suitability risk mismatch acknowledged
        </label>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Link className="inline-flex min-h-10 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50" to="/investment-orders">
            Cancel
          </Link>
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Book investment order
          </button>
        </div>
      </form>
    </article>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const [portfolio, setPortfolio] = useState<ProductPortfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      if (!productId) {
        setError("Product id is missing.");
        return;
      }

      try {
        const data = await fetchJson<ProductPortfolio>(`/api/products/${productId}`);

        if (!cancelled) {
          setPortfolio(data);
          setError(null);
        }
      } catch (portfolioError) {
        if (!cancelled) {
          setError(portfolioError instanceof Error ? portfolioError.message : "Product details failed to load.");
        }
      }
    }

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="Product Details" detail="Product information and recent transaction history." />
        {portfolio ? (
          <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" to={`/investment-orders/new?productId=${encodeURIComponent(portfolio.product.id)}`}>
            Book Order
          </Link>
        ) : null}
      </div>
      {error ? <Notice tone="error" text={error} /> : null}
      
      {portfolio ? (
        <div className="mt-5 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{portfolio.product.name}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Risk Level</p>
                <div className="mt-1">
                  <RiskBadge risk={portfolio.product.riskLevel} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Minimum Subscription</p>
                <p className="mt-1 font-medium text-gray-900">{formatUsd(portfolio.product.minimumSubscriptionCents)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lockup Period</p>
                <p className="mt-1 font-medium text-gray-900">
                  {portfolio.product.lockupMonths > 0 ? `${portfolio.product.lockupMonths} months` : "None"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected Yield</p>
                <p className="mt-1 font-medium text-gray-900">{portfolio.product.expectedYieldLabel ?? "-"}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <h4 className="mb-4 text-base font-semibold text-gray-900">Recent Transactions</h4>
            <MiniTable
              columns={["Client", "Source", "Amount", "Date"]}
              rows={portfolio.recentTransactions.map((transaction) => [
                transaction.targetName ?? "-",
                transaction.source === "telegram_openclaw" ? "tg" : transaction.source === "manual_web" ? "web" : transaction.source,
                formatUsd(transaction.amountCents),
                formatTime(transaction.createdAt)
              ])}
              emptyText="No recent transactions."
            />
          </div>
        </div>
      ) : error ? null : (
        <p className="mt-5 text-sm text-gray-500">Loading product details...</p>
      )}
    </article>
  );
}
