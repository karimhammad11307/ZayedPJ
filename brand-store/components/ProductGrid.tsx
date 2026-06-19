'use client'

import { useState } from 'react'
import ProductCard, { type ProductCardProps } from './ProductCard'

type Product = ProductCardProps['product']

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'] as const
type Category = typeof CATEGORIES[number]

interface ProductGridProps {
  products: Product[]
  title?: string
  showFilters?: boolean
  loading?: boolean
  initialCategory?: string
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-cream-light rounded-card overflow-hidden animate-pulse">
      {/* Image skeleton — 3:4 ratio */}
      <div className="aspect-[3/4] bg-brown/8" />
      {/* Text skeletons */}
      <div className="p-4 space-y-2">
        <div className="h-3 bg-brown/8 rounded w-16" />
        <div className="h-4 bg-brown/8 rounded w-full" />
        <div className="h-4 bg-brown/8 rounded w-3/4" />
        <div className="h-5 bg-mint/20 rounded w-20 mt-1" />
      </div>
    </div>
  )
}

export default function ProductGrid({
  products,
  title,
  showFilters = false,
  loading = false,
  initialCategory,
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    if (initialCategory) {
      const cap =
        initialCategory.charAt(0).toUpperCase() +
        initialCategory.slice(1).toLowerCase()
      if (CATEGORIES.includes(cap as Category)) return cap as Category
    }
    return 'All'
  })

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        )

  return (
    <section className="w-full">
      {/* ── Optional title ── */}
      {title && (
        <h2 className="font-heading italic text-4xl text-brown text-center mb-8">
          {title}
        </h2>
      )}

      {/* ── Filter tabs ── */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide justify-center md:justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body transition-all duration-200
                ${activeCategory === cat
                  ? 'bg-forest text-cream'
                  : 'bg-cream-light text-brown hover:bg-mint hover:text-white'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-heading italic text-3xl text-brown/40">
            No pieces found.
          </p>
          {showFilters && activeCategory !== 'All' && (
            <p className="text-brown-muted text-sm mt-2">
              Try a different category
            </p>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
