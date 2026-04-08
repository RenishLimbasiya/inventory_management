"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";
import { Product } from "@/types/inventory";
import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";

interface LowStockAlertProps {
  products: Product[];
  onRestock?: (product: Product) => void;
  className?: string;
  variant?: "compact" | "detailed";
}

/**
 * LowStockAlert Component
 * Displays alerts for out-of-stock and low-stock items
 * Provides quick restock action for each alert
 * Severity-based styling with glassmorphism
 */
export function LowStockAlert({
  products,
  onRestock,
  className,
  variant = "detailed",
}: LowStockAlertProps) {
  const { lowStockThresholdOverride } = useWarehouse();

  const criticalItems = products.filter((p) => p.quantity === 0);
  const lowStockItems = products.filter(
    (p) =>
      p.quantity > 0 &&
      p.quantity <= (lowStockThresholdOverride ?? p.minStockLevel),
  );

  if (criticalItems.length === 0 && lowStockItems.length === 0) {
    return (
      <div
        className={cn(
          "glass rounded-lg p-6 flex items-center gap-3",
          "bg-green-500/5 border border-green-500/20",
          className,
        )}
      >
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500/10">
            <span className="text-green-600 dark:text-green-400 text-lg">
              ✓
            </span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            All Stock Levels Healthy
          </h3>
          <p className="text-sm text-muted-foreground">
            No items below minimum threshold
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Critical Items */}
      {criticalItems.length > 0 && (
        <div
          className={cn(
            "glass rounded-lg p-4 border border-red-500/30 bg-red-500/5",
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">
              Out of Stock ({criticalItems.length})
            </h3>
          </div>

          {variant === "detailed" ? (
            <div className="space-y-2">
              {criticalItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-red-500/5 rounded border border-red-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  {onRestock && (
                    <button
                      onClick={() => onRestock(product)}
                      className="btn-glass text-xs px-3 py-1 ml-2"
                    >
                      Restock
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {criticalItems.map((p) => p.name).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div
          className={cn(
            "glass rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/5",
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
              Low Stock ({lowStockItems.length})
            </h3>
          </div>

          {variant === "detailed" ? (
            <div className="space-y-2">
              {lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-yellow-500/5 rounded border border-yellow-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} / {product.minStockLevel} units
                    </p>
                  </div>
                  {onRestock && (
                    <button
                      onClick={() => onRestock(product)}
                      className="btn-glass text-xs px-3 py-1 ml-2"
                    >
                      Restock
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lowStockItems.map((p) => p.name).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
