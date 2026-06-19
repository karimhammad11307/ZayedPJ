'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export interface ProductCardProps {
  product: {
    _id: string
    name: string
    slug: string
    price: number
    category: string
    images: string[]
    variants: { size: string; color: string; stock: number }[]
    isFeatured: boolean
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)

  const hasSecondImage  = product.images.length > 1
  const primaryImage    = product.images[0] ?? 'https://placehold.co/600x800/F5F0E8/2C1810?text=No+Image'
  const secondaryImage  = product.images[1]

  /* Total stock across all variants */
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const isLowStock = totalStock > 0 && totalStock < 5

  /* Deduplicated sizes that have at least one unit in stock */
  const availableSizes = Array.from(
    new Set(
      product.variants
        .filter((v) => v.stock > 0)
        .map((v) => v.size)
    )
  )

  const formattedPrice = `EGP ${product.price.toLocaleString('en-EG')}`

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block bg-cream-light rounded-card overflow-hidden shadow-sm hover:shadow-card-hover transition-shadow duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {/* Primary image */}
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`
            object-cover transition-all duration-500
            ${hasSecondImage
              ? hovered ? 'opacity-0' : 'opacity-100'
              : hovered ? 'scale-[1.02]' : 'scale-100'
            }
          `}
          priority={false}
          unoptimized={primaryImage.includes('placehold.co')}
        />

        {/* Secondary image (crossfade on hover) */}
        {hasSecondImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} — alternate view`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`
              object-cover absolute inset-0 transition-opacity duration-500
              ${hovered ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}

        {/* ── Badges (top-left) ── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isLowStock && (
            <span className="bg-terracotta text-white text-[10px] font-body font-medium px-2 py-0.5 rounded-full leading-tight">
              Only {totalStock} left
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-mint text-white text-[10px] font-body font-medium px-2 py-0.5 rounded-full leading-tight">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* ── Product info ── */}
      <div className="p-4">
        {/* Category */}
        <p className="label-caps mb-1 capitalize">{product.category}</p>

        {/* Name */}
        <p className="font-body font-medium text-brown text-sm leading-snug line-clamp-2">
          {product.name}
        </p>

        {/* Price */}
        <p className="font-heading italic text-xl text-mint mt-1">{formattedPrice}</p>

        {/* Size pills */}
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {availableSizes.map((size) => (
              <span
                key={size}
                className="bg-cream text-brown-muted text-xs px-1.5 py-0.5 rounded"
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
