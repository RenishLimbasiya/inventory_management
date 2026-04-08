"use client";

import { StockMovement } from "@/types/inventory";

import { cn } from "@/lib/utils";

interface MovementHistoryRowProps {
  movement: StockMovement;
  productName: string;
  className?: string;
}

/**
 * Movement Type Icon and Color
 */
function getMovementTypeInfo(type: StockMovement["type"]) {
  const types = {
    restock: {
      icon: "📥",
      label: "Restock",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
    },
    sale: {
      icon: "📤",
      label: "Sale",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    return: {
      icon: "↩️",
      label: "Return",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    adjustment: {
      icon: "🔧",
      label: "Adjustment",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
    },
  };
  return types[type];
}

/**
 * MovementHistoryRow Component
 * Displays individual stock movement record
 * Shows quantity changes and movement metadata
 * Formatted for readability in history tables/lists
 */
export function MovementHistoryRow({
  movement,
  productName,
  className,
}: MovementHistoryRowProps) {
  const typeInfo = getMovementTypeInfo(movement.type);
  const date = new Date(movement.performedAt);
  const isPositive = movement.newQuantity >= movement.previousQuantity;

  return (
    <div
      className={cn(
        "glass rounded-lg p-4 transition-all hover:bg-white/15 dark:hover:bg-black/30",
        "border border-white/10",
        className,
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Type and Icon */}
        <div className={cn("md:col-span-2 rounded p-3", typeInfo.bg)}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  typeInfo.color,
                )}
              >
                {typeInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="md:col-span-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Product
          </p>
          <p className="font-medium text-foreground truncate">{productName}</p>
          <p className="text-xs text-muted-foreground">ID: {movement.id}</p>
        </div>

        {/* Quantity Change */}
        <div className="md:col-span-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Quantity Change
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">
              {movement.previousQuantity}
            </span>
            <span className="text-muted-foreground">→</span>
            <span
              className={cn(
                "font-bold text-lg",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {movement.newQuantity}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded",
                isPositive
                  ? "bg-green-500/20 text-green-700 dark:text-green-300"
                  : "bg-red-500/20 text-red-700 dark:text-red-300",
              )}
            >
              {isPositive ? "+" : ""}
              {movement.quantity *
                (movement.type === "sale" || movement.type === "adjustment"
                  ? -1
                  : 1)}
            </span>
          </div>
        </div>

        {/* Date and User */}
        <div className="md:col-span-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Date & User
          </p>
          <p className="text-sm font-medium text-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {movement.type.toUpperCase()}
          </p>
        </div>

        {/* Notes */}
        {movement.note && (
          <div className="md:col-span-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Notes
            </p>
            <p className="text-sm text-foreground line-clamp-2">
              {movement.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
