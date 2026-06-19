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
  title: 'Brand Store — Egyptian Clothing Brand',
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
  const heroImage         = settings['hero_image']         ?? null
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
      <div className="bg-mint py-2 text-center">
        <p className="text-white text-sm font-body tracking-wide">{announcementText}</p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 2: Hero
      ═══════════════════════════════════════════════════════ */}
      <section className="min-h-[90vh] flex flex-col md:flex-row">
        {/* Left — Image (55%) */}
        <div className="relative w-full md:w-[55%] min-h-[60vw] md:min-h-[90vh] overflow-hidden bg-blush">
          {heroImage ? (
            <Image
              src={heroImage}
              alt="Brand Store — New Collection"
              fill
              priority
              className="object-cover"
              sizes="55vw"
            />
          ) : (
            /* Warm gradient placeholder when no hero image is set */
            <div className="absolute inset-0 bg-gradient-to-br from-blush via-cream to-mint-soft flex items-center justify-center">
              <span className="font-heading italic text-[12vw] text-brown/10 select-none">BS</span>
            </div>
          )}
          {/* Warm tone overlay */}
          <div className="absolute inset-0 bg-brown/10 pointer-events-none" />
        </div>

        {/* Right — Editorial text (45%) */}
        <div className="w-full md:w-[45%] bg-cream flex flex-col justify-center px-8 md:px-16 py-16 md:py-0">
          <p className="label-caps text-brown-muted">New Collection — 2026</p>
          <h1 className="font-heading italic text-6xl md:text-7xl lg:text-8xl text-brown leading-[0.9] mt-4">
            Dress the<br />way you<br />feel.
          </h1>
          <p className="font-body text-brown-muted text-lg mt-6 max-w-sm leading-relaxed">
            Warm, editorial pieces crafted with Egyptian spirit and modern sensibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href="/shop" className="btn-primary">
              Shop Now
            </Link>
            <Link href="/about" className="btn-outline">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 3: Marquee
      ═══════════════════════════════════════════════════════ */}
      <MarqueeBanner />

      {/* ═══════════════════════════════════════════════════════
          Section 4: Featured / Bestsellers
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-cream py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading italic text-5xl text-brown">Bestsellers</h2>
            <p className="font-heading italic text-lg text-brown-muted mt-2">
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

      {/* ═══════════════════════════════════════════════════════
          Section 5: Stripe Divider
      ═══════════════════════════════════════════════════════ */}
      <StripeDivider height={12} />

      {/* ═══════════════════════════════════════════════════════
          Section 6: About Strip
      ═══════════════════════════════════════════════════════ */}
      <section id="about" className="bg-forest py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left — Brand story */}
          <div>
            <p className="label-caps text-cream/50">Our Story</p>
            <h2 className="font-heading italic text-5xl text-cream mt-3 leading-tight">
              Made with intention.
            </h2>
            <p className="font-body text-cream/70 text-base mt-6 max-w-md leading-relaxed">
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
                border border-cream text-cream
                font-body font-medium text-sm
                px-6 py-3 rounded-btn
                transition-all duration-200
                hover:bg-cream hover:text-forest
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream
                select-none
              "
            >
              Read our story
            </Link>
          </div>

          {/* Right — Polaroid collage */}
          <div className="relative flex items-center justify-center h-[380px] md:h-[480px]">
            {/* Back polaroid — rotated −2° */}
            <div className="absolute transform -rotate-2 shadow-xl bg-white p-3 pb-8 z-10"
                 style={{ left: '5%', top: '5%' }}>
              <div className="relative w-44 h-56 overflow-hidden bg-blush">
                <Image
                  src="https://placehold.co/352x448/E8B4A0/2C1810?text=Brand+Store"
                  alt="Brand Store collection"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
            {/* Front polaroid — rotated +1° */}
            <div className="absolute transform rotate-1 shadow-xl bg-white p-3 pb-8 z-20"
                 style={{ right: '5%', bottom: '5%' }}>
              <div className="relative w-44 h-56 overflow-hidden bg-mint-soft">
                <Image
                  src="https://placehold.co/352x448/4A9B7F/F5F0E8?text=Made+in+Egypt"
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

      {/* ═══════════════════════════════════════════════════════
          Section 7: New Arrivals
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-cream-light py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading italic text-5xl text-brown">New Arrivals</h2>
            <p className="font-heading italic text-lg text-brown-muted mt-2">
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
          Section 8: Second Marquee
      ═══════════════════════════════════════════════════════ */}
      <MarqueeBanner text="NEW ARRIVALS ✕ " />

      {/* ═══════════════════════════════════════════════════════
          Section 9: Footer
      ═══════════════════════════════════════════════════════ */}
      <Footer />
    </>
  )
}
