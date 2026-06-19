/**
 * app/api/admin/upload-signature/route.ts
 *
 * GET /api/admin/upload-signature  — Admin: generate Cloudinary signed upload params
 *
 * Security notes:
 *   - Admin JWT is verified (defense-in-depth on top of edge middleware).
 *   - CLOUDINARY_API_SECRET is NEVER returned to the client.
 *     Only the short-lived cryptographic signature is returned.
 *   - The `folder` query param is sanitized to allow only alphanumeric chars
 *     and forward slashes, preventing path traversal in Cloudinary.
 *   - Signature expires server-side after ~1 minute (Cloudinary enforces this).
 *   - Stack traces are never exposed in error responses.
 */

import { NextRequest, NextResponse } from 'next/server'

import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import { generateUploadSignature } from '@/lib/cloudinary'

/* Sanitize the folder param — only alphanumeric, hyphens, and forward slashes */
const SAFE_FOLDER_PATTERN = /^[a-zA-Z0-9_\-/]+$/

/* ── GET /api/admin/upload-signature ─────────────────────────── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth: verify admin JWT ──────────────────────────────────
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse and sanitize folder ───────────────────────────────
    const { searchParams } = request.nextUrl
    const rawFolder = searchParams.get('folder') ?? 'products'

    if (!SAFE_FOLDER_PATTERN.test(rawFolder)) {
      return NextResponse.json(
        { error: 'Invalid folder name. Only letters, numbers, hyphens, underscores, and slashes are allowed.' },
        { status: 400 }
      )
    }

    // ── Generate signature ──────────────────────────────────────
    const { signature, timestamp, apiKey, cloudName } = generateUploadSignature(rawFolder)

    return NextResponse.json(
      {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder: rawFolder,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/admin/upload-signature]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 })
  }
}
