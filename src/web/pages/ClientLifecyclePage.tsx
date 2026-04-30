import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, XCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { KycCheckStatus, OnboardingApplication } from "../../bank/service";
import { formatStatusLabel, Notice, SectionHeader, StatusBadge, TextInput, statusTone, toneClass } from "../components/common";
import { useConfirm } from "../hooks/useConfirm";
import { formatTime, formatUsd, usdToCents } from "../lib/format";
import { fetchJson, postJson } from "../lib/api";
import type { RunAction } from "../types";

export function ClientLifecyclePage({
  applications,
  runAction
}: {
  applications: OnboardingApplication[];
  runAction: RunAction;
}) {
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
                <td className="px-3 py-4 text-sm font-medium text-gray-900">
                  <Link className="text-violet-700 hover:text-violet-900" to={`/client-lifecycle/${application.id}`}>
                    {application.customerName}
                  </Link>
                </td>
                <td className="px-3 py-4">
                  <StatusBadge value={application.status} />
                </td>
                <td className="px-3 py-4 text-sm font-semibold text-gray-900">{formatUsd(application.initialDepositCents)}</td>
                <td className="px-3 py-4">
                  <StatusBadge value={application.kycStatus ?? application.initialReview} />
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{formatTime(application.createdAt)}</td>
                <td className="px-3 py-4 text-right">
                  <Link className="text-sm font-semibold text-violet-700 hover:text-violet-900" to={`/client-lifecycle/${application.id}`}>
                    Review
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

export function OnboardingApplicationDetailPage({
  applications,
  runAction
}: {
  applications: OnboardingApplication[];
  runAction: RunAction;
}) {
  const { applicationId } = useParams();
  const confirm = useConfirm();
  const [application, setApplication] = useState<OnboardingApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadApplication() {
      if (!applicationId) {
        setError("Onboarding application id is missing.");
        return;
      }

      const cached = applications.find((item) => item.id === applicationId);
      if (cached) {
        setApplication(cached);
        setError(null);
        return;
      }

      try {
        const loaded = await fetchJson<OnboardingApplication>(`/api/onboarding/applications/${applicationId}`);
        if (!cancelled) {
          setApplication(loaded);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Application failed to load.");
        }
      }
    }

    loadApplication();

    return () => {
      cancelled = true;
    };
  }, [applicationId, applications]);

  async function approve() {
    if (!application) return;

    const isConfirmed = await confirm({
      title: "Approve Client Onboarding",
      description: `Approve the onboarding application for ${application.customerName}?`,
      confirmText: "Approve"
    });

    if (!isConfirmed) return;

    await runAction(async () => {
      const response = await postJson<OnboardingApplication>(`/api/onboarding/applications/${application.id}/approve`, {
        confirmed: true
      });
      if (response.data) setApplication(response.data);
      return response.displayMessage ?? "Application approved.";
    });
  }

  async function reject() {
    if (!application) return;

    const isConfirmed = await confirm({
      title: "Reject Client Onboarding",
      description: `Reject the onboarding application for ${application.customerName}?`,
      confirmText: "Reject"
    });

    if (!isConfirmed) return;

    await runAction(async () => {
      const response = await postJson<OnboardingApplication>(`/api/onboarding/applications/${application.id}/reject`, {
        confirmed: true
      });
      if (response.data) setApplication(response.data);
      return response.displayMessage ?? "Application rejected.";
    });
  }

  if (error) {
    return <Notice tone="error" text={error} />;
  }

  if (!application) {
    return <p className="text-sm text-gray-500">Loading onboarding application...</p>;
  }

  return (
    <div className="space-y-5">
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader title={application.customerName} detail="Review applicant profile, KYC checks, and source metadata before approval." />
          {application.status === "pending_approval" ? (
            <div className="flex items-center gap-3">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={reject}
                type="button"
              >
                Reject
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700"
                onClick={approve}
                type="button"
              >
                Approve onboarding
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryTile label="Lifecycle status" value={<StatusBadge value={application.status} />} />
          <SummaryTile label="KYC review" value={<StatusBadge value={application.kycStatus} />} />
          <SummaryTile label="Initial funding" value={formatUsd(application.initialDepositCents)} />
        </div>
      </article>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Applicant Profile" detail="Structured data submitted from manual web entry or Telegram/OpenClaw intake." />
          <DetailGrid
            rows={[
              ["Document capture", formatStatusLabel(application.documentCaptureMethod)],
              ["Document type", application.documentType ?? "Not supplied"],
              ["Document number", application.documentNumber ?? "Not supplied"],
              ["Date of birth", application.dateOfBirth ?? "Not supplied"],
              ["Document expiry", application.documentExpiryDate ?? "Not supplied"],
              ["Nationality", application.nationality ?? "Not supplied"],
              ["Address proof", application.addressProofProvided ? "Received" : "Not supplied"],
              ["Address proof type", application.addressProofType ?? "Not supplied"],
              ["Address proof holder", application.addressProofHolderName ?? "Not supplied"],
              ["Address proof address", application.addressProofAddress ?? "Not supplied"],
              ["Address proof date", application.addressProofIssueDate ?? "Not supplied"],
              ["KYC evidence", application.kycEvidenceProvided ? "Received" : "Not supplied"],
              ["Residential address", application.residentialAddress ?? "Not supplied"],
              ["Occupation/title", application.occupationTitle ?? "Not supplied"],
              ["Source of funds", application.sourceOfFunds],
              ["PEP", application.isPep ? "Yes" : "No"]
            ]}
          />
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader title="KYC Review" detail={application.kycSummary ?? "KYC review details for approval."} />
          <div className="mt-5 space-y-3">
            {application.kycChecks.map((check) => (
              <div className="flex gap-3 border-b border-gray-100 py-3 last:border-0" key={check.key}>
                <KycStatusIcon status={check.status} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{check.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">Review reasons</h3>
            {application.reviewReasons.length > 0 ? (
              <ul className="mt-2 grid gap-2">
                {application.reviewReasons.map((reason) => (
                  <li className={`border-b py-2 text-sm last:border-0 ${toneClass("warning", "badge")}`} key={reason}>
                    {reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No enhanced review reasons recorded.</p>
            )}
          </div>
        </article>
      </section>

      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Submission Metadata" detail="Operational source and confirmation record for audit review." />
        <DetailGrid
          rows={[
            ["Submitted source", formatStatusLabel(application.submittedSource)],
            ["Submitted by", application.submittedBy],
            ["Original user text", application.originalUserText ?? "Not captured"],
            ["Confirmation text", application.confirmationText ?? "Not captured"],
            ["Created", formatTime(application.createdAt)],
            ["Approved by", application.approvedBy ?? "Not approved"],
            ["Approved at", application.approvedAt ? formatTime(application.approvedAt) : "Not approved"]
          ]}
        />
      </article>
    </div>
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
        addressProofProvided: true,
        addressProofCaptureMethod: "manual_text",
        addressProofType: form.addressProofType,
        addressProofHolderName: form.customerName,
        addressProofAddress: form.residentialAddress,
        addressProofIssueDate: form.addressProofIssueDate,
        kycEvidenceProvided: true,
        kycEvidenceCaptureMethod: "manual_upload",
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
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Document capture method: <span className="font-semibold text-gray-900">manual text entry</span>. Telegram/OpenClaw submissions may use image parsed capture.
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Address proof type" value={form.addressProofType} onChange={(addressProofType) => setForm({ ...form, addressProofType })} />
          <TextInput label="Address proof date" value={form.addressProofIssueDate} onChange={(addressProofIssueDate) => setForm({ ...form, addressProofIssueDate })} />
        </div>
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

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="border-b border-gray-100 py-3" key={label}>
          <dt className="text-xs font-medium uppercase tracking-normal text-gray-500">{label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SummaryTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-normal text-gray-500">{label}</p>
      <div className="mt-1 text-sm font-semibold capitalize text-gray-900">{value}</div>
    </div>
  );
}

function KycStatusIcon({ status }: { status: KycCheckStatus }) {
  if (status === "pass") {
    return <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${toneClass(statusTone(status), "icon")}`} />;
  }

  if (status === "fail") {
    return <XCircle className={`mt-0.5 h-5 w-5 shrink-0 ${toneClass(statusTone(status), "icon")}`} />;
  }

  return <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${toneClass(statusTone(status), "icon")}`} />;
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
    addressProofType: "utility bill",
    addressProofIssueDate: formatDate(2026, randomInt(1, 4), randomInt(1, 28)),
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
