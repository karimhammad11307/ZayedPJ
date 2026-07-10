'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

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
  const { addItem } = useCart()
  const { toast } = useToast()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const hasSecondImage = product.images.length > 1
  const primaryImage = product.images[0] ?? 'https://placehold.co/600x800/F0E6D2/2C1810?text=No+Image'
  const secondaryImage = product.images[1]

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const isLowStock = totalStock > 0 && totalStock < 5

  const availableSizes = Array.from(
    new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.size))
  )

  const formattedPrice = `EGP ${product.price.toLocaleString('en-EG')}`

  function handleQuickAdd() {
    if (!pickerOpen) {
      setPickerOpen(true)
      return
    }

    if (!selectedSize) {
      setShake(true)
      window.setTimeout(() => setShake(false), 450)
      return
    }

    const variant = product.variants.find((v) => v.size === selectedSize && v.stock > 0)
    if (!variant) return

    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: primaryImage,
      size: selectedSize,
      color: variant.color,
      quantity: 1,
    })

    setPickerOpen(false)
    setSelectedSize(null)
    toast({ type: 'success', message: 'Item added successfully' })
  }

  return (
    <article className="group bg-white rounded-[16px] overflow-hidden border border-brown/5 shadow-warm-sm hover:shadow-warm-lg transform hover:-translate-y-1 transition-all duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-terracotta">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-warm">
        <Link
          href={`/shop/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 block"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            priority={false}
            unoptimized={primaryImage.includes('placehold.co')}
          />

          {hasSecondImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="absolute inset-0 object-cover opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="absolute top-3 left-3 flex gap-2">
          {product.isFeatured && (
            <span className="bg-mustard text-brown text-[10px] font-semibold px-2.5 py-1 rounded-full leading-tight">
              Featured
            </span>
          )}
          {isLowStock && (
            <span className="bg-terracotta text-white text-[10px] font-semibold px-2.5 py-1 rounded-full leading-tight">
              Low stock
            </span>
          )}
        </div>

        {totalStock > 0 && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute left-3 right-3 bottom-0 bg-forest/90 backdrop-blur text-cream text-xs py-2.5 px-4 rounded-b-none rounded-t-lg translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
          >
            {pickerOpen ? 'Add selected size' : 'Quick add'}
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="section-label text-brown-muted mb-1.5 capitalize">{product.category}</p>

        <Link
          href={`/shop/${product.slug}`}
          className="block font-body font-medium text-brown text-sm leading-snug line-clamp-2 hover:text-terracotta transition-colors"
        >
          {product.name}
        </Link>

        <div className="flex justify-between items-center gap-3 mt-2">
          <p className="font-heading italic text-xl text-terracotta whitespace-nowrap">{formattedPrice}</p>
          {availableSizes.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-end">
              {availableSizes.map((size) => (
                <span
                  key={size}
                  className="text-[10px] bg-cream text-brown-muted rounded-md px-1.5 py-0.5 border border-brown/10"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        {pickerOpen && (
          <div className={`mt-3 flex flex-wrap gap-1.5 ${shake ? 'animate-shake' : ''}`}>
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={`
                  h-8 min-w-8 rounded-md border px-2 text-[11px] transition-all duration-150
                  ${selectedSize === size
                    ? 'bg-forest border-forest text-cream'
                    : 'bg-cream border-brown/15 text-brown hover:border-terracotta hover:text-terracotta'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
