import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatTime } from "../lib/format";
import type { RouteNavigationMeta } from "../navigation";
import { navigationGroups } from "../navigation";
import type { LoadState, NavItem } from "../types";
import { Notice, statusTone, toneClass } from "./common";

export function AppShell({
  activeItem,
  children,
  currentPath,
  error,
  healthCheckedAt,
  message,
  routeMeta,
  state,
  statusLabel
}: {
  activeItem: NavItem;
  children: ReactNode;
  currentPath: string;
  error: string | null;
  healthCheckedAt: string | null;
  message: string | null;
  routeMeta: RouteNavigationMeta;
  state: LoadState;
  statusLabel: string;
}) {
  const ActiveIcon = activeItem.icon;

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-gray-900 lg:flex">
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
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-3">
              <nav className="flex min-h-5 items-center gap-1 overflow-x-auto text-xs font-medium text-gray-500" aria-label="Breadcrumb">
                {routeMeta.breadcrumbs.map((crumb, index) => (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap" key={`${crumb.label}-${index}`}>
                    {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-gray-400" /> : null}
                    {crumb.path ? (
                      <Link className="hover:text-gray-900" to={crumb.path}>
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-700">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm">
                  <ActiveIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold tracking-normal text-gray-950">{routeMeta.title}</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
    return `inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${toneClass(statusTone("seeded"), "shell")}`;
  }

  if (state === "error") {
    return `inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${toneClass(statusTone("error"), "shell")}`;
  }

  return `inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${toneClass(statusTone("loading"), "shell")}`;
}
