'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useCart } from '@/context/CartContext'
import SizePicker from './SizePicker'
import ColorPicker from './ColorPicker'
import ProductGrid from './ProductGrid'
import MarqueeBanner from './MarqueeBanner'
import CartDrawer from './CartDrawer'
import Footer from './Footer'

/* ── Types ── */
interface Variant {
  size: string
  color: string
  stock: number
}

export interface ProductDetailProps {
  product: {
    _id: string
    name: string
    slug: string
    description: string
    price: number
    category: string
    images: string[]
    variants: Variant[]
    isFeatured: boolean
  }
  relatedProducts: {
    _id: string
    name: string
    slug: string
    price: number
    category: string
    images: string[]
    variants: Variant[]
    isFeatured: boolean
  }[]
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const { addItem } = useCart()

  /* ── State ── */
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] ?? '')
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity,      setQuantity]      = useState(1)
  const [cartOpen,      setCartOpen]      = useState(false)
  const [addedFlash,    setAddedFlash]    = useState(false)

  /* ── Derived values ── */
  const variantsForSizePicker = selectedColor
    ? product.variants.filter((v) => v.color === selectedColor)
    : product.variants

  const variantsForColorPicker = selectedSize
    ? product.variants.filter((v) => v.size === selectedSize)
    : product.variants

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  )
  const selectedStock = selectedVariant?.stock ?? 0

  const isOutOfStock  = selectedSize && selectedColor && selectedStock === 0
  const isLowStock    = selectedStock > 0 && selectedStock < 5
  const canAddToCart  = !!selectedSize && !!selectedColor && selectedStock > 0

  const formattedPrice = `EGP ${product.price.toLocaleString('en-EG')}`

  /* ── Handlers ── */
  function handleSizeChange(size: string) {
    setSelectedSize(size)
    // If the current color has no stock for the new size, reset it
    if (selectedColor) {
      const hasStock = product.variants.some(
        (v) => v.size === size && v.color === selectedColor && v.stock > 0
      )
      if (!hasStock) setSelectedColor(null)
    }
  }

  function handleColorChange(color: string) {
    setSelectedColor(color)
    // If the current size has no stock for the new color, reset it
    if (selectedSize) {
      const hasStock = product.variants.some(
        (v) => v.color === color && v.size === selectedSize && v.stock > 0
      )
      if (!hasStock) setSelectedSize(null)
    }
  }

  function handleAddToCart() {
    if (!canAddToCart || !selectedSize || !selectedColor) return

    addItem({
      productId: product._id,
      slug:      product.slug,
      name:      product.name,
      price:     product.price,
      image:     product.images[0] ?? '',
      size:      selectedSize,
      color:     selectedColor,
      quantity,
    })

    // Flash confirmation, then open drawer
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 1500)
    setCartOpen(true)
  }

  return (
    <>
      {/* ── Product section ── */}
      <section className="bg-cream py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

          {/* ─── Left: Image Gallery ─── */}
          <div>
            {/* Main image */}
            <div className="relative aspect-[3/4] rounded-card overflow-hidden bg-cream-light w-full">
              {selectedImage ? (
                <Image
                  key={selectedImage}
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-300"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-blush/30 flex items-center justify-center">
                  <span className="font-heading italic text-5xl text-brown/20">BS</span>
                </div>
              )}
            </div>

            {/* Thumbnail row */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`View image ${i + 1}`}
                    className={`
                      relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden
                      border-2 transition-colors duration-150
                      ${selectedImage === img ? 'border-mint' : 'border-transparent hover:border-brown/30'}
                    `}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Right: Product Info ─── */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="label-caps text-brown-muted capitalize">{product.category}</p>

            {/* Name */}
            <h1 className="font-heading italic text-4xl text-brown mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-heading italic text-3xl text-mint mt-3">{formattedPrice}</p>

            <div className="border-t border-brown/10 my-6" />

            {/* Color picker */}
            <div className="mb-5">
              <ColorPicker
                variants={variantsForColorPicker}
                selected={selectedColor}
                onChange={handleColorChange}
              />
            </div>

            {/* Size picker */}
            <div className="mb-5">
              <SizePicker
                variants={variantsForSizePicker}
                selected={selectedSize}
                onChange={handleSizeChange}
              />
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <p className="label-caps mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded-full bg-cream-light text-brown hover:bg-mint hover:text-white transition-colors duration-150 flex items-center justify-center font-medium select-none"
                >
                  −
                </button>
                <span className="font-body text-brown text-lg w-6 text-center">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      selectedStock > 0 ? Math.min(selectedStock, q + 1) : q + 1
                    )
                  }
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded-full bg-cream-light text-brown hover:bg-mint hover:text-white transition-colors duration-150 flex items-center justify-center font-medium select-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock indicator */}
            {isOutOfStock && (
              <p className="text-brown-muted text-sm mb-4">Out of stock for this combination</p>
            )}
            {isLowStock && !isOutOfStock && (
              <p className="text-terracotta text-sm mb-4 font-medium">
                Only {selectedStock} left
              </p>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`
                btn-primary w-full text-base mt-2 transition-all duration-200
                ${!canAddToCart ? 'opacity-50 cursor-not-allowed' : ''}
                ${addedFlash ? '!bg-forest' : ''}
              `}
            >
              {addedFlash ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {!selectedSize && !selectedColor && (
              <p className="text-center text-brown-muted text-xs mt-2">
                Please select a color and size
              </p>
            )}

            {/* Description */}
            <div className="border-t border-brown/10 mt-8 pt-8">
              <p className="label-caps mb-3">Details</p>
              <p className="font-body text-brown-muted text-base leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <MarqueeBanner />

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-cream-light py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading italic text-4xl text-brown">
                You might also like
              </h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <Footer />

      {/* ── Cart Drawer (auto-opens on Add to Cart) ── */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
