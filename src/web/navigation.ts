import { LayoutDashboard, PackageOpen, Send, ShieldAlert, UserPlus, Users } from "lucide-react";
import type { NavItem } from "./types";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface RouteNavigationMeta {
  backLabel?: string;
  backTo?: string;
  breadcrumbs: BreadcrumbItem[];
  title: string;
}

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
  return getRouteNavigationMeta(pathname, fallback).title;
}

export function getRouteNavigationMeta(pathname: string, fallback: string): RouteNavigationMeta {
  if (pathname === "/client-lifecycle/new") {
    return {
      backLabel: "Back to Client Lifecycle",
      backTo: "/client-lifecycle",
      breadcrumbs: [
        { label: "Client Lifecycle", path: "/client-lifecycle" },
        { label: "New Client Application" }
      ],
      title: "New Client Application"
    };
  }

  if (pathname.startsWith("/client-lifecycle/")) {
    return {
      backLabel: "Back to Client Lifecycle",
      backTo: "/client-lifecycle",
      breadcrumbs: [
        { label: "Client Lifecycle", path: "/client-lifecycle" },
        { label: "Onboarding Review" }
      ],
      title: "Onboarding Review"
    };
  }

  if (pathname.startsWith("/client-book/")) {
    return {
      backLabel: "Back to Client Book",
      backTo: "/client-book",
      breadcrumbs: [
        { label: "Client Book", path: "/client-book" },
        { label: "Client 360 Portfolio" }
      ],
      title: "Client 360 Portfolio"
    };
  }

  if (pathname === "/payments/new") {
    return {
      backLabel: "Back to Payments",
      backTo: "/payments",
      breadcrumbs: [
        { label: "Payments", path: "/payments" },
        { label: "New Payment Instruction" }
      ],
      title: "New Payment Instruction"
    };
  }

  if (pathname === "/investment-orders/new") {
    return {
      backLabel: "Back to Investment Orders",
      backTo: "/investment-orders",
      breadcrumbs: [
        { label: "Investment Orders", path: "/investment-orders" },
        { label: "New Investment Order" }
      ],
      title: "New Investment Order"
    };
  }

  if (pathname.startsWith("/investment-orders/")) {
    return {
      backLabel: "Back to Investment Orders",
      backTo: "/investment-orders",
      breadcrumbs: [
        { label: "Investment Orders", path: "/investment-orders" },
        { label: "Product Details" }
      ],
      title: "Product Details"
    };
  }

  return {
    breadcrumbs: [{ label: fallback }],
    title: fallback
  };
}
