/**
 * app/api/products/route.ts
 *
 * GET  /api/products  — Public: return all active products
 * POST /api/products  — Admin:  create a new product
 *
 * Security notes:
 *   - POST verifies JWT from HttpOnly cookie (defense-in-depth, middleware
 *     already blocks unauthenticated requests at the edge).
 *   - Slug is auto-generated server-side from name; never trusted from client.
 *   - Stack traces are never included in error responses.
 *   - lean() is used on GET to avoid hydrating full Mongoose documents.
 */

import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'

import connectDB from '@/lib/mongodb'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import Product from '@/models/Product'

/* ── Helpers ──────────────────────────────────────────────────── */

/**
 * Generate a unique slug from a product name.
 * If the base slug already exists, appends -2, -3, … until unique.
 */
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, trim: true })

  let candidate = base
  let suffix = 2

  while (true) {
    const query: Record<string, unknown> = { slug: candidate }
    if (excludeId) query._id = { $ne: excludeId }

    const existing = await Product.exists(query)
    if (!existing) break

    candidate = `${base}-${suffix}`
    suffix++
  }

  return candidate
}

/* ── GET /api/products ────────────────────────────────────────── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const featured  = searchParams.get('featured')

    // Build filter — always restrict to active products on this public route
    const filter: Record<string, unknown> = { isActive: true }

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

    if (featured === 'true') {
      filter.isFeatured = true
    }

    const products = await Product
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ products }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/products]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

/* ── POST /api/products ───────────────────────────────────────── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth: verify admin JWT from cookie ──────────────────────
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // ── Validate required fields ────────────────────────────────
    const required = ['name', 'price', 'category', 'images', 'variants', 'description']
    const missing  = required.filter((f) => body[f] === undefined || body[f] === null || body[f] === '')
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json({ error: 'images must be a non-empty array' }, { status: 400 })
    }

    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json({ error: 'variants must be a non-empty array' }, { status: 400 })
    }

    // ── Generate unique slug ────────────────────────────────────
    const slug = await generateUniqueSlug(body.name)

    // ── Create product ──────────────────────────────────────────
    const product = await Product.create({
      name:        body.name,
      slug,
      description: body.description,
      price:       body.price,
      category:    body.category,
      images:      body.images,
      variants:    body.variants,
      isFeatured:  body.isFeatured ?? false,
      isActive:    true, // Always active on creation
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    const error = err as Error & { code?: number }
    console.error('[POST /api/products]', error.message)

    // Mongoose validation errors → 400
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    // Duplicate key (slug race condition) → 409
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
