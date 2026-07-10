'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SizePickerProps {
  variants: { size: string; stock: number }[]
  selected: string | null
  onChange: (size: string) => void
  shakeSignal?: number
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL']

export default function SizePicker({ variants, selected, onChange, shakeSignal = 0 }: SizePickerProps) {
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (!shakeSignal) return
    setShaking(true)
    const timeout = window.setTimeout(() => setShaking(false), 450)
    return () => window.clearTimeout(timeout)
  }, [shakeSignal])

  // Build a map: size → total stock (sum across all colors)
  const stockBySize = variants.reduce<Record<string, number>>((acc, v) => {
    acc[v.size] = (acc[v.size] ?? 0) + v.stock
    return acc
  }, {})

  // Only show sizes that exist in the variant list, in standard order
  const sizes = SIZE_ORDER.filter((s) => stockBySize[s] !== undefined)

  return (
    <div className={shaking ? 'animate-shake' : ''}>
      <div className="flex items-center justify-between mb-2">
        <p className="section-label">Select Size</p>
        <Link href="/size-guide" className="text-mint text-xs underline underline-offset-2">
          Size Guide
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const stock     = stockBySize[size] ?? 0
          const outOfStock = stock === 0
          const isSelected = selected === size

          return (
            <button
              key={size}
              onClick={() => !outOfStock && onChange(size)}
              disabled={outOfStock}
              aria-pressed={isSelected}
              aria-label={outOfStock ? `${size} — out of stock` : size}
              className={`
                relative w-12 h-12 rounded-[8px] border text-sm font-body transition-all duration-150
                ${outOfStock
                  ? 'size-out-of-stock opacity-40 pointer-events-none cursor-not-allowed border-brown/15 bg-cream text-brown'
                  : isSelected
                    ? 'bg-forest text-cream border-forest'
                    : 'bg-cream text-brown border-brown/15 hover:border-terracotta hover:text-terracotta cursor-pointer'
                }
              `}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
