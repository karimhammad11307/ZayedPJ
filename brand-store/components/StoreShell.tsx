'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import CartDrawer from './CartDrawer'

interface StoreShellProps {
  children: React.ReactNode
}

/**
 * Thin client-side shell that holds the cart drawer open/close state.
 * Keeps Navbar and CartDrawer in sync without making the (store) layout
 * itself a client component (server layouts can't hold state).
 */
export default function StoreShell({ children }: StoreShellProps) {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {children}
    </>
  )
}
