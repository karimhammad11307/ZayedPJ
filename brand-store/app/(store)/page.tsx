import Image from 'next/image'
import Link from 'next/link'

import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Settings from '@/models/Settings'
import ProductGrid from '@/components/ProductGrid'
import MarqueeBanner from '@/components/MarqueeBanner'
import StripeDivider from '@/components/StripeDivider'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'ZAYED — Egyptian Clothing Brand',
  description:
    'Discover our curated collection of warm, editorial Egyptian-inspired clothing. Beautifully crafted for the modern woman.',
}

/* ── Serialisable types for lean() results ── */
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

export default async function HomePage() {
  await connectDB()

  /* ── Fetch settings ── */
  const settingsRows = await Settings.find({}).lean()
  const settings: Record<string, string> = {}
  for (const row of settingsRows) {
    settings[row.key] = row.value
  }
  const heroImage         = settings['hero_image']         ?? '/hero.jpg'
  const announcementText  = settings['announcement_text']  ?? 'Free delivery on orders over EGP 500'

  /* ── Fetch featured products (max 4) ── */
  const featuredRaw = await Product
    .find({ isFeatured: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()
  const featured = JSON.parse(JSON.stringify(featuredRaw)) as LeanProduct[]

  /* ── Fetch new arrivals (4 latest) ── */
  const newArrivalsRaw = await Product
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()
  const newArrivals = JSON.parse(JSON.stringify(newArrivalsRaw)) as LeanProduct[]

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          Section 1: Announcement Banner
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-terracotta py-2 text-center">
        <p className="text-white text-sm font-body tracking-wide">{announcementText}</p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 2: Hero
      ═══════════════════════════════════════════════════════ */}
      <section className="min-h-[90vh] flex flex-col md:flex-row">
        {/* Left — Image (55%) */}
        <div className="hero-grain relative w-full md:w-[55%] min-h-[60vw] md:min-h-[90vh] overflow-hidden">
          {heroImage ? (
            <Image
              src={heroImage}
              alt="ZAYED — New Collection"
              fill
              priority
              className="object-cover"
              sizes="55vw"
            />
          ) : (
            /* Warm afternoon light gradient: terracotta → mustard → blush */
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #C94B2C 0%, #E8A820 45%, #E8B4A0 100%)',
              }}
            >
              {/* Ghost initials in blush-tinted at 9% opacity */}
              <span
                className="font-heading italic text-[18vw] md:text-[12vw] select-none pointer-events-none z-10"
                style={{ color: 'rgba(232,180,160,0.09)' }}
              >
                BS
              </span>
            </div>
          )}
          {/* Warm brown tone overlay */}
          <div className="absolute inset-0 bg-brown/10 pointer-events-none z-[1]" />
        </div>

        {/* Right — Editorial text (45%) */}
        <div className="w-full md:w-[45%] bg-cream-warm flex flex-col justify-center px-8 md:px-16 py-16 md:py-0 relative">
          {/* Subtle ambient glow behind heading */}
          <div
            className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,168,32,0.10) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <p className="label-caps text-brown-muted relative z-10">New Collection — 2026</p>
          <h1 className="font-heading italic text-6xl md:text-7xl lg:text-8xl text-brown leading-[0.9] mt-4 relative z-10">
            Dress the<br />way you<br />feel.
          </h1>
          <p className="font-body text-brown-muted text-lg mt-6 max-w-sm leading-relaxed relative z-10">
            Warm, editorial pieces crafted with Egyptian spirit and modern sensibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 relative z-10">
            <Link href="/shop" className="btn-primary">
              Shop Now
            </Link>
            <Link href="/about" className="btn-mustard">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 3: Marquee — terracotta
      ═══════════════════════════════════════════════════════ */}
      <MarqueeBanner variant="terracotta" />

      {/* ═══════════════════════════════════════════════════════
          Section 4: Featured / Bestsellers
      ═══════════════════════════════════════════════════════ */}
      <StripeDivider variant="mustard" height={8} />
      <section className="bg-cream-warm py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 relative">
            {/* Ambient glow behind heading */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 pointer-events-none mx-auto w-64"
              style={{ background: 'radial-gradient(ellipse, rgba(201,75,44,0.08) 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <h2 className="font-heading italic text-5xl text-brown relative">Bestsellers</h2>
            <p className="font-heading italic text-lg text-brown-muted mt-2 relative">
              Pieces our community loves
            </p>
          </div>

          <ProductGrid products={featured} />

          <div className="text-center mt-12">
            <Link href="/shop" className="btn-outline">
              View All Pieces
            </Link>
          </div>
        </div>
      </section>
      <StripeDivider variant="mustard" height={8} />

      {/* ═══════════════════════════════════════════════════════
          Section 5: Forest Stripe then About
      ═══════════════════════════════════════════════════════ */}
      <StripeDivider variant="forest" height={12} />

      {/* ═══════════════════════════════════════════════════════
          Section 6: About Strip
      ═══════════════════════════════════════════════════════ */}
      <section id="about" className="bg-forest py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left — Brand story */}
          <div>
            {/* Mustard accent badge */}
            <span className="inline-block bg-mustard text-brown text-[10px] font-body font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Our Story
            </span>
            <h2 className="font-heading italic text-5xl text-cream mt-1 leading-tight">
              Made with intention.
            </h2>
            {/* Mustard accent line */}
            <div className="w-12 h-0.5 bg-mustard mt-4 mb-6" />
            <p className="font-body text-cream/70 text-base leading-relaxed max-w-md">
              We believe clothing is a language. Every piece in our collection is crafted to
              speak quietly of confidence, warmth, and culture rooted in the Egyptian spirit.
            </p>
            <p className="font-body text-cream/70 text-base mt-4 max-w-md leading-relaxed">
              Born in Egypt, designed for the woman who knows what she wants — comfort
              without compromise, elegance without effort.
            </p>
            <Link
              href="/about"
              className="
                mt-8 inline-flex items-center justify-center gap-2
                border border-mustard text-mustard
                font-body font-medium text-sm
                px-6 py-3 rounded-btn
                transition-all duration-200
                hover:bg-mustard hover:text-brown
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard
                select-none
              "
            >
              Read our story
            </Link>
          </div>

          {/* Right — Polaroid collage */}
          <div className="relative flex items-center justify-center h-[380px] md:h-[480px]">
            {/* Back polaroid — rotated −3° */}
            <div
              className="absolute transform -rotate-3 bg-white p-3 pb-8 z-10"
              style={{
                left: '5%',
                top: '5%',
                boxShadow: '0 12px 40px rgba(44,24,16,0.30)',
              }}
            >
              <div className="relative w-44 h-56 overflow-hidden bg-blush">
                <Image
                  src="https://placehold.co/352x448/E8B4A0/2C1810?text=Brand+Store"
                  alt="ZAYED collection"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
            {/* Front polaroid — rotated +2° */}
            <div
              className="absolute transform rotate-2 bg-white p-3 pb-8 z-20"
              style={{
                right: '5%',
                bottom: '5%',
                boxShadow: '0 12px 40px rgba(44,24,16,0.30)',
              }}
            >
              <div className="relative w-44 h-56 overflow-hidden bg-mustard/20">
                <Image
                  src="https://placehold.co/352x448/E8A820/2C1810?text=Made+in+Egypt"
                  alt="Made in Egypt"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

        </div>
      </section>
      <StripeDivider variant="terracotta" height={12} />

      {/* ═══════════════════════════════════════════════════════
          Section 7: New Arrivals — blush warmth
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ backgroundColor: 'rgba(232,180,160,0.12)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 relative">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 pointer-events-none mx-auto w-64"
              style={{ background: 'radial-gradient(ellipse, rgba(232,168,32,0.10) 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <h2 className="font-heading italic text-5xl text-brown relative">New Arrivals</h2>
            <p className="font-heading italic text-lg text-brown-muted mt-2 relative">
              Just landed in the collection
            </p>
          </div>

          <ProductGrid products={newArrivals} />

          <div className="text-center mt-12">
            <Link href="/shop" className="btn-outline">
              Explore All
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 8: Second Marquee — mustard
      ═══════════════════════════════════════════════════════ */}
      <MarqueeBanner text="NEW ARRIVALS ✕ " variant="mustard" />

      {/* ═══════════════════════════════════════════════════════
          Section 9: Footer
      ═══════════════════════════════════════════════════════ */}
      <Footer />
    </>
  )
}
