/**
 * lib/auth.ts
 *
 * JWT helpers using `jose` — the only JWT library that works
 * in Next.js Edge Runtime (middleware.ts).
 *
 * Security rules enforced:
 *   - Algorithm is HARDCODED to HS256; never derived from token.
 *   - 'none' algorithm is never accepted (jose rejects it by default).
 *   - 'exp' claim is set on every token and validated on verify.
 *   - JWT_SECRET is read from env only; if absent we fail loudly in production.
 *     In dev-only environments (NODE_ENV !== 'production') we fall back to a
 *     random ephemeral secret and log a SEVERE warning — this ensures single-
 *     instance dev sessions still work but horizontal scaling is impossible.
 *   - Tokens are stored in HttpOnly, Secure, SameSite=Lax cookies (set by
 *     the route handler, not here).
 *
 * TODO(security): Consider MFA for the admin login flow.
 * TODO(security): Implement OAuth provider as an alternative to password auth.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
// NOTE: Using Web Crypto API (globalThis.crypto) instead of Node.js 'crypto'
// so this module works in both Edge Runtime (middleware) and Node.js (route handlers).

/* ── Secret resolution: Env → random ephemeral (dev only) ── */
function resolveSecret(): Uint8Array {
  const envSecret = process.env.JWT_SECRET

  if (envSecret) {
    return new TextEncoder().encode(envSecret)
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[auth] JWT_SECRET environment variable is not set in production. ' +
      'Add it to your Vercel project settings.'
    )
  }

  // Dev-only ephemeral fallback
  console.warn(
    '[auth] WARNING: JWT_SECRET not set. Using ephemeral random secret. ' +
    'Sessions will be invalidated on server restart. ' +
    'This is ONLY acceptable in local development.'
  )
  return globalThis.crypto.getRandomValues(new Uint8Array(32))
}

// Resolved once at module load; stable for the process lifetime.
const SECRET = resolveSecret()

export interface AdminTokenPayload extends JWTPayload {
  role: 'admin'
  email: string
}

/**
 * Sign a JWT for an authenticated admin.
 * Expires in 7 days as specified in the project brief.
 */
export async function signToken(payload: { email: string }): Promise<string> {
  return new SignJWT({ role: 'admin', email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

/**
 * Verify a JWT and return the typed payload.
 * Returns null if the token is missing, expired, or invalid.
 * Never throws to the caller — fails closed.
 */
export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<AdminTokenPayload>(token, SECRET, {
      algorithms: ['HS256'], // Hardcoded; rejects 'none' and any other alg
    })
    return payload
  } catch {
    // Do NOT log the token itself — only a safe message
    return null
  }
}

/* ── Cookie name ── */
// Using __Host- prefix enforces: Secure flag, no Domain, Path=/ — strongest cookie hardening.
export const AUTH_COOKIE_NAME = '__Host-admin-token'
