/**
 * app/api/admin/products/route.ts
 *
 * GET /api/admin/products  — Admin: return ALL products, including inactive ones
 *
 * This is separate from the public GET /api/products which filters isActive: true.
 * The admin dashboard needs to see and manage all products regardless of status.
 *
 * Security notes:
 *   - Admin JWT is verified (defense-in-depth on top of edge middleware).
 *   - Stack traces are never exposed in error responses.
 *   - lean() is used for performance.
 */

import { NextRequest, NextResponse } from 'next/server'

import connectDB from '@/lib/mongodb'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import Product from '@/models/Product'

/* ── GET /api/admin/products ──────────────────────────────────── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth ────────────────────────────────────────────────────
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const status   = searchParams.get('status') // 'active' | 'inactive'

    // Build filter — NO isActive restriction (admin sees everything)
    const filter: Record<string, unknown> = {}

    if (category) {
      const ALLOWED_CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear']
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category. Must be one of: tops, bottoms, dresses, outerwear' },
          { status: 400 }
        )
      }
      filter.category = category
    }

    // Optional status filter for admin convenience
    if (status === 'active')   filter.isActive = true
    if (status === 'inactive') filter.isActive = false

    const products = await Product
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ products }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/admin/products]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
