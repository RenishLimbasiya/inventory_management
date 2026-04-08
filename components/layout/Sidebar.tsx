"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AlertBadge } from "./AlertBadge";

interface SidebarProps {
  onNavClick?: () => void;
  className?: string;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: "📊",
  },
  {
    label: "Products",
    href: "/products",
    icon: "📦",
  },
  {
    label: "Add Product",
    href: "/products/add",
    icon: "➕",
  },
  {
    label: "Movements",
    href: "/movements",
    icon: "🔄",
  },
  {
    label: "Record Movement",
    href: "/movements/add",
    icon: "📝",
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: "🔔",
  },
];

/**
 * Sidebar Component
 * Navigation menu for dashboard routes
 * Shows active route with visual indicator
 * Includes alert badge on Alerts link
 */
export function Sidebar({ onNavClick, className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn("flex flex-col gap-2 p-4", "h-full", className)}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg",
            "transition-all duration-200",
            "text-sm font-medium",
            "relative",
            isActive(item.href)
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:bg-white/5 border border-transparent",
          )}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          {item.href === "/alerts" && <AlertBadge />}
        </Link>
      ))}
    </nav>
  );
}
