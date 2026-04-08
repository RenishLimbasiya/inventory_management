"use client";

import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";

interface WarehouseHeaderProps {
  className?: string;
}

/**
 * WarehouseHeader Component
 * Displays warehouse name and active currency
 * Shows warehouse configuration at top of layout
 */
export function WarehouseHeader({ className }: WarehouseHeaderProps) {
  const { warehouseName, currency } = useWarehouse();

  return (
    <div
      className={cn(
        "glass border-b border-white/10",
        "px-4 md:px-6 py-4",
        "flex items-center justify-between md:justify-start gap-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
          <span className="text-lg font-semibold text-primary">📦</span>
        </div>
        <div className="hidden md:flex flex-col">
          <h1 className="text-lg font-bold text-foreground">{warehouseName}</h1>
          <p className="text-xs text-muted-foreground">Currency: {currency}</p>
        </div>
      </div>
    </div>
  );
}
