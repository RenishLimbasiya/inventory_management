import { Product } from "@/types/inventory";
import { StockMovementRecordForm } from "@/components/StockMovementRecordForm";

/**
 * Movements Add Page (Server Component)
 * Wrapper for recording new stock movements
 * Fetches products to populate form selection
 */
export default async function RecordMovementPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
      {
        cache: "no-store",
      },
    );

    if (res.ok) {
      const data = await res.json();
      products = data.data || [];
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch products";
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Record Movement</h1>
        <p className="text-muted-foreground">
          Record a stock movement transaction (inbound, outbound, adjustment,
          return)
        </p>
      </div>

      {/* Form */}
      <StockMovementRecordForm products={products} error={error} />
    </div>
  );
}
