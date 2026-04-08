"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { InventoryStats } from "@/types/inventory";

/**
 * Hook: useInventoryStats
 * Computes inventory statistics from Redux state only
 * No API fetches - uses current Redux state
 * Returns live computed stats
 */
export function useInventoryStats(): InventoryStats {
  const products = useSelector((state: RootState) => state.products.products);
  const movements = useSelector(
    (state: RootState) => state.movements.movements,
  );

  return useMemo(() => {
    const stats: InventoryStats = {
      totalProducts: products.length,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      lowStockItems: products.filter(
        (p) => p.quantity > 0 && p.quantity <= p.minStockLevel,
      ).length,
      outOfStockItems: products.filter((p) => p.quantity === 0).length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      averageUnitPrice:
        products.length > 0
          ? products.reduce((sum, p) => sum + p.price, 0) / products.length
          : 0,
      categoryDistribution: products.reduce(
        (acc: Record<string, number>, p) => {
          acc[p.category] = (acc[p.category] || 0) + p.quantity;
          return acc;
        },
        {} as Record<string, number>,
      ),
      inboundMovements: movements.filter(
        (m) => m.type === "inbound" || m.type === "return",
      ).length,
      outboundMovements: movements.filter((m) => m.type === "outbound").length,
      lastUpdated: new Date(),
    };

    return stats;
  }, [products, movements]);
}
