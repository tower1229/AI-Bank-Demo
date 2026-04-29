import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { CustomerSearchResult, ProductDetail } from "../../bank/service";
import { BackLink, CustomerSearchTable, RiskBadge, SectionHeader, TextInput } from "../components/common";
import { useConfirm } from "../hooks/useConfirm";
import { postJson } from "../lib/api";
import { formatUsd, usdToCents } from "../lib/format";
import type { RunAction } from "../types";

export function InvestmentOrdersPage({
  customers,
  products
}: {
  customers: CustomerSearchResult[];
  products: ProductDetail[];
}) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="Product Shelf and Funding Accounts" detail="Review minimum subscription, risk level, and available cash accounts before booking an order." />
        <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" to="/investment-orders/new">
          <Plus className="h-4 w-4" />
          New order
        </Link>
      </div>
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
  );
}

export function InvestmentOrderEntryPage({
  products,
  runAction
}: {
  products: ProductDetail[];
  runAction: RunAction;
}) {
  const navigate = useNavigate();
  const confirm = useConfirm();
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
    const isConfirmed = await confirm({
      title: "Confirm Investment Order",
      description: `Purchase ${formatUsd(amount)} of ${productName} from ${form.accountNumber}?`,
      confirmText: "Book Order"
    });

    if (!isConfirmed) return;

    const succeeded = await runAction(async () => {
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

    if (succeeded) navigate("/investment-orders");
  }

  return (
    <article className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <BackLink to="/investment-orders" label="Back to investment orders" />
      <SectionHeader title="Investment Order Entry" detail="Create a product subscription using the shared bank service." />
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <TextInput label="Funding account number" value={form.accountNumber} onChange={(accountNumber) => setForm({ ...form, accountNumber })} />
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
