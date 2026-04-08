import { NextResponse } from "next/server";
import { InventoryStats, ProductCategory } from "@/types/inventory";
import { getProducts, initializeDatabase } from "@/lib/db";

/**
 * GET /api/movements/stats
 * Compute inventory statistics
 *
 * Returns a typed InventoryStats object.
 */
export async function GET() {
  try {
    initializeDatabase();
    const productsArray = getProducts();
    const byCategory: Record<ProductCategory, number> = {
      electronics: 0,
      clothing: 0,
      food: 0,
      furniture: 0,
      tools: 0,
      stationery: 0,
      other: 0,
    };

    for (const product of productsArray) {
      byCategory[product.category] += 1;
    }

    const stats: InventoryStats = {
      totalProducts: productsArray.length,
      totalValue: productsArray.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      ),
      lowStockCount: productsArray.filter((p) => p.quantity <= p.minStockLevel)
        .length,
      outOfStockCount: productsArray.filter((p) => p.quantity === 0).length,
      byCategory,
      topByValue: [...productsArray]
        .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
        .slice(0, 5),
    };

    return NextResponse.json({ data: stats, success: true });
  } catch (error) {
    console.error("GET /api/movements/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
