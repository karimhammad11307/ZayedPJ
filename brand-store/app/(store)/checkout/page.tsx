'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, MapPin, MessageCircle, Package, Search, Shield, ShoppingBag, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { DELIVERY_ZONES, formatDeliveryZone } from '@/lib/delivery'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-terracotta text-xs mt-1">{msg}</p>
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, total, hydrated, clearCart } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [deliveryZoneId, setDeliveryZoneId] = useState('')
  const [deliverySearch, setDeliverySearch] = useState('')
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (hydrated && items.length === 0 && !isSuccess) router.replace('/shop')
  }, [hydrated, items.length, router, isSuccess])

  const selectedDeliveryZone = DELIVERY_ZONES.find((zone) => zone.id === deliveryZoneId) ?? null
  const deliveryFee = fulfillmentType === 'delivery' ? selectedDeliveryZone?.price ?? 0 : 0
  const grandTotal = total + deliveryFee
  const filteredDeliveryZones = useMemo(() => {
    const query = deliverySearch.trim().toLowerCase()
    if (!query) return DELIVERY_ZONES
    return DELIVERY_ZONES.filter((zone) =>
      [zone.label, ...zone.areas].some((value) => value.toLowerCase().includes(query))
    )
  }, [deliverySearch])
  const formattedSubtotal = `EGP ${total.toLocaleString('en-EG')}`
  const formattedDelivery = `EGP ${deliveryFee.toLocaleString('en-EG')}`
  const formattedGrandTotal = `EGP ${grandTotal.toLocaleString('en-EG')}`

  if (!hydrated) return <div className="min-h-screen bg-cream" />

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag size={64} strokeWidth={1} className="text-brown/20" />
        <p className="heading-editorial text-2xl text-brown/40 mt-4">Your cart is empty</p>
        <Link href="/shop" className="btn-primary mt-6">Start Shopping</Link>
      </div>
    )
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = 'Full name is required'
    if (!email.trim()) nextErrors.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Invalid email address'
    if (!phone.trim()) nextErrors.phone = 'Phone number is required'
    if (fulfillmentType === 'delivery') {
      if (!address.trim()) nextErrors.address = 'Street address is required'
      if (!deliveryZoneId) nextErrors.deliveryZone = 'Please choose your delivery area'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

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
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          fulfillment: fulfillmentType === 'delivery'
            ? { type: 'delivery', address: address.trim(), city: city.trim(), deliveryZoneId, notes: notes.trim() || undefined }
            : { type: 'pickup' },
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          total,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to place order')
      setIsSuccess(true)
      clearCart()
      toast({ type: 'success', message: 'Order placed! Opening WhatsApp...' })
      if (data.whatsappURL) window.open(data.whatsappURL, '_blank')
      router.push(`/order/${data.orderId}`)
    } catch (err) {
      const message = (err as Error).message || 'Something went wrong. Please try again.'
      setSubmitError(message)
      toast({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/shop" className="text-brown-muted hover:text-brown text-sm">← Back to cart</Link>

        <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-10 items-start mt-8">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate>
            <h1 className="heading-editorial text-4xl">Almost there.</h1>
            <p className="section-label text-brown-muted mt-1 mb-8">Complete your order below</p>

            <section>
              <p className="section-label mb-4">Your Details</p>
              <div className="bg-cream-warm/50 rounded-[16px] p-6 mb-6 space-y-4">
                <div>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-base" autoComplete="name" />
                  <FieldError msg={errors.name} />
                </div>
                <div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="input-base" autoComplete="email" />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input-base" autoComplete="tel" />
                  <FieldError msg={errors.phone} />
                </div>
              </div>
            </section>

            <section>
              <p className="section-label mb-4">Delivery Method</p>
              <div className="bg-cream-warm/50 rounded-[16px] p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['delivery', Truck, 'Home Delivery', '2-3 business days'],
                    ['pickup', MapPin, 'Store Pickup', 'Available same day'],
                  ].map(([type, Icon, label, sublabel]) => (
                    <button
                      key={type as string}
                      type="button"
                      onClick={() => setFulfillmentType(type as 'delivery' | 'pickup')}
                      className={`border-2 rounded-[14px] p-4 cursor-pointer flex items-center gap-3 text-left transition-all ${
                        fulfillmentType === type
                          ? 'border-forest bg-forest/5'
                          : 'border-brown/15 bg-cream-light hover:border-forest'
                      }`}
                    >
                      <Icon size={22} className="text-forest" />
                      <span>
                        <span className="block text-brown font-medium">{label as string}</span>
                        <span className="block text-brown-muted text-xs">{sublabel as string}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {fulfillmentType === 'delivery' ? (
                  <div className="space-y-4 mt-5">
                    <div>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="input-base" autoComplete="street-address" />
                      <FieldError msg={errors.address} />
                    </div>
                    <div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDeliveryDropdownOpen(true)}
                          className="input-base text-left flex items-center justify-between"
                        >
                          <span className={selectedDeliveryZone ? 'text-brown' : 'text-brown/35'}>
                            {selectedDeliveryZone ? formatDeliveryZone(selectedDeliveryZone) : 'Choose delivery area'}
                          </span>
                          <ChevronDown size={18} className={`transition-transform ${deliveryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {deliveryDropdownOpen && (
                          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 bg-white rounded-[16px] shadow-warm-lg border border-brown/10 overflow-hidden">
                            <div className="p-3 border-b border-brown/10 relative">
                              <Search size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-brown-muted" />
                              <input
                                value={deliverySearch}
                                onChange={(e) => setDeliverySearch(e.target.value)}
                                placeholder="Search area or city"
                                className="input-base py-2 pl-9"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                              {filteredDeliveryZones.map((zone) => (
                                <button
                                  key={zone.id}
                                  type="button"
                                  onClick={() => {
                                    setDeliveryZoneId(zone.id)
                                    setCity(zone.label)
                                    setDeliverySearch('')
                                    setDeliveryDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-cream transition-colors duration-200 border-b border-brown/5 last:border-0"
                                >
                                  <span className="flex items-center justify-between gap-3">
                                    <span>
                                      <span className="block text-sm font-medium text-brown">{zone.label}</span>
                                      <span className="block text-xs text-brown-muted line-clamp-1">{zone.areas.join(' - ')}</span>
                                    </span>
                                    <span className="text-right flex-shrink-0">
                                      <span className="block font-heading italic text-terracotta">EGP {zone.price}</span>
                                      <span className="block text-[10px] text-brown-muted">{zone.duration}h</span>
                                    </span>
                                  </span>
                                </button>
                              ))}
                              {filteredDeliveryZones.length === 0 && (
                                <p className="px-4 py-6 text-center text-sm text-brown-muted">No delivery area found.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <FieldError msg={errors.deliveryZone} />
                    </div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes (optional)" rows={3} className="input-base resize-none" />
                  </div>
                ) : (
                  <p className="text-brown-muted text-sm mt-5">
                    Our team will contact you on WhatsApp to arrange pickup details.
                  </p>
                )}
              </div>
            </section>

            {submitError && (
              <div className="bg-terracotta/10 border border-terracotta/20 rounded-[12px] px-4 py-3 mb-4">
                <p className="text-terracotta text-sm">{submitError}</p>
              </div>
            )}

            <button disabled={submitting} className={`btn-primary w-full py-5 text-lg mt-6 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {submitting ? 'Placing Order...' : `Place Order — ${formattedGrandTotal}`}
            </button>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {[
                [Shield, 'Secure checkout'],
                [MessageCircle, 'WhatsApp confirmation'],
                [Package, 'Fast delivery'],
              ].map(([Icon, label]) => (
                <span key={label as string} className="flex items-center gap-1.5 text-brown-muted text-xs">
                  <Icon size={14} />
                  {label as string}
                </span>
              ))}
            </div>
          </form>

          <aside className="sticky top-6 bg-cream-warm rounded-[20px] p-6">
            <h2 className="heading-editorial text-2xl mb-6">Order Summary</h2>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                  <div className="relative w-16 h-20 rounded-[8px] overflow-hidden border border-brown/5 bg-cream-light flex-shrink-0">
                    <Image src={item.image || 'https://placehold.co/128x160/F5F0E8/2C1810?text='} alt={item.name} fill sizes="64px" className="object-cover" unoptimized={!item.image || item.image.includes('placehold.co')} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-brown font-medium line-clamp-1">{item.name}</p>
                    <p className="text-brown-muted text-xs mt-0.5">{item.size} · {item.color} · ×{item.quantity}</p>
                  </div>
                  <p className="text-terracotta font-medium ml-auto whitespace-nowrap text-sm">
                    EGP {(item.price * item.quantity).toLocaleString('en-EG')}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-brown/10 my-5" />
            <div className="flex justify-between text-sm mb-2">
              <span className="text-brown-muted">Subtotal</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brown-muted">Shipping</span>
              <span className={selectedDeliveryZone || fulfillmentType === 'pickup' ? 'text-brown' : 'text-brown-muted'}>
                {fulfillmentType === 'pickup' ? 'EGP 0' : selectedDeliveryZone ? formattedDelivery : 'Choose area'}
              </span>
            </div>
            {selectedDeliveryZone && fulfillmentType === 'delivery' && (
              <div className="flex justify-between text-xs mt-2">
                <span className="text-brown-muted">Delivery duration</span>
                <span className="text-brown-muted">{selectedDeliveryZone.duration} hours</span>
              </div>
            )}
            <div className="border-t border-brown/10 my-5" />
            <div className="flex justify-between items-baseline">
              <span className="section-label">Total</span>
              <span className="font-heading italic text-3xl text-brown">{formattedGrandTotal}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
