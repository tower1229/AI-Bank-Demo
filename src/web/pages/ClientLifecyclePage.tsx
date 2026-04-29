import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { OnboardingApplication } from "../../bank/service";
import { SectionHeader, TextInput } from "../components/common";
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
  const [form, setForm] = useState(() => generateDemoApplicationProfile());

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
      <SectionHeader title="Applicant Profile" detail="Capture KYC, source-of-funds, and initial funding details." />
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

function generateDemoApplicationProfile() {
  const givenNames = ["Alice", "Maya", "Daniel", "Sophia", "Victor", "Clara", "Ethan", "Nora"];
  const familyNames = ["Wong", "Chen", "Tan", "Zhao", "Lin", "Hale", "Morgan", "Reed"];
  const occupations = [
    "Family office director",
    "Technology founder",
    "Real estate investor",
    "Private equity partner",
    "Listed company executive",
    "Commodity trading principal",
    "Investment holding company owner"
  ];
  const sourceOfFunds = [
    "Investment income and company dividends",
    "Sale proceeds from privately held business",
    "Real estate portfolio rental income",
    "Long-term public equity investment gains",
    "Family trust distribution and dividends",
    "Executive compensation and vested shares"
  ];
  const addresses = [
    "18 Marina View, Demo City",
    "42 Victoria Harbour Road, Demo City",
    "9 Orchard Crescent, Demo City",
    "77 Central Avenue, Demo City",
    "25 Lakefront Drive, Demo City",
    "63 Meridian Square, Demo City"
  ];
  const nationalities = ["Demo Republic", "Arcadia", "Pacifica", "Meridian State", "Northbridge"];
  const initialDeposits = ["500000", "750000", "800000", "1000000", "1200000", "1500000"];

  const givenName = pick(givenNames);
  const familyName = pick(familyNames);
  const birthYear = randomInt(1968, 1993);
  const birthMonth = randomInt(1, 12);
  const birthDay = randomInt(1, 28);
  const expiryYear = randomInt(2031, 2038);
  const expiryMonth = randomInt(1, 12);
  const expiryDay = randomInt(1, 28);

  return {
    customerName: `${givenName} ${familyName}`,
    documentType: "passport",
    documentNumber: `DEMO${randomAlpha(2)}${randomInt(100000, 999999)}`,
    dateOfBirth: formatDate(birthYear, birthMonth, birthDay),
    documentExpiryDate: formatDate(expiryYear, expiryMonth, expiryDay),
    nationality: pick(nationalities),
    residentialAddress: pick(addresses),
    occupationTitle: pick(occupations),
    initialDepositUsd: pick(initialDeposits),
    sourceOfFunds: pick(sourceOfFunds),
    isPep: Math.random() < 0.15
  };
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAlpha(length: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length }, () => alphabet[randomInt(0, alphabet.length - 1)]).join("");
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
