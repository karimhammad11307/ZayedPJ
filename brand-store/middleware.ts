/**
 * middleware.ts
 *
 * Edge middleware protecting all /admin and /api/admin routes.
 *
 * Security rules:
 *   - Runs in Next.js Edge Runtime (uses `jose`, not `jsonwebtoken`).
 *   - /admin/login is explicitly allowed through (no token required).
 *   - All other /admin/* and /api/admin/* routes require a valid JWT.
 *   - Token is read from the __Host-admin-token HttpOnly cookie only.
 *   - On missing or invalid token → redirect to /admin/login (fail-closed).
 *   - Algorithm is hardcoded to HS256 inside verifyToken(); never derived
 *     from the token header.
 *   - CSRF: Next.js App Router mutations go through Server Actions or
 *     Route Handlers. State-changing API routes MUST validate the JWT token
 *     from the HttpOnly cookie (done here) AND implement CSRF double-submit
 *     cookie validation in each mutating route handler.
 *     TODO(security): Add CSRF double-submit cookie validation to all
 *     admin API route handlers that perform POST/PUT/DELETE/PATCH.
 *   - TODO(security): Add rate limiting to /api/admin/login to prevent
 *     brute-force attacks (e.g., Vercel Edge Config + Upstash Redis).
 *   - TODO(security): Consider MFA for admin authentication.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'

/* Routes that must never be blocked */
const PUBLIC_ADMIN_PATHS = [
  '/admin/login',      // Admin login page (UI)
  '/api/admin/login',  // Admin login API — must be reachable before a token exists
]

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  /* ── Allow the login page through ── */
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  /* ── Retrieve token from HttpOnly cookie ── */
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return redirectToLogin(request)
  }

  /* ── Verify token (hardcoded HS256, checks exp claim) ── */
  const payload = await verifyToken(token)

  if (!payload || payload.role !== 'admin') {
    return redirectToLogin(request)
  }

  /* ── Pass through with admin identity header (for route handlers) ── */
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-admin-email', payload.email)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/admin/login', request.url)
  // Preserve the intended destination so we can redirect back after login
  loginUrl.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

/* ── Route matcher ── */
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
