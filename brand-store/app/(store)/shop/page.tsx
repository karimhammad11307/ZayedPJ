import type { Metadata } from 'next'

import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import ProductGrid from '@/components/ProductGrid'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shop — ZAYED',
  description: 'Browse our full collection of warm, editorial Egyptian-inspired clothing.',
}

type LeanProduct = {
  _id: string
  name: string
  slug: string
  price: number
  category: string
  images: string[]
  variants: { size: string; color: string; stock: number }[]
  isFeatured: boolean
  isActive: boolean
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, search } = await searchParams

  await connectDB()

  const productsRaw = await Product
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean()

  const products = JSON.parse(JSON.stringify(productsRaw)) as LeanProduct[]

  return (
    <>
      {/* ── Hero strip ── */}
      <section className="bg-cream-warm pt-24 pb-12 px-6 text-center">
        <h1 className="heading-display text-brown">The Collection</h1>
        <p className="section-label text-brown-muted mt-3">
          {products.length} handcrafted piece{products.length !== 1 ? 's' : ''}
        </p>
      </section>

      {/* ── Marquee ── */}
      <MarqueeBanner variant="forest" />

      {/* ── Product grid with filters ── */}
      <section className="bg-cream py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ProductGrid
            products={products}
            showFilters
            stickyFilters
            initialCategory={category}
            initialSearch={search}
          />
        </div>
      </section>

      <Footer />
    </>
  )
}
