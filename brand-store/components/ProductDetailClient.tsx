'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react'

import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import SizePicker from './SizePicker'
import ColorPicker from './ColorPicker'
import ProductGrid from './ProductGrid'
import MarqueeBanner from './MarqueeBanner'
import Footer from './Footer'

interface Variant {
  size: string
  color: string
  stock: number
  waistPerimeter?: number
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

const ACCORDIONS = [
  ['Description', 'description'],
  ['Care Instructions', 'Wash gently in cold water and hang to dry. Steam lightly to preserve shape.'],
  ['Shipping & Returns', 'Cairo delivery usually takes 2-3 days. Our team confirms every order through WhatsApp.'],
] as const

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(product.images[0] ?? '')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedWaist, setSelectedWaist] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedFlash, setAddedFlash] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [openAccordion, setOpenAccordion] = useState('Description')
  const [sizeShakeSignal, setSizeShakeSignal] = useState(0)

  const images = product.images.length > 0 ? product.images : ['https://placehold.co/900x1200/F0E6D2/2C1810?text=ZAYED']
  const hasWaistSizes = product.variants.some((v) => v.waistPerimeter != null)
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
  const isLowStock = selectedStock > 0 && selectedStock < 5
  const canAddToCart = !!selectedSize && !!selectedColor && selectedStock > 0 && (!hasWaistSizes || selectedWaist !== null)
  const formattedPrice = `EGP ${product.price.toLocaleString('en-EG')}`

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowRight') showNextImage()
      if (event.key === 'ArrowLeft') showPreviousImage()
    }
    if (lightboxOpen) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  function selectImage(index: number) {
    setSelectedImageIndex(index)
    setSelectedImage(images[index])
  }

  function showNextImage() {
    const nextIndex = (selectedImageIndex + 1) % images.length
    selectImage(nextIndex)
  }

  function showPreviousImage() {
    const previousIndex = (selectedImageIndex - 1 + images.length) % images.length
    selectImage(previousIndex)
  }

  function handleSizeChange(size: string) {
    setSelectedSize(size)
    if (selectedColor) {
      const hasStock = product.variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0)
      if (!hasStock) setSelectedColor(null)
    }
  }

  function handleColorChange(color: string) {
    setSelectedColor(color)
    setSelectedWaist(null)
    if (selectedSize) {
      const hasStock = product.variants.some((v) => v.color === color && v.size === selectedSize && v.stock > 0)
      if (!hasStock) setSelectedSize(null)
    }
  }

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeShakeSignal((value) => value + 1)
      return
    }
    if (!canAddToCart || !selectedColor) return

    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    setAddedFlash(true)
    setToastVisible(true)
    toast({ type: 'success', message: 'Item added successfully' })
    window.setTimeout(() => setAddedFlash(false), 1500)
    window.setTimeout(() => setToastVisible(false), 3000)
  }

  return (
    <>
      <section className="bg-cream py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-warm-lg w-full cursor-zoom-in bg-cream-warm"
            >
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
                unoptimized={selectedImage.includes('placehold.co')}
              />
            </button>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button
                  key={img}
                  onClick={() => selectImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`relative w-16 h-20 flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-colors duration-200 ${
                    selectedImageIndex === index ? 'border-forest' : 'border-transparent hover:border-terracotta'
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${index + 1}`} fill sizes="64px" className="object-cover" unoptimized={img.includes('placehold.co')} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="section-label text-terracotta capitalize">{product.category}</p>
            <h1 className="heading-editorial text-4xl lg:text-5xl mt-2">{product.name}</h1>
            <div className="flex items-center gap-3 mt-4">
              <p className="font-heading italic text-3xl text-terracotta">{formattedPrice}</p>
              {isLowStock && (
                <span className="bg-terracotta/10 text-terracotta text-xs px-3 py-1 rounded-full">
                  Only {selectedStock} left
                </span>
              )}
            </div>
            <div className="w-12 h-px bg-terracotta mt-6 mb-6" />

            <div className="mb-5">
              <ColorPicker variants={variantsForColorPicker} selected={selectedColor} onChange={handleColorChange} />
            </div>

            <div className="mb-5">
              <SizePicker variants={variantsForSizePicker} selected={selectedSize} onChange={handleSizeChange} shakeSignal={sizeShakeSignal} />
            </div>

            {hasWaistSizes && (
              <div className="mb-5">
                <p className="section-label mb-2">Waist</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.filter((v) => v.waistPerimeter != null).map((v) => v.waistPerimeter as number)))
                    .sort((a, b) => a - b)
                    .map((waist) => (
                      <button
                        key={waist}
                        onClick={() => setSelectedWaist(waist)}
                        aria-pressed={selectedWaist === waist}
                        className={`rounded-[8px] border text-sm font-body px-3 py-2 transition-all duration-150 ${
                          selectedWaist === waist
                            ? 'bg-forest text-cream border-forest'
                            : 'bg-cream text-brown border-brown/15 hover:border-terracotta hover:text-terracotta'
                        }`}
                      >
                        {waist} cm
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-stretch gap-3 mt-2">
              <div className="bg-cream-warm rounded-[10px] border border-brown/15 inline-flex items-center">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-11 h-12 text-brown hover:text-terracotta">−</button>
                <span className="w-8 text-center text-brown">{quantity}</span>
                <button onClick={() => setQuantity((q) => selectedStock > 0 ? Math.min(selectedStock, q + 1) : q + 1)} aria-label="Increase quantity" className="w-11 h-12 text-brown hover:text-terracotta">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`btn-primary flex-1 py-4 text-base ${addedFlash ? '!bg-forest !shadow-none' : ''} ${!canAddToCart ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ShoppingBag size={18} strokeWidth={1.7} />
                {addedFlash ? 'Added! ✓' : 'Add to Cart'}
              </button>
            </div>

            <div className="border-t border-brown/10 mt-8">
              {ACCORDIONS.map(([title, body]) => {
                const open = openAccordion === title
                const content = body === 'description' ? product.description : body
                return (
                  <div key={title} className="border-b border-brown/10">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(open ? '' : title)}
                      className="section-label w-full flex items-center justify-between py-4 cursor-pointer"
                    >
                      {title}
                      <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
                      <p className="font-body text-brown-muted text-base leading-relaxed">{content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <MarqueeBanner />

      {relatedProducts.length > 0 && (
        <section className="bg-cream-light py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-label">More to love</p>
              <h2 className="heading-editorial text-4xl text-brown mt-2">You might also like</h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}

      <Footer />

      {lightboxOpen && (
        <div className="fixed inset-0 bg-brown/90 z-[200] flex items-center justify-center p-4">
          <button onClick={() => setLightboxOpen(false)} aria-label="Close lightbox" className="absolute top-5 right-5 text-cream hover:text-mustard">
            <X size={28} />
          </button>
          <button onClick={showPreviousImage} aria-label="Previous image" className="absolute left-5 text-cream hover:text-mustard">
            <ChevronLeft size={36} />
          </button>
          <div className="relative w-full max-w-4xl h-[90vh]">
            <Image src={selectedImage} alt={product.name} fill className="object-contain" sizes="100vw" unoptimized={selectedImage.includes('placehold.co')} />
          </div>
          <button onClick={showNextImage} aria-label="Next image" className="absolute right-5 text-cream hover:text-mustard">
            <ChevronRight size={36} />
          </button>
        </div>
      )}

      <div className={`fixed bottom-4 right-4 z-[180] bg-forest text-cream px-4 py-3 rounded-[12px] shadow-warm-lg transition-all duration-300 ${
        toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        <p className="text-sm font-medium">{product.name} added to cart</p>
        <Link href="/checkout" className="text-xs underline underline-offset-2 text-cream/80 hover:text-cream">
          View Cart
        </Link>
      </div>
    </>
  )
}
