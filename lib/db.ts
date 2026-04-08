/**
 * In-Memory Database Module
 * Simple data persistence for development/demo
 * In production, replace with real database (PostgreSQL, MongoDB, etc.)
 */

import { Product, StockMovement, StockMovementType } from "@/types/inventory";

/**
 * In-memory stores
 */
const db = {
  products: new Map<string, Product>(),
  movements: new Map<string, StockMovement>(),
  counters: {
    productId: 1,
    movementId: 1,
  },
};

/**
 * Initialize with sample data
 */
export function initializeDatabase() {
  if (db.products.size === 0) {
    const now = new Date().toISOString();

    db.products.set("prod_1", {
      id: "prod_1",
      sku: "SKU-001",
      name: "Laptop Computer",
      description: "High-performance laptop",
      category: "electronics",
      price: 129999,
      costPrice: 99999,
      quantity: 15,
      minStockLevel: 5,
      maxStockLevel: 30,
      unit: "pcs",
      supplier: "Tech Supplier Inc",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    db.products.set("prod_2", {
      id: "prod_2",
      sku: "SKU-002",
      name: "Office Chair",
      description: "Ergonomic office chair",
      category: "furniture",
      price: 29999,
      costPrice: 19999,
      quantity: 3,
      minStockLevel: 10,
      maxStockLevel: 50,
      unit: "pcs",
      supplier: "Furniture Ltd",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    db.counters.productId = 3;
  }
}

/**
 * Get all products
 */
export function getProducts(): Product[] {
  return Array.from(db.products.values());
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return db.products.get(id);
}

/**
 * Create product
 */
export function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Product {
  const now = new Date().toISOString();
  const product: Product = {
    ...data,
    id: `prod_${db.counters.productId++}`,
    createdAt: now,
    updatedAt: now,
  };
  db.products.set(product.id, product);
  return product;
}

/**
 * Update product
 */
export function updateProduct(
  id: string,
  data: Partial<Product>,
): Product | null {
  const product = db.products.get(id);
  if (!product) return null;

  const updated: Product = {
    ...product,
    ...data,
    id: product.id,
    createdAt: product.createdAt,
    updatedAt: new Date().toISOString(),
  };
  db.products.set(id, updated);
  return updated;
}

/**
 * Delete product
 */
export function deleteProduct(id: string): boolean {
  const exists = db.products.has(id);
  if (exists) {
    db.products.delete(id);
    // Cascade delete movements
    deleteMovementsByProductId(id);
  }
  return exists;
}

/**
 * Get all movements
 */
/**
 * Get all movements with optional filtering
 * Supports: { productId, type, limit }
 * Sorted by performedAt descending
 */
export function getMovements(filters?: {
  productId?: string;
  type?: StockMovementType;
  limit?: number;
}): StockMovement[] {
  let result = Array.from(db.movements.values());
  if (filters) {
    if (filters.productId) {
      result = result.filter((m) => m.productId === filters.productId);
    }
    if (filters.type) {
      result = result.filter((m) => m.type === filters.type);
    }
  }
  result.sort(
    (a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );
  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }
  return result;
}

/**
 * Create movement (atomic operation with product update)
 */
export function createMovement(data: {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
}): StockMovement | null {
  const product = db.products.get(data.productId);
  if (!product) return null;

  let newQuantity = product.quantity;
  const previousQuantity = product.quantity;
  switch (data.type) {
    case "restock":
    case "return":
      newQuantity = previousQuantity + data.quantity;
      break;
    case "sale":
    case "adjustment":
      newQuantity = previousQuantity - data.quantity;
      break;
  }
  // Never allow negative stock
  if (newQuantity < 0) {
    return null;
  }
  // Atomic update
  const now = new Date().toISOString();
  const updatedProduct: Product = {
    ...product,
    quantity: newQuantity,
    updatedAt: now,
  };
  db.products.set(product.id, updatedProduct);

  const movement: StockMovement = {
    id: `mov_${db.counters.movementId++}`,
    productId: data.productId,
    type: data.type,
    quantity: data.quantity,
    previousQuantity,
    newQuantity,
    note: data.note,
    performedAt: now,
  };
  db.movements.set(movement.id, movement);
  return movement;
}

/**
 * Delete movements by product ID (cascade delete)
 */
export function deleteMovementsByProductId(productId: string): void {
  const toDelete: string[] = [];
  for (const [id, movement] of db.movements) {
    if (movement.productId === productId) {
      toDelete.push(id);
    }
  }
  toDelete.forEach((id) => db.movements.delete(id));
}

/**
 * Export database instance (for debugging)
 */
export { db };
