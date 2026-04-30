import type { AuditLogEntry } from "../../bank/service";
import { SectionHeader, StatusBadge } from "../components/common";
import { formatTime } from "../lib/format";

export function AuditPage({ auditLogs }: { auditLogs: AuditLogEntry[] }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader title="Audit Trail and Controls" detail="Manual web and Telegram/OpenClaw operations appear in one operational control log." />
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[880px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-3 text-left w-8">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
              </th>
              {["Event", "Status", "Channel", "Operator", "Entity", "Result", "Timestamp"].map((heading) => (
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-normal text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50" key={log.id}>
                <td className="px-3 py-4 text-left">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">{log.action.replaceAll("_", " ")}</td>
                <td className="px-3 py-4">
                  <StatusBadge value={log.status} />
                </td>
                <td className="px-3 py-4">
                  <StatusBadge value={log.source} />
                </td>
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
