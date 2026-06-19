'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, updateQuantity, removeItem } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)

  /* ── Trap scroll on body when open ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  /* ── Close on Escape key ── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const formattedTotal = `EGP ${total.toLocaleString('en-EG')}`
  const isEmpty = items.length === 0

  return (
    <>
      {/* ── Dark overlay ── */}
      <div
        className={`
          fixed inset-0 bg-forest/40 z-[99]
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* ── Drawer panel ── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`
          fixed right-0 top-0 h-full w-full max-w-md bg-cream shadow-2xl z-[100]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-brown/10 flex-shrink-0">
          <h2 className="font-heading italic text-2xl text-brown">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-brown hover:text-mint transition-colors duration-200 p-1 -mr-1"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag size={64} strokeWidth={1} className="text-brown/20" />
            <p className="font-heading italic text-xl text-brown/40 mt-4">
              Your cart is empty
            </p>
            <Link
              href="/shop"
              onClick={onClose}
              className="btn-outline mt-6"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* ── Items list ── */}
        {!isEmpty && (
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-3 py-4 border-b border-brown/10 relative"
              >
                {/* Product image */}
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-cream-light flex-shrink-0">
                  <Image
                    src={item.image || 'https://placehold.co/80x80/F5F0E8/2C1810?text='}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={!item.image || item.image.includes('placehold.co')}
                  />
                </div>

                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-brown text-sm leading-snug line-clamp-2 pr-6">
                    {item.name}
                  </p>
                  <p className="text-brown-muted text-xs mt-0.5">
                    {item.size} · {item.color}
                  </p>

                  {/* Bottom row: quantity + price */}
                  <div className="flex items-center mt-2 gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="w-7 h-7 rounded-full bg-cream-light text-brown hover:bg-mint hover:text-white transition-colors duration-150 flex items-center justify-center text-base font-medium select-none"
                      >
                        −
                      </button>
                      <span className="font-body text-sm text-brown w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="w-7 h-7 rounded-full bg-cream-light text-brown hover:bg-mint hover:text-white transition-colors duration-150 flex items-center justify-center text-base font-medium select-none"
                      >
                        +
                      </button>
                    </div>

                    {/* Line price */}
                    <p className="font-heading italic text-lg text-mint ml-auto">
                      EGP {(item.price * item.quantity).toLocaleString('en-EG')}
                    </p>
                  </div>
                </div>

                {/* Remove button — top-right of item */}
                <button
                  onClick={() => removeItem(item.productId, item.size, item.color)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="absolute top-4 right-0 text-brown/30 hover:text-terracotta transition-colors duration-150 p-0.5"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer (always visible) ── */}
        {!isEmpty && (
          <div className="border-t border-brown/10 pt-4 pb-6 px-6 flex-shrink-0">
            {/* Subtotal row */}
            <div className="flex items-baseline justify-between">
              <span className="text-brown-muted text-sm font-body">Subtotal</span>
              <span className="font-heading italic text-2xl text-brown">{formattedTotal}</span>
            </div>
            <p className="text-xs text-brown-muted mt-1">Shipping calculated at checkout</p>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-primary w-full mt-4 text-base"
            >
              Proceed to Checkout
            </Link>

            {/* Continue shopping */}
            <p
              onClick={onClose}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onClose()}
              className="text-center text-sm text-brown-muted hover:text-mint mt-3 cursor-pointer transition-colors duration-200 select-none"
            >
              Continue Shopping
            </p>
          </div>
        )}
      </div>
    </>
  )
}
