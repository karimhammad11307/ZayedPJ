import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Footer from '@/components/Footer'
import OrderStatusClient from '@/components/OrderStatusClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Order #${id.slice(-6).toUpperCase()} | ZAYED` }
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { id } = await params
  await connectDB()

  const rawOrder = await Order.findById(id).lean().catch(() => null)
  if (!rawOrder) notFound()

  const order = JSON.parse(JSON.stringify(rawOrder))
  const shortId = id.slice(-6).toUpperCase()
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, '') ?? ''
  const waMessage = encodeURIComponent(`Hi! I've paid for order #${shortId}. Please confirm my order.`)
  const waURL = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null

  return (
    <>
      <OrderStatusClient
        order={{
          status: order.status ?? 'pending',
          total: order.total,
          items: order.items,
        }}
        shortId={shortId}
        waURL={waURL}
        instapay={process.env.NEXT_PUBLIC_INSTAPAY_NUMBER ?? ''}
        vodafone={process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER ?? ''}
      />
      <Footer />
    </>
  )
}
