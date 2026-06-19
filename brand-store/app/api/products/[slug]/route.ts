/**
 * app/api/products/[slug]/route.ts
 *
 * GET    /api/products/:slug  — Public:  return single active product
 * PATCH  /api/products/:slug  — Admin:   partial update
 * DELETE /api/products/:slug  — Admin:   soft delete (isActive = false)
 *
 * Security notes:
 *   - PATCH and DELETE verify JWT from HttpOnly cookie (defense-in-depth).
 *   - _id can never be changed via PATCH.
 *   - Slug is regenerated server-side if name changes; never from client input.
 *   - Stack traces are never exposed in error responses.
 */

import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'

import connectDB from '@/lib/mongodb'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import Product from '@/models/Product'

/* ── Types ────────────────────────────────────────────────────── */
interface RouteParams {
  params: Promise<{ slug: string }>
}

/* ── Helpers ──────────────────────────────────────────────────── */

/**
 * Generate a unique slug, excluding the document currently being updated.
 */
async function generateUniqueSlug(name: string, excludeId: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, trim: true })

  let candidate = base
  let suffix = 2

  while (true) {
    const existing = await Product.exists({ slug: candidate, _id: { $ne: excludeId } })
    if (!existing) break
    candidate = `${base}-${suffix}`
    suffix++
  }

  return candidate
}

/** Read and verify admin JWT from cookie. Returns null on failure. */
async function getAdminPayload(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

/* ── GET /api/products/:slug ──────────────────────────────────── */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await connectDB()

    const { slug } = await params

    const product = await Product.findOne({ slug, isActive: true }).lean()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/products/:slug]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

/* ── PATCH /api/products/:slug ────────────────────────────────── */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ── Auth ────────────────────────────────────────────────────
    const admin = await getAdminPayload(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { slug } = await params

    const product = await Product.findOne({ slug })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()

    // ── Never allow _id to be changed ──────────────────────────
    delete body._id
    delete body.__v

    // ── Regenerate slug if name is being changed ───────────────
    if (body.name && body.name !== product.name) {
      body.slug = await generateUniqueSlug(body.name, String(product._id))
    }

    // ── Apply partial update ────────────────────────────────────
    Object.assign(product, body)
    await product.save()

    return NextResponse.json({ product }, { status: 200 })
  } catch (err) {
    const error = err as Error & { code?: number }
    console.error('[PATCH /api/products/:slug]', error.message)

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

/* ── DELETE /api/products/:slug ───────────────────────────────── */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ── Auth ────────────────────────────────────────────────────
    const admin = await getAdminPayload(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { slug } = await params

    const product = await Product.findOneAndUpdate(
      { slug },
      { isActive: false },
      { returnDocument: 'after' }
    )

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Product deactivated successfully', productId: product._id },
      { status: 200 }
    )
  } catch (err) {
    console.error('[DELETE /api/products/:slug]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to deactivate product' }, { status: 500 })
  }
}
