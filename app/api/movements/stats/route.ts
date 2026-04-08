import { NextResponse } from "next/server";
import { InventoryStats, ProductCategory } from "@/types/inventory";
import { getProducts, getMovements, initializeDatabase } from "@/lib/db";

/**
 * GET /api/movements/stats
 * Compute inventory statistics
 *
 * Returns:
 * - totalProducts: count of all products
 * - totalItems: sum of all quantities
 * - lowStockItems: count of products below min threshold
 * - outOfStockItems: count of products with 0 quantity
 * - totalValue: sum of (price * quantity)
 * - averageUnitPrice: average price per unit
 * - categoryDistribution: items per category
 * - inboundMovements: count of inbound movements
 * - outboundMovements: count of outbound movements
 */
export async function GET() {
  try {
    initializeDatabase();
    const productsArray = getProducts();
    const movementsArray = getMovements();

    const stats: InventoryStats = {
      totalProducts: productsArray.length,
      totalItems: productsArray.reduce((sum, p) => sum + p.quantity, 0),
      lowStockItems: productsArray.filter(
        (p) => p.quantity > 0 && p.quantity <= p.minStockLevel,
      ).length,
      outOfStockItems: productsArray.filter((p) => p.quantity === 0).length,
      totalValue: productsArray.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      ),
      averageUnitPrice:
        productsArray.length > 0
          ? productsArray.reduce((sum, p) => sum + p.price, 0) /
            productsArray.length
          : 0,
      categoryDistribution: productsArray.reduce(
        (acc, p) => {
          const key = p.category as ProductCategory;
          acc[key] = (acc[key] || 0) + p.quantity;
          return acc;
        },
        {} as Record<ProductCategory, number>,
      ),
      inboundMovements: movementsArray.filter(
        (m) => m.type === "inbound" || m.type === "return",
      ).length,
      outboundMovements: movementsArray.filter((m) => m.type === "outbound")
        .length,
      lastUpdated: new Date(),
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
