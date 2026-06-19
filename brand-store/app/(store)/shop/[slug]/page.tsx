import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import ProductDetailClient from '@/components/ProductDetailClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/* ── Dynamic metadata ── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  await connectDB()
  const product = await Product.findOne({ slug, isActive: true }).lean()

  if (!product) return { title: 'Product not found | Brand Store' }

  return {
    title: `${product.name} | Brand Store`,
    description: product.description.slice(0, 160),
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  await connectDB()

  /* ── Fetch main product ── */
  const rawProduct = await Product.findOne({ slug, isActive: true }).lean()

  if (!rawProduct) {
    notFound()
  }

  const product = JSON.parse(JSON.stringify(rawProduct))

  /* ── Fetch related products (same category, exclude current, max 4) ── */
  const rawRelated = await Product
    .find({
      category: product.category,
      isActive: true,
      slug: { $ne: slug },
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()

  const relatedProducts = JSON.parse(JSON.stringify(rawRelated))

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  )
}
