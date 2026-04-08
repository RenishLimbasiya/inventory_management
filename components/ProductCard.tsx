"use client";

import { useMemo } from "react";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Product } from "@/types/inventory";
import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onViewMovements?: (productId: string) => void;
  onClick?: (product: Product) => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

/**
 * Stock level indicator logic
 * Green: > minStockLevel
 * Yellow: > 0 and <= minStockLevel
 * Red: 0 or below
 */
function getStockStatus(quantity: number, minStockLevel: number) {
  if (quantity === 0)
    return { status: "critical", color: "bg-red-500", label: "Out of Stock" };
  if (quantity <= minStockLevel)
    return { status: "warning", color: "bg-yellow-500", label: "Low Stock" };
  return { status: "safe", color: "bg-green-500", label: "In Stock" };
}

/**
 * ProductCard Component
 * Displays product information with glass morphism styling
 * Shows stock status indicator with animated effects
 */
export function ProductCard({
  product,
  onEdit,
  onDelete,
  onViewMovements,
  onClick,
  isSelected = false,
  isLoading = false,
}: ProductCardProps) {
  const { formatPrice } = useWarehouse();

  const stockStatus = useMemo(
    () => getStockStatus(product.quantity, product.minStockLevel),
    [product.quantity, product.minStockLevel],
  );

  const totalValue = useMemo(
    () => product.price * product.quantity,
    [product.price, product.quantity],
  );

  return (
    <div
      className={cn(
        "glass rounded-lg p-6 transition-all duration-300 hover:shadow-2xl hover:bg-white/15 dark:hover:bg-black/30",
        "cursor-pointer group",
        isSelected && "ring-2 ring-accent",
        isLoading && "opacity-50 pointer-events-none",
      )}
      onClick={() => onClick?.(product)}
    >
      {/* Header with SKU and Status Indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {product.sku}
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-1 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Stock Status Indicator */}
        <div className="flex items-center gap-2 ml-3">
          <div className={cn("stock-indicator", stockStatus.color)} />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Product Category and Supplier */}
      <div className="mb-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          Category:{" "}
          <span className="font-medium text-foreground">
            {product.category}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Supplier:{" "}
          <span className="font-medium text-foreground">
            {product.supplier || "N/A"}
          </span>
        </p>
      </div>

      {/* Stock Information */}
      <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-white/10">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="text-lg font-bold text-foreground">
            {product.quantity}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Min Level</p>
          <p className="text-lg font-bold text-foreground">
            {product.minStockLevel}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Unit</p>
          <p className="text-lg font-bold text-foreground">{product.unit}</p>
        </div>
      </div>

      {/* Pricing and Value */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Unit Price:</span>
          <span className="font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Total Value:
          </span>
          <span className="font-bold text-accent">
            {formatPrice(totalValue)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3">
        {onViewMovements && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewMovements(product.id);
            }}
            className="btn-glass flex-1 text-sm py-2"
          >
            History
          </button>
        )}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="btn-glass flex-1 text-sm py-2"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            className="btn-glass flex-1 text-sm py-2 text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        )}
      </div>

      {/* Low Stock Warning */}
      {stockStatus.status !== "safe" && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Stock below minimum threshold
          </p>
        </div>
      )}
    </div>
  );
}
