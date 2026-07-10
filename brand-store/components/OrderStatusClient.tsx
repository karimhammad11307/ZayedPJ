'use client'

import Link from 'next/link'
import { Check, CheckCircle2, Clock, Copy, Package, PackageCheck } from 'lucide-react'
import { useState } from 'react'

type Status = 'pending' | 'confirmed' | 'shipped' | 'delivered'

interface OrderStatusClientProps {
  order: {
    status: Status
    total: number
    items: { name: string; size: string; color: string; quantity: number; price: number }[]
  }
  shortId: string
  waURL: string | null
  instapay: string
  vodafone: string
}

const STATUS_INDEX: Record<Status, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
}

const CONFIG = {
  pending: {
    Icon: Clock,
    color: 'text-mustard',
    title: 'Awaiting Payment',
    subtitle: 'Complete payment and confirm through WhatsApp.',
  },
  confirmed: {
    Icon: CheckCircle2,
    color: 'text-mint',
    title: 'Order Confirmed',
    subtitle: 'Your order is being prepared.',
  },
  shipped: {
    Icon: Package,
    color: 'text-forest',
    title: 'On Its Way',
    subtitle: 'Your order has been shipped.',
  },
  delivered: {
    Icon: PackageCheck,
    color: 'text-forest',
    title: 'Delivered',
    subtitle: 'Your order has arrived.',
  },
} as const

const STEPS: Status[] = ['pending', 'confirmed', 'shipped', 'delivered']
const STEP_LABELS = ['Placed', 'Confirmed', 'Shipped', 'Delivered']

export default function OrderStatusClient({ order, shortId, waURL, instapay, vodafone }: OrderStatusClientProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const status = order.status ?? 'pending'
  const currentIndex = STATUS_INDEX[status] ?? 0
  const config = CONFIG[status] ?? CONFIG.pending
  const { Icon } = config
  const formattedTotal = `EGP ${order.total.toLocaleString('en-EG')}`

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="bg-cream min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading italic text-3xl text-forest">
            ZAYED
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-warm-lg p-8 relative overflow-hidden">
          {status === 'delivered' && (
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, index) => <span key={index} />)}
            </div>
          )}

          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-warm ${status === 'pending' ? 'animate-pulse' : ''}`}>
              <Icon size={34} strokeWidth={1.5} className={config.color} />
            </div>
            <h1 className="heading-editorial text-3xl mt-4">{config.title}</h1>
            <p className="text-brown-muted text-sm mt-1">{config.subtitle}</p>
            <p className="section-label text-brown-muted mt-4">Order #{shortId}</p>
          </div>

          <div className="relative flex justify-between mt-8">
            <div className="absolute left-8 right-8 top-4 h-px bg-brown/15" />
            <div
              className="absolute left-8 top-4 h-px bg-forest transition-all"
              style={{ width: `calc((100% - 4rem) * ${currentIndex / 3})` }}
            />
            {STEPS.map((step, index) => {
              const completed = index < currentIndex
              const current = index === currentIndex
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      completed
                        ? 'bg-forest text-cream'
                        : current
                          ? 'bg-terracotta text-cream ring-4 ring-terracotta/15 animate-pulse'
                          : 'bg-cream border border-brown/15 text-brown-muted'
                    }`}
                  >
                    {completed ? <Check size={14} /> : index + 1}
                  </span>
                  <span className="text-[10px] text-brown-muted">{STEP_LABELS[index]}</span>
                </div>
              )
            })}
          </div>

          <ul className="bg-cream-warm rounded-[12px] p-4 mt-6 space-y-3">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex justify-between gap-3">
                <div>
                  <p className="text-sm text-brown font-medium">{item.name}</p>
                  <p className="text-xs text-brown-muted">{item.size} · {item.color} · ×{item.quantity}</p>
                </div>
                <p className="text-sm text-terracotta whitespace-nowrap">
                  EGP {(item.price * item.quantity).toLocaleString('en-EG')}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-baseline mt-5">
            <p className="section-label">Total</p>
            <p className="font-heading italic text-2xl text-brown">{formattedTotal}</p>
          </div>

          {status === 'pending' && (
            <div className="bg-mint/8 border border-mint/20 rounded-[16px] p-5 mt-6">
              <p className="section-label text-mint mb-3">Complete Payment</p>
              {[
                ['InstaPay', instapay, '💳'],
                ['Vodafone Cash', vodafone, '📱'],
              ].filter(([, value]) => value).map(([label, value, icon]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2">
                  <p className="font-body font-medium text-brown">{icon} {label}: {value}</p>
                  <button
                    type="button"
                    onClick={() => copyValue(label, value)}
                    className="text-xs text-mint hover:text-forest inline-flex items-center gap-1"
                  >
                    <Copy size={13} />
                    {copied === label ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
              {waURL && (
                <a href={waURL} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-4">
                  Confirm via WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
