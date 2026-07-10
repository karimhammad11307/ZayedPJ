'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
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
  initialSearch?: string
  stickyFilters?: boolean
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] overflow-hidden border border-brown/5 shadow-warm-sm">
      <div className="aspect-[3/4] skeleton-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-3 skeleton-shimmer rounded w-16" />
        <div className="h-4 skeleton-shimmer rounded w-full" />
        <div className="h-4 skeleton-shimmer rounded w-3/4" />
        <div className="h-5 skeleton-shimmer rounded w-20 mt-1" />
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
  initialSearch = '',
  stickyFilters = false,
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
  const [displayCategory, setDisplayCategory] = useState<Category>(activeCategory)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    if (activeCategory === displayCategory) return
    setTransitioning(true)
    const swapTimeout = window.setTimeout(() => {
      setDisplayCategory(activeCategory)
      setTransitioning(false)
    }, 180)
    return () => window.clearTimeout(swapTimeout)
  }, [activeCategory, displayCategory])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const searchedProducts = normalizedSearch
    ? products.filter((product) => {
        const searchableValues = [
          product.name,
          product.category,
          product.slug,
          ...product.variants.flatMap((variant) => [
            variant.size,
            variant.color,
          ]),
        ]

        return searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        )
      })
    : products

  const filtered =
    displayCategory === 'All'
      ? searchedProducts
      : searchedProducts.filter(
          (p) => p.category.toLowerCase() === displayCategory.toLowerCase()
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
        <div
          className={
            stickyFilters
              ? 'sticky top-[60px] z-20 bg-cream/80 backdrop-blur py-4 border-b border-brown/5 mb-8'
              : ''
          }
        >
          <div className="relative mb-4 max-w-md">
            <Search
              size={17}
              strokeWidth={1.6}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-muted pointer-events-none"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search collection"
              className="input-base pl-10 py-2.5"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 md:justify-start">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  flex-shrink-0 text-sm px-5 py-2 rounded-full transition-all duration-200
                  ${activeCategory === cat
                    ? 'bg-forest text-cream'
                    : 'bg-cream border border-brown/15 text-brown-muted hover:border-forest hover:text-forest'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="section-label text-brown-muted mt-4 mb-6">
            Showing {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
            {normalizedSearch && (
              <span className="normal-case tracking-normal font-medium">
                {' '}for “{searchTerm.trim()}”
              </span>
            )}
          </p>
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
          {showFilters && (activeCategory !== 'All' || normalizedSearch) && (
            <p className="text-brown-muted text-sm mt-2">
              Try a different search or category
            </p>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      {!loading && filtered.length > 0 && (
        <div
          className={`
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6
            transition-all duration-[180ms]
            ${transitioning ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100'}
          `}
        >
          {filtered.map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
