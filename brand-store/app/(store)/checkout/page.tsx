'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

import { useCart } from '@/context/CartContext'

/* ── Shared input style ── */
const INPUT_CLASS =
  'w-full border border-brown/20 rounded-card bg-cream-light px-4 py-3 font-body text-brown text-sm ' +
  'focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint ' +
  'placeholder:text-brown-muted/50 transition-colors duration-150'

const LABEL_CLASS = 'label-caps text-brown mb-1 block'

/* ── Field-level error helper ── */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-terracotta text-xs mt-1">{msg}</p>
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, hydrated, clearCart } = useCart()

  /* ── Form state ── */
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery')
  const [address,         setAddress]         = useState('')
  const [city,            setCity]            = useState('')
  const [notes,           setNotes]           = useState('')

  /* ── Submission state ── */
  const [errors,      setErrors]      = useState<Record<string, string>>({})
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /* ── Redirect to /shop if cart is empty after hydration ── */
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/shop')
    }
  }, [hydrated, items.length, router])

  /* ── Loading state while cart hydrates ── */
  if (!hydrated) {
    return <div className="min-h-screen bg-cream" />
  }

  /* ── Empty cart (will redirect momentarily) ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag size={64} strokeWidth={1} className="text-brown/20" />
        <p className="font-heading italic text-2xl text-brown/40 mt-4">Your cart is empty</p>
        <Link href="/shop" className="btn-primary mt-6">Start Shopping</Link>
      </div>
    )
  }

  /* ── Validation ── */
  function validateForm(): boolean {
    const e: Record<string, string> = {}

    if (!name.trim())  e.name  = 'Full name is required'
    if (!email.trim()) e.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!phone.trim()) e.phone = 'Phone number is required'

    if (fulfillmentType === 'delivery') {
      if (!address.trim()) e.address = 'Street address is required'
      if (!city.trim())    e.city    = 'City is required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Submit handler ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          email:        email.trim().toLowerCase(),
          phone:        phone.trim(),
          fulfillment:
            fulfillmentType === 'delivery'
              ? {
                  type:    'delivery',
                  address: address.trim(),
                  city:    city.trim(),
                  notes:   notes.trim() || undefined,
                }
              : { type: 'pickup' },
          items: items.map((item) => ({
            productId: item.productId,
            size:      item.size,
            color:     item.color,
            quantity:  item.quantity,
          })),
          total, // Server recalculates; sent for reference only
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to place order')
      }

      /* ── Success ── */
      clearCart()

      if (data.whatsappURL) {
        window.open(data.whatsappURL, '_blank')
      }

      router.push(`/order/${data.orderId}`)
    } catch (err) {
      setSubmitError((err as Error).message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formattedTotal = `EGP ${total.toLocaleString('en-EG')}`

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading italic text-4xl text-brown mb-10">Almost there.</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ─── Left: Form ─── */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Your Details */}
            <fieldset className="mb-8">
              <legend className="font-heading italic text-2xl text-brown mb-5">Your Details</legend>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className={LABEL_CLASS}>Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Menna Ali"
                    className={INPUT_CLASS}
                    autoComplete="name"
                  />
                  <FieldError msg={errors.name} />
                </div>

                <div>
                  <label htmlFor="email" className={LABEL_CLASS}>Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="menna@example.com"
                    className={INPUT_CLASS}
                    autoComplete="email"
                  />
                  <FieldError msg={errors.email} />
                </div>

                <div>
                  <label htmlFor="phone" className={LABEL_CLASS}>Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={INPUT_CLASS}
                    autoComplete="tel"
                  />
                  <FieldError msg={errors.phone} />
                </div>
              </div>
            </fieldset>

            {/* Delivery / Pickup toggle */}
            <fieldset className="mb-8">
              <legend className="font-heading italic text-2xl text-brown mb-5">Delivery</legend>

              {/* Toggle tabs */}
              <div className="flex gap-2 mb-6">
                {(['delivery', 'pickup'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFulfillmentType(type)}
                    className={`
                      flex-1 py-3 px-4 rounded-card font-body text-sm font-medium capitalize
                      transition-all duration-150 border
                      ${fulfillmentType === type
                        ? 'bg-forest text-cream border-forest'
                        : 'bg-cream-light text-brown border-brown/20 hover:border-mint'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {fulfillmentType === 'delivery' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className={LABEL_CLASS}>Street Address</label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="15 Tahrir Square, Apt. 4"
                      className={INPUT_CLASS}
                      autoComplete="street-address"
                    />
                    <FieldError msg={errors.address} />
                  </div>

                  <div>
                    <label htmlFor="city" className={LABEL_CLASS}>City</label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cairo"
                      className={INPUT_CLASS}
                      autoComplete="address-level2"
                    />
                    <FieldError msg={errors.city} />
                  </div>

                  <div>
                    <label htmlFor="notes" className={LABEL_CLASS}>
                      Delivery Notes <span className="normal-case font-normal tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for the delivery..."
                      rows={3}
                      className={`${INPUT_CLASS} resize-none`}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-mint-soft rounded-card p-4 border border-mint/20">
                  <p className="label-caps text-mint mb-1">Pickup Location</p>
                  <p className="font-body text-brown text-sm leading-relaxed">
                    Our team will contact you on WhatsApp to arrange a convenient pickup time
                    and location.
                  </p>
                </div>
              )}
            </fieldset>

            {/* Submit error */}
            {submitError && (
              <div className="bg-terracotta/10 border border-terracotta/20 rounded-card px-4 py-3 mb-4">
                <p className="text-terracotta text-sm font-body">{submitError}</p>
              </div>
            )}
          </form>

          {/* ─── Right: Order Summary ─── */}
          <aside className="bg-cream-light rounded-card p-6 sticky top-24">
            <h2 className="font-heading italic text-2xl text-brown mb-5">Order Summary</h2>

            {/* Item list */}
            <ul className="space-y-4 mb-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex items-start justify-between gap-3 pb-4 border-b border-brown/10 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-brown font-medium line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-brown-muted text-xs mt-0.5">
                      {item.size} · {item.color}
                    </p>
                  </div>
                  <p className="text-mint font-medium text-sm font-body whitespace-nowrap">
                    × {item.quantity} · EGP {(item.price * item.quantity).toLocaleString('en-EG')}
                  </p>
                </li>
              ))}
            </ul>

            {/* Subtotal */}
            <div className="flex justify-between text-sm font-body text-brown mb-2">
              <span className="text-brown-muted">Subtotal</span>
              <span>{formattedTotal}</span>
            </div>
            <div className="flex justify-between text-sm font-body mb-4">
              <span className="text-brown-muted">Shipping</span>
              <span className="text-brown-muted">Calculated on delivery</span>
            </div>

            <div className="border-t border-brown/10 my-4" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
              <span className="label-caps">Total</span>
              <span className="font-heading italic text-3xl text-brown">{formattedTotal}</span>
            </div>

            {/* Place Order button */}
            <button
              type="submit"
              form=""
              onClick={handleSubmit as unknown as React.MouseEventHandler}
              disabled={submitting}
              className={`btn-primary w-full mt-6 text-base ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order…
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}
