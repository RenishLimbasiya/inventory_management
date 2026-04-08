# Inventory System - Middleware & Authentication

## Overview

This system uses Next.js middleware for request validation, logging, and security headers.

## Middleware Features

### 1. **Cookie Validation (inventory_token)**

- **Protected Routes**: `/products`, `/alerts`, `/movements`
- **Authentication Flow**:
  - User visits protected route without token
  - Middleware redirects to `/login?redirect=/original-path`
  - User clicks "Enter Dashboard" to initialize token
  - Login API sets `inventory_token` cookie (httpOnly, secure, 24hr)
  - User redirected to original path with valid token

### 2. **Request Logging**

The middleware logs all requests with:

- **Timestamp**: ISO 8601 format
- **Path**: Request URL path
- **Method**: HTTP method (GET, POST, etc.)
- **IP Address**: Client IP (respects X-Forwarded-For header)
- **User Agent**: Browser/client info
- **Authentication**: Whether valid token exists

**Access logs via**:

```bash
GET /api/admin/logs
GET /api/admin/logs?limit=50
GET /api/admin/logs?path=/products&authenticated=true
GET /api/admin/logs?method=POST
GET /api/admin/logs?minutes=5  # Last 5 minutes
```

### 3. **Security Headers**

Added to all responses:

- `X-Warehouse-Request: true` - Marks as warehouse system request
- `X-Request-IP` - Client IP address
- `X-Request-Time` - Request timestamp
- `X-Authenticated` (if authenticated) - Token exists
- `Authorization` (if authenticated) - Bearer token

## Setup Instructions

### Development

1. **No setup required** - Middleware works out of the box
2. Visit protected routes (e.g., `/products`)
3. Redirect to `/login` automatically triggers
4. Click "Enter Dashboard" to set token

### Production

1. **Enable secure cookies** (default): Already enabled via `NODE_ENV=production`
2. **HTTPS required** - Set `secure: true` in cookie options (automatic in production)
3. **Implement real authentication**:
   - Replace `/api/auth/login` with OAuth/JWT provider
   - Validate credentials before setting token
   - Use signed/encrypted tokens (HS256 or RS256)

4. **Protect admin logs endpoint**:

```typescript
// In app/api/admin/logs/route.ts - add authentication check:
const token = request.cookies.get("inventory_token");
if (!token || !isValidAdminUser(token)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

5. **Configure environment variables**:

```env
# .env.local
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Cookie Format

### Development

```json
{
  "warehouseName": "My Warehouse",
  "issuedAt": "2026-04-08T12:00:00Z",
  "expiresAt": "2026-04-09T12:00:00Z"
}
```

_(Base64 encoded)_

### Production

Replace with JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNjI2MDAwMDAwfQ.signature
```

## API Routes

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "warehouseName": "My Warehouse"
}

Response:
{
  "success": true,
  "warehouseName": "My Warehouse",
  "message": "Welcome to My Warehouse!"
}
```

Sets `inventory_token` cookie (httpOnly, secure, 24h)

### Logout

```
DELETE /api/auth/login

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

Clears `inventory_token` cookie

### Request Logs

```
GET /api/admin/logs

Query Parameters:
- limit: number (default: 100)
- path: string (filter by path)
- method: string (GET|POST|PUT|DELETE)
- authenticated: 'true'|'false'
- minutes: number (logs from N minutes ago)

Response:
{
  "success": true,
  "count": 42,
  "criteria": { "method": "POST" },
  "logs": [...]
}
```

## File Structure

```
middleware.ts                          # Main middleware logic
├─ getRequestLogs()                   # Retrieve recent logs
├─ filterRequestLogs()                # Filter logs by criteria
└─ logRequest()                       # Internal logging

app/
├─ login/page.tsx                     # Login page
└─ api/
   ├─ auth/login/route.ts             # Login/logout endpoints
   └─ admin/logs/route.ts             # Log retrieval API
```

## Request Flow Diagram

```
User Request
    ↓
middleware.ts (runs before route)
    ├─ Check inventory_token cookie
    ├─ If protected route + no token → Redirect /login
    ├─ Log request (path, method, IP, auth status)
    ├─ Add security headers
    └─ Pass to route
    ↓
Route Handler / API
    ├─ Can access headers added by middleware
    ├─ Can log from request headers
    └─ Response sent to client
```

## Security Considerations

### ✅ Current Implementation

- httpOnly cookies prevent XSS attacks
- Secure flag requires HTTPS in production
- SameSite=strict prevents CSRF
- All protected routes require valid token
- IP logging for abuse detection
- Request logs in memory (rotate every 1000 entries)

### ⚠️ Production Recommendations

1. **Token validation**: Verify signature/expiration
2. **Rate limiting**: Implement on auth endpoints
3. **External logging**: Use Datadog, LogRocket, or similar
4. **Admin access**: Require role-based access to /api/admin/logs
5. **Token rotation**: Refresh tokens after set duration
6. **Database**: Store sessions/tokens in database (not cookie alone)
7. **Monitoring**: Alert on suspicious patterns (multiple IPs, failed auth)

## Testing

### Test protected route redirect

```bash
curl -i http://localhost:3000/products
# Should return 307 redirect to /login
```

### Test with token

```bash
# First, get a token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"warehouseName":"Test"}'

# Now access protected route (cookie auto-included)
curl http://localhost:3000/products
# Should return 200 OK
```

### View logs

```bash
# All logs
curl http://localhost:3000/api/admin/logs

# Filter by method
curl http://localhost:3000/api/admin/logs?method=POST

# Last 10 minutes
curl http://localhost:3000/api/admin/logs?minutes=10
```

## Troubleshooting

### "Could not find module" error

- Ensure `middleware.ts` is in project root (same level as `next.config.ts`)

### Cookies not persisting

- Development: Ensure cookies domain matches (localhost)
- Production: Check `secure: true`, `sameSite`, and HTTPS

### Logs not appearing

- Check browser console for errors
- Verify middleware matcher pattern in config
- Check API route accessible at `/api/admin/logs`

### Always redirects to login

- Check cookie storage: `Application → Cookies → localhost`
- Verify middleware `PROTECTED_ROUTES` list matches attempts
- Check redirect loop: might be redirecting /login → /login

## Next Steps

- **MODULE 13**: Production polish, cross-slice updates, theme testing, charts functional
