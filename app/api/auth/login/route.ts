import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Initiates authentication by setting inventory_token cookie
 *
 * Request body:
 * {
 *   warehouseName?: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   warehouseName: string,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const warehouseName = body.warehouseName || "Default Warehouse";

    // Generate auth token (in production, use proper JWT signing)
    const token = Buffer.from(
      JSON.stringify({
        warehouseName,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    ).toString("base64");

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        warehouseName,
        message: `Welcome to ${warehouseName}!`,
      },
      { status: 200 },
    );

    // Set authentication cookie
    // httpOnly: true prevents JavaScript access (security)
    // secure: true requires HTTPS (set to false in development if needed)
    // sameSite: 'strict' prevents CSRF attacks
    // maxAge: 24 hours
    response.cookies.set("inventory_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 400 },
    );
  }
}

/**
 * POST /api/auth/logout
 * Clears authentication cookie
 */
export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 },
  );

  response.cookies.delete("inventory_token");

  return response;
}
