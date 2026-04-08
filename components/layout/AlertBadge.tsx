"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  className?: string;
}

/**
 * AlertBadge Component
 * Displays count badge of low-stock and out-of-stock items
 * Updates reactively based on Redux product state
 */
export function AlertBadge({ className }: AlertBadgeProps) {
  const products = useAppSelector((state) => state.products.products);

  const alertCount = useMemo(() => {
    return products.filter((product) => product.quantity === 0).length;
  }, [products]);

  if (alertCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        "h-6 w-6 rounded-full",
        "bg-red-500 text-white",
        "text-xs font-bold",
        "animate-pulse",
        className,
      )}
    >
      {alertCount}
    </div>
  );
}
