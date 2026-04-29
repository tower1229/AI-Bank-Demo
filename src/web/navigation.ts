import { LayoutDashboard, PackageOpen, Send, ShieldAlert, UserPlus, Users } from "lucide-react";
import type { NavItem } from "./types";

export const navigationGroups: { name: string; items: NavItem[] }[] = [
  { name: "Workspace", items: [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] },
  {
    name: "Front Office",
    items: [
      { name: "Client Lifecycle", path: "/client-lifecycle", icon: UserPlus },
      { name: "Client Book", path: "/client-book", icon: Users },
      { name: "Investment Orders", path: "/investment-orders", icon: PackageOpen }
    ]
  },
  { name: "Operations", items: [{ name: "Payments", path: "/payments", icon: Send }] },
  { name: "Controls", items: [{ name: "Audit & Controls", path: "/audit-log", icon: ShieldAlert }] }
];

export function getActiveNavigationItem(pathname: string): NavItem {
  const items = navigationGroups.flatMap((group) => group.items);
  return (
    items.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`)) ??
    navigationGroups[0].items[0]
  );
}

export function getPageTitle(pathname: string, fallback: string): string {
  const titles: Record<string, string> = {
    "/client-lifecycle/new": "New Client Application",
    "/payments/new": "New Payment Instruction",
    "/investment-orders/new": "New Investment Order"
  };

  return titles[pathname] ?? fallback;
}
