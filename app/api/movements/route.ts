import { NextRequest, NextResponse } from "next/server";
import {
  getMovementsByProductId,
  createMovement,
  initializeDatabase,
  getMovements,
} from "@/lib/db";

/**
 * GET /api/movements
 * Fetch movements with optional product filter
 */
export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const limit = searchParams.get("limit");

    let movements;

    if (productId) {
      movements = getMovementsByProductId(productId);
    } else {
      movements = getMovements();
    }

    // Sort by date descending (most recent first)
    movements.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Apply limit if specified
    if (limit) {
      movements = movements.slice(0, parseInt(limit));
    }

    return NextResponse.json({ data: movements, success: true });
  } catch (error) {
    console.error("GET /api/movements error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/movements
 * Record a stock movement (atomically updates product quantity)
 *
 * Rules:
 * - Never allow negative stock
 * - Compute previous + new quantity atomically
 * - Update product quantity in transaction
 */
export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    const body = await request.json();

    const { productId, type, quantity, reference, notes, userId } = body as {
      productId: string;
      type: "inbound" | "outbound" | "adjustment" | "return";
      quantity: number;
      reference: string;
      notes: string;
      userId: string;
    };

    // Validation
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 },
      );
    }

    if (!["inbound", "outbound", "adjustment", "return"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid movement type" },
        { status: 400 },
      );
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity must be a positive number" },
        { status: 400 },
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    // Create movement (atomic operation)
    const movement = createMovement({
      productId,
      type,
      quantity,
      reference,
      notes,
      userId,
    });

    if (!movement) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to record movement. Product not found or would result in negative inventory.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { data: movement, success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/movements error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
