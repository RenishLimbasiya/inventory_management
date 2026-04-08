import { NextRequest, NextResponse } from "next/server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  getProducts,
  initializeDatabase,
} from "@/lib/db";

/**
 * GET /api/products/[id]
 * Fetch a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    initializeDatabase();
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: product, success: true });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update an existing product
 * Updates the updatedAt timestamp
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    initializeDatabase();
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Validate fields that are provided
    if (body.price !== undefined && body.price <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be greater than 0" },
        { status: 400 },
      );
    }

    if (body.quantity !== undefined && body.quantity < 0) {
      return NextResponse.json(
        { success: false, error: "Quantity cannot be negative" },
        { status: 400 },
      );
    }

    if (body.minStockLevel !== undefined && body.minStockLevel < 0) {
      return NextResponse.json(
        { success: false, error: "minStockLevel cannot be negative" },
        { status: 400 },
      );
    }

    // Check SKU uniqueness if SKU is being changed
    if (body.sku && body.sku !== product.sku) {
      const allProducts = getProducts();
      if (allProducts.some((p) => p.sku === body.sku)) {
        return NextResponse.json(
          { success: false, error: "SKU must be unique" },
          { status: 400 },
        );
      }
    }

    const updated = updateProduct(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update product" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updated, success: true });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product and cascade delete its movements
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    initializeDatabase();
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const deleted = deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete product" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
