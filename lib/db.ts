/**
 * In-Memory Database Module
 * Simple data persistence for development/demo
 * In production, replace with real database (PostgreSQL, MongoDB, etc.)
 */

import { Product, StockMovement } from "@/types/inventory";

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
    const now = new Date();

    db.products.set("prod_1", {
      id: "prod_1",
      sku: "SKU-001",
      name: "Laptop Computer",
      description: "High-performance laptop",
      category: "electronics",
      price: 1299.99,
      quantity: 15,
      minStockLevel: 5,
      maxStockLevel: 30,
      unit: "piece",
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
      price: 299.99,
      quantity: 3,
      minStockLevel: 10,
      maxStockLevel: 50,
      unit: "piece",
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
  const now = new Date();
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
    updatedAt: new Date(),
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
export function getMovements(): StockMovement[] {
  return Array.from(db.movements.values());
}

/**
 * Get movements by product ID
 */
export function getMovementsByProductId(productId: string): StockMovement[] {
  return Array.from(db.movements.values()).filter(
    (m) => m.productId === productId,
  );
}

/**
 * Create movement (atomic operation with product update)
 */
export function createMovement(data: {
  productId: string;
  type: "inbound" | "outbound" | "adjustment" | "return";
  quantity: number;
  reference: string;
  notes: string;
  userId: string;
}): StockMovement | null {
  const product = db.products.get(data.productId);
  if (!product) return null;

  // Calculate quantity change
  let quantityChange = 0;
  switch (data.type) {
    case "inbound":
    case "return":
      quantityChange = data.quantity;
      break;
    case "outbound":
      quantityChange = -data.quantity;
      break;
    case "adjustment":
      quantityChange = data.quantity;
      break;
  }

  const previousQuantity = product.quantity;
  const newQuantity = previousQuantity + quantityChange;

  // Never allow negative stock
  if (newQuantity < 0) {
    return null;
  }

  // Atomic update
  product.quantity = newQuantity;
  product.updatedAt = new Date();
  db.products.set(product.id, product);

  const now = new Date();
  const movement: StockMovement = {
    id: `mov_${db.counters.movementId++}`,
    productId: data.productId,
    type: data.type,
    quantity: data.quantity,
    previousQuantity,
    newQuantity,
    reference: data.reference,
    notes: data.notes,
    userId: data.userId,
    createdAt: now,
    updatedAt: now,
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
