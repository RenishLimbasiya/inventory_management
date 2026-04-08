import { NextRequest, NextResponse } from "next/server";

/**
 * Request Log Entry
 */
interface RequestLog {
  timestamp: string;
  path: string;
  method: string;
  ip: string;
  userAgent?: string;
  authenticated: boolean;
}

/**
 * In-memory request logs
 * In production, use an external logging service
 */
const requestLogs: RequestLog[] = [];

/**
 * Protected routes that require authentication
 * Public routes are: /, /login, /api/auth/*
 */
const PROTECTED_ROUTES = ["/products", "/alerts", "/movements"];

/**
 * Get user's IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";
  return ip;
}

/**
 * Log request details
 */
function logRequest(log: RequestLog): void {
  requestLogs.push(log);

  // Keep only last 1000 logs in memory
  if (requestLogs.length > 1000) {
    requestLogs.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[${log.timestamp}] ${log.method} ${log.path} - IP: ${log.ip} - Auth: ${log.authenticated}`,
    );
  }
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Next.js Middleware
 * Handles:
 * - Cookie validation (inventory_token)
 * - Request header injection (X-Warehouse-Request)
 * - Request logging (path, method, timestamp, IP)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const inventoryToken = request.cookies.get("inventory_token")?.value;
  const isProtected = isProtectedRoute(pathname);

  // Log request details
  const clientIp = getClientIp(request);
  const requestLog: RequestLog = {
    timestamp: new Date().toISOString(),
    path: pathname,
    method: request.method,
    ip: clientIp,
    userAgent: request.headers.get("user-agent") || undefined,
    authenticated: !!inventoryToken,
  };

  logRequest(requestLog);

  // If protected route and no token, redirect to login or home
  if (isProtected && !inventoryToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Create response (clone request to preserve body for streaming)
  const response = NextResponse.next();

  // Add custom header to all requests
  response.headers.set("X-Warehouse-Request", "true");
  response.headers.set("X-Request-IP", clientIp);
  response.headers.set("X-Request-Time", new Date().toISOString());

  // Pass authentication status to downstream
  if (inventoryToken) {
    response.headers.set("X-Authenticated", "true");
    response.headers.set("Authorization", `Bearer ${inventoryToken}`);
  }

  return response;
}

/**
 * Middleware matcher - run on specific paths
 * Excludes: _next, api (handled separately), static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

/**
 * Export request logs for debugging/monitoring
 * Can be called from an API route to retrieve logs
 * Usage: import { getRequestLogs } from '@/middleware'
 */
export function getRequestLogs(limit: number = 100): RequestLog[] {
  return requestLogs.slice(-limit);
}

/**
 * Export request log filtering utility
 * Usage: filter logs by criteria
 */
export function filterRequestLogs(criteria: {
  path?: string;
  method?: string;
  authenticated?: boolean;
  minutesAgo?: number;
}): RequestLog[] {
  let filtered = [...requestLogs];

  if (criteria.path) {
    filtered = filtered.filter((log) => log.path.includes(criteria.path!));
  }

  if (criteria.method) {
    filtered = filtered.filter((log) => log.method === criteria.method);
  }

  if (criteria.authenticated !== undefined) {
    filtered = filtered.filter(
      (log) => log.authenticated === criteria.authenticated,
    );
  }

  if (criteria.minutesAgo) {
    const cutoffTime = new Date(Date.now() - criteria.minutesAgo * 60 * 1000);
    filtered = filtered.filter((log) => new Date(log.timestamp) > cutoffTime);
  }

  return filtered;
}
