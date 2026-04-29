import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatTime } from "../lib/format";
import { navigationGroups } from "../navigation";
import type { LoadState, NavItem } from "../types";
import { Notice } from "./common";

export function AppShell({
  activeItem,
  children,
  currentPath,
  error,
  healthCheckedAt,
  message,
  pageTitle,
  state,
  statusLabel
}: {
  activeItem: NavItem;
  children: ReactNode;
  currentPath: string;
  error: string | null;
  healthCheckedAt: string | null;
  message: string | null;
  pageTitle: string;
  state: LoadState;
  statusLabel: string;
}) {
  const ActiveIcon = activeItem.icon;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 lg:flex">
      <aside className="bg-[#111111] text-gray-400 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 flex flex-col">
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.name}>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group.name}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

                  return (
                    <Link
                      className={`flex w-full min-h-9 gap-3 items-center rounded-md px-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#1F1F1F] text-[#FF5A00] border-l-[3px] border-[#FF5A00] pl-[calc(0.75rem-3px)]"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                      key={item.name}
                      to={item.path}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FF5A00] text-xs font-black text-white">
              AB
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Core Bank System</p>
              <p className="text-xs text-gray-500">RM operations console</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pt-2 pb-0 md:flex-row md:items-end md:justify-between">
            <div className="flex gap-6 overflow-x-auto">
              <button className="flex items-center gap-2 border-b-2 border-violet-600 px-1 pb-3 text-sm font-semibold text-gray-900">
                <ActiveIcon className="h-4 w-4" />
                {pageTitle}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pb-3">
              <span className={statusClass(state)}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {statusLabel}
              </span>
              <span className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm">
                {healthCheckedAt ? formatTime(healthCheckedAt) : "Waiting for API"}
              </span>
            </div>
          </header>

          {message ? <Notice tone="success" text={message} /> : null}
          {error ? <Notice tone="error" text={error} /> : null}
          {children}
        </div>
      </main>
    </div>
  );
}

function statusClass(state: LoadState): string {
  if (state === "ready") {
    return "inline-flex min-h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800";
  }

  if (state === "error") {
    return "inline-flex min-h-9 items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700";
  }

  return "inline-flex min-h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600";
}
