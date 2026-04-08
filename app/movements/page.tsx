"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StockMovement, Product } from "@/types/inventory";
import { MovementHistoryRow } from "@/components/MovementHistoryRow";
import { cn } from "@/lib/utils";

/**
 * Movements Page (Client Component)
 * Displays stock movement history
 * Shows inbound, outbound, adjustment, and return movements
 * Supports filtering by productId via URL parameters
 */
export default function MovementsPage() {
  const searchParams = useSearchParams();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovementsData() {
      setLoading(true);
      setError(null);

      try {
        // Build query string from search params
        const queryParams = new URLSearchParams();
        const productId = searchParams.get("productId");
        const limit = searchParams.get("limit");

        if (productId) {
          queryParams.append("productId", productId);
        }
        if (limit) {
          queryParams.append("limit", limit);
        }

        const [movementsRes, productsRes] = await Promise.all([
          fetch(`/api/movements?${queryParams}`, {
            cache: "no-store",
          }),
          fetch(`/api/products`, {
            cache: "no-store",
          }),
        ]);

        if (movementsRes.ok) {
          const data = await movementsRes.json();
          setMovements(data.data || []);
        } else {
          throw new Error("Failed to fetch movements");
        }

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchMovementsData();
  }, [searchParams]);

  // Calculate stats
  const stats = {
    totalMovements: movements.length,
    restock: movements.filter((m) => m.type === "restock").length,
    sale: movements.filter((m) => m.type === "sale").length,
    adjustment: movements.filter((m) => m.type === "adjustment").length,
    return: movements.filter((m) => m.type === "return").length,
  };

  const productMap = new Map(products.map((p) => [p.id, p]));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Stock Movements
          </h1>
          <p className="text-muted-foreground">
            Track all inventory movements and transactions
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="glass rounded-lg p-4 border border-white/10 animate-pulse"
            >
              <div className="h-3 w-16 bg-white/10 rounded mb-2"></div>
              <div className="h-6 w-8 bg-white/10 rounded mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-white/10 rounded mb-1"></div>
                  <div className="h-3 bg-white/10 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Stock Movements</h1>
        <p className="text-muted-foreground">
          Track all inventory movements and transactions
        </p>
      </div>

      {/* Filter Info */}
      {searchParams.get("productId") && (
        <div className="glass rounded-lg p-4 border border-white/10 bg-white/5">
          <p className="text-sm text-muted-foreground">
            Showing movements for product:{" "}
            <span className="font-semibold text-foreground">
              {productMap.get(searchParams.get("productId")!)?.name ||
                "Unknown Product"}
            </span>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className={cn(
            "glass rounded-lg p-4",
            "border border-red-500/30 bg-red-500/10",
            "text-red-700 dark:text-red-300",
            "text-sm",
          )}
        >
          <p className="font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass rounded-lg p-4 border border-white/10 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Total
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.totalMovements}
          </p>
        </div>

        <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/5 text-center">
          <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
            Restock
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {stats.restock}
          </p>
        </div>

        <div className="glass rounded-lg p-4 border border-blue-500/20 bg-blue-500/5 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Sale
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.sale}
          </p>
        </div>

        <div className="glass rounded-lg p-4 border border-purple-500/20 bg-purple-500/5 text-center">
          <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Returns
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {stats.return}
          </p>
        </div>

        <div className="glass rounded-lg p-4 border border-orange-500/20 bg-orange-500/5 text-center">
          <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            Adjustments
          </p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {stats.adjustment}
          </p>
        </div>
      </div>

      {/* Movements List */}
      {movements.length > 0 ? (
        <div className="space-y-3">
          {movements.map((movement) => {
            const product = productMap.get(movement.productId);
            return (
              <MovementHistoryRow
                key={movement.id}
                movement={movement}
                productName={product?.name || "Unknown Product"}
              />
            );
          })}
        </div>
      ) : (
        <div
          className={cn(
            "glass rounded-lg p-12",
            "border border-white/10",
            "flex flex-col items-center justify-center gap-4",
            "text-center",
          )}
        >
          <div className="text-4xl">📊</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No Movements Yet
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Record your first stock movement to see history here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
