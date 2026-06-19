import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, CheckCircle, Package } from 'lucide-react'
import type { Metadata } from 'next'

import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Order #${id.slice(-6).toUpperCase()} | Brand Store` }
}

/* ── Status display config ── */
const STATUS_CONFIG = {
  pending: {
    Icon:        Clock,
    colorClass:  'text-mustard',
    bgClass:     'bg-mustard/10',
    title:       'Awaiting Payment',
    description: 'Your order is placed. Please complete your payment and send a screenshot on WhatsApp to confirm.',
  },
  confirmed: {
    Icon:        CheckCircle,
    colorClass:  'text-mint',
    bgClass:     'bg-mint/10',
    title:       'Order Confirmed',
    description: "We've received your payment and your order is being prepared.",
  },
  shipped: {
    Icon:        Package,
    colorClass:  'text-mint',
    bgClass:     'bg-mint/10',
    title:       'On Its Way',
    description: "Your order has been shipped and is on its way to you!",
  },
  delivered: {
    Icon:        CheckCircle,
    colorClass:  'text-forest',
    bgClass:     'bg-forest/10',
    title:       'Delivered',
    description: 'Your order has been delivered. We hope you love your pieces!',
  },
} as const

type OrderStatus = keyof typeof STATUS_CONFIG

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { id } = await params

  await connectDB()

  const rawOrder = await Order.findById(id).lean().catch(() => null)

  if (!rawOrder) notFound()

  const order = JSON.parse(JSON.stringify(rawOrder))

  const statusKey  = (order.status ?? 'pending') as OrderStatus
  const config     = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending
  const { Icon }   = config

  const shortId    = id.slice(-6).toUpperCase()
  const waNumber   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, '') ?? ''
  const waMessage  = encodeURIComponent(`Hi! I've paid for order #${shortId}. Please confirm my order. 🙏`)
  const waURL      = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null

  const instapay   = process.env.NEXT_PUBLIC_INSTAPAY_NUMBER   ?? ''
  const vodafone   = process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER ?? ''

  const formattedTotal = `EGP ${order.total.toLocaleString('en-EG')}`

  return (
    <>
      <div className="min-h-screen bg-cream py-16 px-6">
        <div className="max-w-lg mx-auto">

          {/* ── Brand logo ── */}
          <div className="text-center mb-10">
            <Link href="/" className="font-heading italic text-3xl text-mint hover:opacity-80 transition-opacity">
              Brand Store
            </Link>
          </div>

          {/* ── Status card ── */}
          <div className="bg-cream-light rounded-card p-8 shadow-card">

            {/* Status icon + title */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.bgClass} mb-4`}>
                <Icon size={32} strokeWidth={1.5} className={config.colorClass} />
              </div>
              <h1 className="font-heading italic text-3xl text-brown">{config.title}</h1>
              <p className="font-body text-brown-muted text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                {config.description}
              </p>
            </div>

            {/* Order ID */}
            <div className="mt-6">
              <p className="label-caps text-brown-muted">Order ID</p>
              <p className="font-body font-medium text-brown text-lg mt-0.5">#{shortId}</p>
            </div>

            <div className="border-t border-brown/10 my-5" />

            {/* Items */}
            <div>
              <p className="label-caps text-brown-muted mb-3">Items</p>
              <ul className="space-y-3">
                {order.items.map((item: { name: string; size: string; color: string; quantity: number; price: number }, i: number) => (
                  <li key={i} className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-body text-sm text-brown font-medium">{item.name}</p>
                      <p className="text-brown-muted text-xs">{item.size} · {item.color}</p>
                    </div>
                    <p className="font-body text-sm text-brown-muted whitespace-nowrap">
                      × {item.quantity} · EGP {(item.price * item.quantity).toLocaleString('en-EG')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-brown/10 my-5" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
              <p className="label-caps">Total</p>
              <p className="font-heading italic text-2xl text-brown">{formattedTotal}</p>
            </div>

            {/* ── Payment instructions (pending only) ── */}
            {statusKey === 'pending' && (
              <>
                <div className="border-t border-brown/10 my-5" />
                <div className="bg-mint/10 rounded-card p-4">
                  <p className="label-caps text-mint mb-3">Complete Your Payment</p>
                  <p className="font-body text-sm text-brown mb-3">
                    Send the total amount via:
                  </p>
                  {instapay && (
                    <div className="flex justify-between mb-1.5">
                      <span className="font-body text-sm text-brown-muted">InstaPay</span>
                      <span className="font-body font-medium text-brown text-sm">{instapay}</span>
                    </div>
                  )}
                  {vodafone && (
                    <div className="flex justify-between mb-3">
                      <span className="font-body text-sm text-brown-muted">VodafoneCash</span>
                      <span className="font-body font-medium text-brown text-sm">{vodafone}</span>
                    </div>
                  )}
                  <p className="font-body text-xs text-brown-muted mb-4 leading-relaxed">
                    After payment, send a screenshot on WhatsApp so we can confirm your order quickly.
                  </p>
                  {waURL && (
                    <a
                      href={waURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      Open WhatsApp
                    </a>
                  )}
                </div>
              </>
            )}

          </div>

          {/* ── Footer note ── */}
          {waURL && (
            <p className="text-center text-brown-muted text-sm mt-8">
              Questions?{' '}
              <a
                href={waURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mint hover:underline underline-offset-2 transition-colors"
              >
                Contact us on WhatsApp
              </a>
            </p>
          )}

        </div>
      </div>

      <Footer />
    </>
  )
}
