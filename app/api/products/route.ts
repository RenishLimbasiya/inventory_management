import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct, initializeDatabase } from "@/lib/db";

/**
 * GET /api/products
 * Fetch products with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const searchParams = request.nextUrl.searchParams;

    const searchTerm = searchParams.get("search")?.toLowerCase() || "";
    const category = searchParams.get("category") || null;
    const minPrice = parseFloat(searchParams.get("minPrice") || "0") || 0;
    const maxPrice =
      parseFloat(searchParams.get("maxPrice") || "Infinity") || Infinity;
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";
    const isActive = searchParams.get("isActive") !== "false";
    const sortBy = (searchParams.get("sortBy") || "name") as
      | "name"
      | "price"
      | "quantity"
      | "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

    let filtered = getProducts();

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.sku.toLowerCase().includes(searchTerm),
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    filtered = filtered.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice,
    );

    if (lowStockOnly) {
      filtered = filtered.filter((p) => p.quantity <= p.minStockLevel);
    }

    if (isActive) {
      filtered = filtered.filter((p) => p.isActive);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "price":
          compareValue = a.price - b.price;
          break;
        case "quantity":
          compareValue = a.quantity - b.quantity;
          break;
        case "createdAt":
          compareValue =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return NextResponse.json({ data: filtered, success: true });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.sku || typeof body.sku !== "string") {
      return NextResponse.json(
        { success: false, error: "SKU is required and must be a string" },
        { status: 400 },
      );
    }

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required and must be a string" },
        { status: 400 },
      );
    }

    if (typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a number greater than 0" },
        { status: 400 },
      );
    }

    if (typeof body.quantity !== "number" || body.quantity < 0) {
      return NextResponse.json(
        { success: false, error: "Quantity must be a non-negative number" },
        { status: 400 },
      );
    }

    if (typeof body.minStockLevel !== "number" || body.minStockLevel < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "minStockLevel must be a non-negative number",
        },
        { status: 400 },
      );
    }

    // Check for SKU uniqueness
    const allProducts = getProducts();
    if (allProducts.some((p) => p.sku === body.sku)) {
      return NextResponse.json(
        { success: false, error: "SKU must be unique" },
        { status: 400 },
      );
    }

    const newProduct = createProduct({
      sku: body.sku,
      name: body.name,
      description: body.description || "",
      category: body.category || "other",
      price: body.price,
      quantity: body.quantity,
      minStockLevel: body.minStockLevel,
      maxStockLevel: body.maxStockLevel || body.quantity * 2,
      unit: body.unit || "piece",
      supplier: body.supplier || "",
      isActive: body.isActive !== false,
    });

    return NextResponse.json(
      { data: newProduct, success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
