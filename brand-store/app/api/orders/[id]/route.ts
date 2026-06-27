import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

import connectDB from '@/lib/mongodb'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import Order from '@/models/Order'

/* ── Types ────────────────────────────────────────────────────── */
interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'] as const
type OrderStatus = typeof VALID_STATUSES[number]

/* ── Helpers ──────────────────────────────────────────────────── */
async function getAdminPayload(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id)
}

/* ── GET /api/orders/:id ──────────────────────────────────────── */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await connectDB()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const order = await Order.findById(id).lean()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/orders/:id]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

/* ── PATCH /api/orders/:id ────────────────────────────────────── */
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

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const body = await request.json()

    // ── Validate status ─────────────────────────────────────────
    const { status } = body
    if (!status) {
      return NextResponse.json({ error: 'status field is required' }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // ── Update ONLY the status field ────────────────────────────
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/orders/:id]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}


/* ── DELETE /api/orders/:id ───────────────────────────────────── */
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
    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const order = await Order.findByIdAndDelete(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[DELETE /api/orders/:id]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
