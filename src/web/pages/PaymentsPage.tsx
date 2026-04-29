import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { PaymentInstructionSummary } from "../../bank/service";
import { SectionHeader, TextInput } from "../components/common";
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
                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium uppercase text-emerald-800">
                      {payment.status}
                    </span>
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

export function PaymentInstructionPage({ runAction }: { runAction: RunAction }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [form, setForm] = useState({
    fromAccountNumber: "PB-USD-1028",
    toAccountNumber: "PB-USD-4186",
    amountUsd: "100000",
    memo: "Family office fees"
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = usdToCents(form.amountUsd);
    const isConfirmed = await confirm({
      title: "Confirm Payment Instruction",
      description: `Execute transfer of ${formatUsd(amount)} from ${form.fromAccountNumber} to ${form.toAccountNumber}?`,
      confirmText: "Execute Payment"
    });

    if (!isConfirmed) return;

    const succeeded = await runAction(async () => {
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

    if (succeeded) navigate("/payments");
  }

  return (
    <article className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Payment Instruction" detail="Book an internal USD account-to-account transfer." />
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <TextInput label="From account number" value={form.fromAccountNumber} onChange={(fromAccountNumber) => setForm({ ...form, fromAccountNumber })} />
        <TextInput label="To account number" value={form.toAccountNumber} onChange={(toAccountNumber) => setForm({ ...form, toAccountNumber })} />
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
