import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { OnboardingApplication } from "../../bank/service";
import { BackLink, SectionHeader, TextInput } from "../components/common";
import { useConfirm } from "../hooks/useConfirm";
import { formatTime, formatUsd, usdToCents } from "../lib/format";
import { postJson } from "../lib/api";
import type { RunAction } from "../types";

export function ClientLifecyclePage({
  applications,
  runAction
}: {
  applications: OnboardingApplication[];
  runAction: RunAction;
}) {
  const confirm = useConfirm();

  async function approve(application: OnboardingApplication) {
    const isConfirmed = await confirm({
      title: "Approve Client Onboarding",
      description: `Are you sure you want to approve the onboarding application for ${application.customerName}?`,
      confirmText: "Approve"
    });

    if (!isConfirmed) return;

    await runAction(async () => {
      const response = await postJson<OnboardingApplication>(`/api/onboarding/applications/${application.id}/approve`, {
        confirmed: true
      });
      return response.displayMessage ?? "Application approved.";
    });
  }

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="Onboarding Queue" detail="Review pending applications and complete bank-side approval." />
        <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" to="/client-lifecycle/new">
          <Plus className="h-4 w-4" />
          New application
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-3 text-left w-8">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
              </th>
              {["Prospect", "Lifecycle status", "Initial funding", "Review level", "Created", ""].map((heading) => (
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={application.id}>
                <td className="px-3 py-4 text-left">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">{application.customerName}</td>
                <td className="px-3 py-4">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 capitalize">
                    {application.status.replaceAll("_", " ")}
                  </span>
                </td>
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
  );
}

export function NewClientApplicationPage({ runAction }: { runAction: RunAction }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
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
    const isConfirmed = await confirm({
      title: "Confirm Client Lifecycle Submission",
      description: `Submit onboarding application for ${form.customerName} with ${formatUsd(amount)} initial deposit?`,
      confirmText: "Submit Application"
    });

    if (!isConfirmed) return;

    const succeeded = await runAction(async () => {
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

    if (succeeded) navigate("/client-lifecycle");
  }

  return (
    <article className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <BackLink to="/client-lifecycle" label="Back to onboarding queue" />
      <SectionHeader title="New Client Application" detail="Capture KYC, source-of-funds, and initial funding details." />
      <form className="mt-6 grid gap-4" onSubmit={submit}>
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
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Link className="inline-flex min-h-10 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50" to="/client-lifecycle">
            Cancel
          </Link>
          <button className="min-h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="submit">
            Submit application
          </button>
        </div>
      </form>
    </article>
  );
}
