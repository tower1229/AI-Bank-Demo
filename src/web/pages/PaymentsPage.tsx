import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { CustomerSearchResult, PaymentInstructionSummary } from "../../bank/service";
import { CustomerTypeahead, SectionHeader, StatusBadge, TextInput } from "../components/common";
import { useConfirm } from "../hooks/useConfirm";
import { postJson } from "../lib/api";
import { formatTime, formatUsd, usdToCents } from "../lib/format";
import type { RunAction } from "../types";

export function PaymentsPage({ paymentInstructions }: { paymentInstructions: PaymentInstructionSummary[] }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="Payment Instructions" detail="Review posted internal USD transfers and book new payment instructions." />
        <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" to="/payments/new">
          <Plus className="h-4 w-4" />
          New payment
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left w-8">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
              </th>
              {["Instruction", "From", "To", "Amount", "Status", "Channel", "Booked"].map((heading) => (
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paymentInstructions.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={8}>
                  No payment instructions yet.
                </td>
              </tr>
            ) : (
              paymentInstructions.map((payment) => (
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={payment.id}>
                  <td className="px-4 py-4 text-left">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{shortId(payment.id)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{payment.fromAccountNumber ?? "-"}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{payment.toAccountNumber ?? "-"}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatUsd(payment.amountCents)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge value={payment.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{payment.source.replaceAll("_", " ")}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatTime(payment.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function PaymentInstructionPage({ customers, runAction }: { customers: CustomerSearchResult[]; runAction: RunAction }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [form, setForm] = useState({
    fromCustomerName: "Zhang San",
    toCustomerName: "Li Si",
    amountUsd: "100000",
    memo: "Family office fees"
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = usdToCents(form.amountUsd);
    const isConfirmed = await confirm({
      title: "Confirm Payment Instruction",
      description: `Execute transfer of ${formatUsd(amount)} from ${form.fromCustomerName} to ${form.toCustomerName}?`,
      confirmText: "Execute Payment"
    });

    if (!isConfirmed) return;

    const succeeded = await runAction(async () => {
      const response = await postJson<{ displayMessage: string }>("/api/transfers", {
        confirmed: true,
        fromCustomerName: form.fromCustomerName,
        toCustomerName: form.toCustomerName,
        amountCents: amount,
        currency: "USD",
        memo: form.memo
      });
      return response.displayMessage ?? "Transfer completed.";
    });

    if (succeeded) navigate("/payments");
  }

  return (
    <article className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Transfer Details" detail="Book an internal USD account-to-account transfer." />
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <CustomerTypeahead
          customers={customers}
          label="From client"
          onChange={(fromCustomerName) => setForm({ ...form, fromCustomerName })}
          onSelect={(customer) => setForm({ ...form, fromCustomerName: customer.name })}
          value={form.fromCustomerName}
        />
        <CustomerTypeahead
          customers={customers}
          label="To client"
          onChange={(toCustomerName) => setForm({ ...form, toCustomerName })}
          onSelect={(customer) => setForm({ ...form, toCustomerName: customer.name })}
          value={form.toCustomerName}
        />
        <TextInput label="Amount USD" value={form.amountUsd} onChange={(amountUsd) => setForm({ ...form, amountUsd })} />
        <TextInput label="Memo" value={form.memo} onChange={(memo) => setForm({ ...form, memo })} />
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Link className="inline-flex min-h-10 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50" to="/payments">
            Cancel
          </Link>
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Execute payment
          </button>
        </div>
      </form>
    </article>
  );
}

function shortId(value: string): string {
  return value.length > 12 ? value.slice(0, 12) : value;
}
