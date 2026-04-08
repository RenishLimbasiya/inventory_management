"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { InventoryStats, ProductCategory } from "@/types/inventory";
import { useWarehouse } from "@/context/WarehouseContext";

/**
 * Hook: useInventoryStats
 * Computes inventory statistics from Redux state only
 * No API fetches - uses current Redux state
 * Returns live computed stats
 */
export function useInventoryStats(): InventoryStats {
  const products = useSelector((state: RootState) => state.products.products);
  const { lowStockThresholdOverride } = useWarehouse();

  return useMemo(() => {
    const byCategory: Record<ProductCategory, number> = {
      electronics: 0,
      clothing: 0,
      food: 0,
      furniture: 0,
      tools: 0,
      stationery: 0,
      other: 0,
    };

    for (const product of products) {
      byCategory[product.category] += 1;
    }

    const stats: InventoryStats = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      lowStockCount: products.filter((p) => {
        const threshold = lowStockThresholdOverride ?? p.minStockLevel;
        return p.quantity <= threshold;
      }).length,
      outOfStockCount: products.filter((p) => p.quantity === 0).length,
      byCategory,
      topByValue: [...products]
        .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
        .slice(0, 5),
    };

    return stats;
  }, [products, lowStockThresholdOverride]);
}
