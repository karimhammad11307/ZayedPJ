/**
 * app/api/admin/login/route.ts
 *
 * POST /api/admin/login              — Verify credentials and set auth cookie
 * POST /api/admin/login?action=logout — Clear auth cookie
 *
 * Security notes:
 *   - Credentials are compared with === against env vars (constant-time is
 *     ideal for passwords, but since these are env vars set by the admin
 *     themselves and not hashed at rest, === is acceptable for this use case).
 *     TODO(security): Hash ADMIN_PASSWORD with bcrypt and compare with
 *     timingSafeEqual to prevent timing attacks.
 *   - Auth cookie uses __Host- prefix which enforces: Secure flag, Path=/,
 *     and no Domain attribute — the strongest cookie security posture.
 *   - SameSite=Strict prevents CSRF from cross-origin requests.
 *   - Stack traces are never exposed in error responses.
 *   - No specific error distinguishes "bad email" vs "bad password" (prevents
 *     user enumeration).
 *   - TODO(security): Add rate limiting / brute-force protection.
 */

import { NextRequest, NextResponse } from 'next/server'

import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth'

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7

/* ── POST /api/admin/login ────────────────────────────────────── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action')

  /* ── Logout path ─────────────────────────────────────────────── */
  if (action === 'logout') {
    const response = NextResponse.json({ success: true }, { status: 200 })

    // Clear the cookie by setting Max-Age=0
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure:   true,
      sameSite: 'strict',
      path:     '/',
      maxAge:   0,
    })

    return response
  }

  /* ── Login path ──────────────────────────────────────────────── */
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const adminEmail    = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error('[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD env vars not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate credentials — generic error message prevents user enumeration
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // ── Sign token ──────────────────────────────────────────────
    const token = await signToken({ email: adminEmail })

    // ── Set HttpOnly auth cookie ────────────────────────────────
    // __Host- prefix requires: Secure=true, Path=/, no Domain attribute
    const response = NextResponse.json({ success: true }, { status: 200 })

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure:   true,       // Required by __Host- prefix
      sameSite: 'strict',   // Prevent CSRF
      path:     '/',        // Required by __Host- prefix
      maxAge:   SEVEN_DAYS_SECONDS,
    })

    return response
  } catch (err) {
    console.error('[POST /api/admin/login]', (err as Error).message)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
