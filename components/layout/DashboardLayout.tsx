"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WarehouseHeader } from "./WarehouseHeader";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardLayout Component
 * Root layout for dashboard pages
 * Includes warehouse header, responsive sidebar, and mobile drawer
 * Handles mobile and desktop layout variants
 */
export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <WarehouseHeader />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 border-r border-white/10 bg-white/5 dark:bg-black/20 overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Mobile Drawer + Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Menu Button + Content Header */}
          <div className="md:hidden flex items-center px-4 py-3 border-b border-white/10 gap-2">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center justify-center",
                    "h-10 w-10 rounded-lg",
                    "bg-white/10 hover:bg-white/20",
                    "border border-white/20",
                    "text-foreground",
                    "transition-all",
                  )}
                  aria-label="Toggle navigation menu"
                >
                  <span className="text-xl">☰</span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 p-0 border-r border-white/10"
              >
                <div className="mt-8">
                  <Sidebar
                    onNavClick={() => setIsMobileOpen(false)}
                    className="px-2"
                  />
                </div>
              </SheetContent>
            </Sheet>
            <h2 className="text-sm font-semibold text-foreground">Menu</h2>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
