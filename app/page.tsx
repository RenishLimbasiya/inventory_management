import { InventoryStats, Product, StockMovement } from "@/types/inventory";
import { StatsCard } from "@/components/StatsCard";
import { CategoryDistributionChart } from "@/components/CategoryDistributionChart";
import { TopValueChart } from "@/components/TopValueChart";
import { LowStockAlert } from "@/components/LowStockAlert";
import { MovementHistoryRow } from "@/components/MovementHistoryRow";
import { cn } from "@/lib/utils";

/**
 * Dashboard Page (Server Component)
 * Fetches and displays inventory statistics and charts
 * Server-side rendering for optimal performance
 */
export default async function DashboardPage() {
  let products: Product[] = [];
  let movements: StockMovement[] = [];
  let stats: InventoryStats | null = null;
  let error: string | null = null;

  try {
    // Fetch products and stats in parallel
    const [productsRes, statsRes, movementsRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
        {
          cache: "no-store",
        },
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/movements/stats`,
        {
          cache: "no-store",
        },
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/movements?limit=10`,
        {
          cache: "no-store",
        },
      ),
    ]);

    if (productsRes.ok) {
      const data = await productsRes.json();
      products = data.data || [];
    }

    if (statsRes.ok) {
      const data = await statsRes.json();
      stats = data.data;
    }

    if (movementsRes.ok) {
      const data = await movementsRes.json();
      movements = (data.data || [])
        .sort(
          (a: StockMovement, b: StockMovement) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10);
    }
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to fetch dashboard data";
  }

  // Calculate stats from products if API stats unavailable
  const displayStats = stats || {
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
    categoryDistribution: {},
    inboundMovements: movements.filter((m) => m.type === "inbound").length,
    outboundMovements: movements.filter((m) => m.type === "outbound").length,
    lastUpdated: new Date().toISOString(),
  };

  const lowStockCount =
    displayStats.outOfStockItems + displayStats.lowStockItems;

  return (
    <div className="space-y-6">
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="📦"
          label="Total Products"
          value={displayStats.totalProducts}
          subtext={`${displayStats.totalItems} total units`}
        />
        <StatsCard
          icon="💰"
          label="Total Value"
          value={`$${displayStats.totalValue.toFixed(2)}`}
          subtext={`Avg: $${displayStats.averageUnitPrice.toFixed(2)}`}
        />
        <StatsCard
          icon="⚠️"
          label="Low Stock"
          value={displayStats.lowStockItems}
          variant={displayStats.lowStockItems > 0 ? "warning" : "success"}
          subtext="Below minimum level"
        />
        <StatsCard
          icon="🚨"
          label="Out of Stock"
          value={displayStats.outOfStockItems}
          variant={displayStats.outOfStockItems > 0 ? "danger" : "success"}
          subtext="Zero quantity items"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart products={products} />
        <TopValueChart products={products} />
      </div>

      {/* Low Stock Alerts */}
      {lowStockCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            ⚠️ Inventory Alerts
          </h2>
          <LowStockAlert variant="detailed" products={products} />
        </div>
      )}

      {/* Recent Movements */}
      {movements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            📊 Recent Movements
          </h2>
          <div className="space-y-3">
            {movements.map((movement) => {
              const product = products.find((p) => p.id === movement.productId);
              return (
                <MovementHistoryRow
                  key={movement.id}
                  movement={movement}
                  productName={product?.name || "Unknown Product"}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !error && (
        <div
          className={cn(
            "glass rounded-lg p-12",
            "border border-white/10",
            "flex flex-col items-center justify-center gap-4",
            "text-center",
          )}
        >
          <div className="text-4xl">📦</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No Products Yet
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first product to see inventory statistics
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
