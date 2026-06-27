'use client'

/**
 * context/CartContext.tsx
 *
 * Client-side cart state with localStorage persistence.
 *
 * Security notes:
 *   - Cart data is non-sensitive (product IDs, sizes, colors, quantities).
 *     It is appropriate to store in localStorage per the brief.
 *   - Auth tokens are NEVER stored in localStorage — only in HttpOnly cookies.
 *   - Values from localStorage are JSON-parsed inside a try/catch and validated
 *     before use to prevent prototype pollution or malformed data from breaking
 *     the app.
 *   - No user PII is stored in the cart.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

/* ── Types ── */
export interface CartItem {
  productId: string
  slug:      string
  name:      string
  price:     number
  image:     string
  size:      string
  color:     string
  quantity:  number
}

interface CartContextValue {
  items:          CartItem[]
  itemCount:      number
  total:          number
  hydrated:       boolean  // true after localStorage has been read on the client
  addItem:        (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem:     (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart:      () => void
}

/* ── Context ── */
const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'zayed-cart'

/* ── Validation: ensure data from localStorage is a safe array of CartItems ── */
function isValidCartItems(data: unknown): data is CartItem[] {
  if (!Array.isArray(data)) return false
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as CartItem).productId === 'string' &&
      typeof (item as CartItem).name      === 'string' &&
      typeof (item as CartItem).price     === 'number' &&
      typeof (item as CartItem).size      === 'string' &&
      typeof (item as CartItem).color     === 'string' &&
      typeof (item as CartItem).quantity  === 'number' &&
      (item as CartItem).quantity > 0 &&
      (item as CartItem).price   >= 0
  )
}

/* ── Key helper ── */
function itemKey(productId: string, size: string, color: string): string {
  return `${productId}::${size}::${color}`
}

/* ── Provider ── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  /* Load from localStorage after hydration */
  useEffect(() => {
    try {
      const raw     = localStorage.getItem(STORAGE_KEY)
      const parsed  = raw ? JSON.parse(raw) : []
      if (isValidCartItems(parsed)) {
        setItems(parsed)
      }
    } catch {
      // Silently ignore corrupt data — start with empty cart
    }
    setHydrated(true)
  }, [])

  /* Persist to localStorage whenever items change */
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage quota errors
    }
  }, [items, hydrated])

  /* ── Actions ── */
  const addItem = useCallback(
    (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      setItems((prev) => {
        const qty = newItem.quantity ?? 1
        const key = itemKey(newItem.productId, newItem.size, newItem.color)
        const existing = prev.find(
          (i) => itemKey(i.productId, i.size, i.color) === key
        )

        if (existing) {
          return prev.map((i) =>
            itemKey(i.productId, i.size, i.color) === key
              ? { ...i, quantity: i.quantity + qty }
              : i
          )
        }

        return [...prev, { ...newItem, quantity: qty }]
      })
    },
    []
  )

  const removeItem = useCallback(
    (productId: string, size: string, color: string) => {
      const key = itemKey(productId, size, color)
      setItems((prev) =>
        prev.filter((i) => itemKey(i.productId, i.size, i.color) !== key)
      )
    },
    []
  )

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      if (quantity < 1) {
        removeItem(productId, size, color)
        return
      }
      const key = itemKey(productId, size, color)
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.size, i.color) === key
            ? { ...i, quantity }
            : i
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  /* ── Derived values ── */
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total     = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, hydrated, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

/* ── Hook ── */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
