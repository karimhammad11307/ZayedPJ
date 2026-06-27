/**
 * app/api/orders/route.ts
 *
 * GET  /api/orders  — Admin:  list all orders (with optional ?status= filter)
 * POST /api/orders  — Public: create a new order
 *
 * Security notes:
 *   - GET verifies admin JWT (defense-in-depth on top of edge middleware).
 *   - Total is ALWAYS calculated server-side from live product prices.
 *     The client-submitted total is never used — prevents price manipulation.
 *   - sendReceiptEmail is fired non-blocking (void) so a mail failure never
 *     prevents order creation.
 *   - Stack traces are never exposed in error responses.
 */

import { NextRequest, NextResponse } from 'next/server'

import connectDB from '@/lib/mongodb'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { sendReceiptEmail } from '@/lib/resend'
import { buildWhatsAppURL } from '@/lib/whatsapp'
import type { IOrderItem } from '@/models/Order'

/* ── Helpers ──────────────────────────────────────────────────── */
async function getAdminPayload(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

/* ── GET /api/orders ──────────────────────────────────────────── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth ────────────────────────────────────────────────────
    const admin = await getAdminPayload(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')

    const ALLOWED_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered']
    const filter: Record<string, unknown> = {}

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: pending, confirmed, shipped, delivered' },
          { status: 400 }
        )
      }
      filter.status = status
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ orders }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/orders]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

/* ── POST /api/orders ─────────────────────────────────────────── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    const body = await request.json()

    // ── Validate top-level required fields ──────────────────────
    const required = ['customerName', 'email', 'phone', 'fulfillment', 'items']
    const missing  = required.filter((f) => !body[f])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'items must be a non-empty array' }, { status: 400 })
    }

    if (!body.fulfillment?.type) {
      return NextResponse.json({ error: 'fulfillment.type is required' }, { status: 400 })
    }

    // ── Validate individual item fields ─────────────────────────
    for (const [i, item] of body.items.entries()) {
      if (!item.productId || !item.size || !item.color || !item.quantity) {
        return NextResponse.json(
          { error: `Item at index ${i} is missing required fields (productId, size, color, quantity)` },
          { status: 400 }
        )
      }
    }

    // ── Server-side total calculation + stock validation ────────
    // Fetch all referenced products in ONE query (as mutable docs so we can .save())
    const productIds  = Array.from(new Set<string>(body.items.map((i: IOrderItem) => i.productId)))
    const productDocs = await Product.find({ _id: { $in: productIds }, isActive: true })
    const productMap  = new Map(productDocs.map((p) => [String(p._id), p]))

    const enrichedItems: IOrderItem[] = []
    let serverTotal = 0

    for (const [i, item] of body.items.entries()) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product with id "${item.productId}" (item index ${i}) not found or inactive` },
          { status: 400 }
        )
      }

      // ── Stock capacity check ─────────────────────────────────
      const variant = product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      )
      if (!variant) {
        return NextResponse.json(
          { error: `Variant (${item.size} / ${item.color}) not found for "${product.name}"` },
          { status: 400 }
        )
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `"${product.name}" (${item.size} / ${item.color}) only has ${variant.stock} item(s) left in stock.`,
            outOfStock: true,
          },
          { status: 409 }
        )
      }

      const lineTotal = product.price * item.quantity
      serverTotal += lineTotal

      enrichedItems.push({
        productId: item.productId,
        name:      product.name,  // Always use DB name, never trust client
        price:     product.price, // Always use DB price, never trust client
        size:      item.size,
        color:     item.color,
        quantity:  item.quantity,
      })
    }

    // ── Create the order ────────────────────────────────────────
    const order = await Order.create({
      customerName: body.customerName,
      email:        body.email,
      phone:        body.phone,
      fulfillment:  body.fulfillment,
      items:        enrichedItems,
      total:        serverTotal, // Server-calculated, not client-submitted
      status:       'pending',
    })

    // ── Deduct stock immediately on order placement ──────────────
    // Stock is reserved as soon as the customer places the order,
    // preventing overselling even before admin confirms.
    for (const item of enrichedItems) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const variant = product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      )
      if (!variant) continue

      variant.stock = Math.max(0, variant.stock - item.quantity)

      // If every variant is now at 0, auto-deactivate the product
      const allOutOfStock = product.variants.every((v) => v.stock === 0)
      if (allOutOfStock) {
        product.isActive   = false
        product.isFeatured = false
        console.log(`[stock] "${product.name}" is now out of stock — marked inactive.`)
      }

      await product.save()
    }

    // ── Fire receipt email — non-blocking ───────────────────────
    void sendReceiptEmail({
      orderId:      String(order._id),
      customerName: order.customerName,
      email:        order.email,
      items:        order.items.map((item) => ({
        name:     item.name,
        size:     item.size,
        color:    item.color,
        quantity: item.quantity,
        price:    item.price,
      })),
      total:       order.total,
      fulfillment: order.fulfillment,
    }).catch((e: Error) =>
      console.error('[orders] Non-blocking email failed:', e.message)
    )

    // ── Build WhatsApp URL ──────────────────────────────────────
    const whatsappURL = buildWhatsAppURL({
      orderId:      String(order._id),
      customerName: order.customerName,
      phone:        order.phone,
      fulfillment:  order.fulfillment,
      items:        order.items.map((item) => ({
        name:     item.name,
        size:     item.size,
        color:    item.color,
        quantity: item.quantity,
        price:    item.price,
      })),
      total: order.total,
    })

    return NextResponse.json(
      { orderId: order._id, whatsappURL },
      { status: 201 }
    )
  } catch (err) {
    const error = err as Error
    console.error('[POST /api/orders]', error.message)

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
