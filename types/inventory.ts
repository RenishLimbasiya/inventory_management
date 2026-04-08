/**
 * Inventory Management System - Type Definitions
 * Strict typing with no any as per requirements.
 */

export type ProductCategory =
  | "electronics"
  | "clothing"
  | "food"
  | "furniture"
  | "tools"
  | "stationery"
  | "other";

export type StockMovementType = "restock" | "sale" | "adjustment" | "return";

export interface Product {
  id: string;
  name: string;
  sku: string;              // Stock Keeping Unit, e.g., "ELEC-001"
  category: ProductCategory;
  description: string;
  price: number;            // in cents
  costPrice: number;        // in cents
  quantity: number;         // current stock level
  minStockLevel: number;    // alert threshold
  unit: string;             // e.g., "pcs", "kg", "liters"
  supplier?: string;
  imageUrl?: string;
  maxStockLevel?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;         // always positive; direction implied by type
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  performedAt: string;      // ISO timestamp
}

export interface InventoryFilters {
  category: ProductCategory | "all";
  search: string;
  lowStockOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;        // sum of (price * quantity) in cents
  lowStockCount: number;     // products where quantity <= minStockLevel
  outOfStockCount: number;   // products where quantity === 0
  byCategory: Record<ProductCategory, number>; // count per category
  topByValue: Product[];     // top 5 products by total value (price * qty)
}
