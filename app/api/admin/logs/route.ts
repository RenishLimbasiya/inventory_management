import { NextRequest, NextResponse } from "next/server";
import { getRequestLogs, filterRequestLogs } from "@/middleware";

/**
 * GET /api/admin/logs
 * Returns request logs from middleware
 * Query params:
 * - limit: number (default: 100)
 * - path: string (filter by path)
 * - method: string (filter by method: GET|POST|PUT|DELETE)
 * - authenticated: 'true'|'false' (filter by auth status)
 * - minutes: number (logs from last N minutes)
 *
 * ⚠️ In production, add authentication checks
 */
export function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const limit = parseInt(searchParams.get("limit") || "100");
    const path = searchParams.get("path");
    const method = searchParams.get("method");
    const authenticatedStr = searchParams.get("authenticated");
    const minutesAgo = parseInt(searchParams.get("minutes") || "0");

    // Build filter criteria
    const criteria: {
      path?: string;
      method?: string;
      authenticated?: boolean;
      minutesAgo?: number;
    } = {};

    if (path) criteria.path = path;
    if (method) criteria.method = method.toUpperCase();
    if (authenticatedStr) {
      criteria.authenticated = authenticatedStr === "true";
    }
    if (minutesAgo > 0) criteria.minutesAgo = minutesAgo;

    // Get logs
    const hasCriteria = Object.keys(criteria).length > 0;
    const logs = hasCriteria
      ? filterRequestLogs(criteria)
      : getRequestLogs(limit);

    return NextResponse.json({
      success: true,
      count: logs.length,
      criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
      logs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch logs",
      },
      { status: 500 },
    );
  }
}
