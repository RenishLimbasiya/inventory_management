"use client";

import { useMemo, useState } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";

interface RestockAlertProps {
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  minStockLevel: number;
  price: number;
  supplier?: string;
}

const AlertItem = ({
  product,
  onRestock,
}: {
  product: RestockAlertProps;
  onRestock: (productId: string) => void;
}) => {
  const { formatPrice } = useWarehouse();

  return (
    <div
      className={cn(
        "glass rounded-lg p-4 border",
        product.currentQuantity === 0
          ? "border-red-500/30 bg-red-500/5"
          : "border-amber-500/30 bg-amber-500/5",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold text-foreground">
              {product.productName}
            </h3>
            <span className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Current Stock
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  product.currentQuantity === 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              >
                {product.currentQuantity}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Min Level
              </p>
              <p className="text-lg font-bold text-foreground">
                {product.minStockLevel}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Unit Price
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(product.price)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Supplier
              </p>
              <p className="text-lg font-bold text-foreground">
                {product.supplier || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onRestock(product.productId)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium whitespace-nowrap",
            "transition-all",
            product.currentQuantity === 0
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-amber-600 hover:bg-amber-700 text-white",
          )}
        >
          Restock
        </button>
      </div>
    </div>
  );
};

/**
 * Alerts Page (Client Component)
 * Displays out-of-stock and low-stock inventory alerts
 * Provides restock actions for quick restocking
 */
export default function AlertsPage() {
  const products = useAppSelector((state) => state.products.products);
  const { lowStockThresholdOverride } = useWarehouse();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // Calculate alerts
  const { outOfStockItems, lowStockItems } = useMemo(() => {
    const outOfStock = products.filter((p) => p.quantity === 0);
    const lowStock = products.filter(
      (p) =>
        p.quantity > 0 &&
        p.quantity <= Math.max(p.minStockLevel, lowStockThresholdOverride || 0),
    );

    return {
      outOfStockItems: outOfStock.map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        currentQuantity: p.quantity,
        minStockLevel: p.minStockLevel,
        price: p.price,
        supplier: p.supplier,
      })),
      lowStockItems: lowStock.map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        currentQuantity: p.quantity,
        minStockLevel: p.minStockLevel,
        price: p.price,
        supplier: p.supplier,
      })),
    };
  }, [products, lowStockThresholdOverride]);

  const totalAlerts = outOfStockItems.length + lowStockItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Inventory Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and manage low-stock and out-of-stock items
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Alerts */}
        <div
          className={cn(
            "glass rounded-lg p-4 border",
            totalAlerts > 0
              ? "border-red-500/30 bg-red-500/10"
              : "border-green-500/30 bg-green-500/10",
          )}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Total Alerts
          </p>
          <p
            className={cn(
              "text-3xl font-bold mt-2",
              totalAlerts > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400",
            )}
          >
            {totalAlerts}
          </p>
        </div>

        {/* Out of Stock */}
        <div
          className={cn(
            "glass rounded-lg p-4 border",
            outOfStockItems.length > 0
              ? "border-red-500/30 bg-red-500/10"
              : "border-green-500/30 bg-green-500/10",
          )}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Out of Stock
          </p>
          <p
            className={cn(
              "text-3xl font-bold mt-2",
              outOfStockItems.length > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400",
            )}
          >
            {outOfStockItems.length}
          </p>
        </div>

        {/* Low Stock */}
        <div
          className={cn(
            "glass rounded-lg p-4 border",
            lowStockItems.length > 0
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-green-500/30 bg-green-500/10",
          )}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Low Stock
          </p>
          <p
            className={cn(
              "text-3xl font-bold mt-2",
              lowStockItems.length > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-green-600 dark:text-green-400",
            )}
          >
            {lowStockItems.length}
          </p>
        </div>
      </div>

      {/* No Alerts State */}
      {totalAlerts === 0 && (
        <div
          className={cn(
            "glass rounded-lg p-12",
            "border border-green-500/30 bg-green-500/10",
            "flex flex-col items-center justify-center gap-4",
            "text-center",
          )}
        >
          <div className="text-5xl">✓</div>
          <div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
              All Items in Stock
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              No alerts at this time. Your inventory is well stocked.
            </p>
          </div>
        </div>
      )}

      {/* Out of Stock Section */}
      {outOfStockItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              Out of Stock ({outOfStockItems.length})
            </h2>
          </div>
          <div className="space-y-3">
            {outOfStockItems.map((item) => (
              <AlertItem
                key={item.productId}
                product={item}
                onRestock={setSelectedProductId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Section */}
      {lowStockItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">
              Low Stock ({lowStockItems.length})
            </h2>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <AlertItem
                key={item.productId}
                product={item}
                onRestock={setSelectedProductId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hidden state for selected product (could be used by parent for modal) */}
      {selectedProductId && (
        <div className="sr-only" aria-live="polite">
          Selected product: {selectedProductId}
        </div>
      )}
    </div>
  );
}
