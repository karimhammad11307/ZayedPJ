import Image from 'next/image'
import Link from 'next/link'

import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Settings from '@/models/Settings'
import ProductGrid from '@/components/ProductGrid'
import MarqueeBanner from '@/components/MarqueeBanner'
import StripeDivider from '@/components/StripeDivider'
import Footer from '@/components/Footer'
import RotatingAnnouncementBar from '@/components/RotatingAnnouncementBar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'ZAYED — Egyptian Clothing Brand',
  description:
    'Discover warm, editorial Egyptian-inspired clothing crafted for modern sensibility.',
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

export default async function HomePage() {
  await connectDB()

  const settingsRows = await Settings.find({}).lean()
  const settings: Record<string, string> = {}
  for (const row of settingsRows) settings[row.key] = row.value
  const heroImage = settings.hero_image || '/hero.jpg'

  const featuredRaw = await Product
    .find({ isFeatured: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()

  const newArrivalsRaw = await Product
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()

  const featured = JSON.parse(JSON.stringify(featuredRaw)) as LeanProduct[]
  const newArrivals = JSON.parse(JSON.stringify(newArrivalsRaw)) as LeanProduct[]
  const collageImages = [
    'https://placehold.co/352x448/E8B4A0/2C1810?text=ZAYED',
    'https://placehold.co/352x448/E8A820/2C1810?text=Made+in+Egypt',
    'https://placehold.co/352x448/F0E6D2/2C1810?text=Editorial',
  ]

  return (
    <>
      <RotatingAnnouncementBar />

      <section className="min-h-[95vh] grid grid-cols-1 lg:grid-cols-2">
        <div
          className="hero-grain relative min-h-[70vh] lg:min-h-[95vh] overflow-hidden"
          style={
            heroImage
              ? undefined
              : {
                  background:
                    'linear-gradient(135deg, #E8B4A0 0%, #C94B2C 40%, #E8A820 70%, #F5F0E8 100%)',
                }
          }
        >
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-heading italic text-[20vw] text-forest/5 select-none leading-none text-center z-[1]">
            ZY
          </span>
          {heroImage && (
            <Image
              src={heroImage}
              alt="ZAYED new collection"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="hidden lg:block absolute right-0 top-0 h-full w-20 z-[3]"
            aria-hidden="true"
          >
            <path d="M30,0 Q10,50 30,100 L100,100 L100,0 Z" fill="#F5F0E8" />
          </svg>
        </div>

        <div className="bg-cream px-8 py-16 lg:px-16 flex flex-col justify-center">
          <p className="section-label animate-fade-up">New Collection — 2026</p>
          <h1 className="heading-display text-brown mt-4 animate-fade-up animate-fade-up-delay-1">
            Dress the way you feel.
          </h1>
          <p className="font-body text-brown-muted text-lg max-w-xs leading-relaxed mt-6 animate-fade-up animate-fade-up-delay-2">
            Warm, editorial pieces crafted with Egyptian spirit and modern sensibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-fade-up animate-fade-up-delay-3">
            <Link href="/shop" className="btn-primary">Shop Now</Link>
            <Link href="/about" className="btn-mustard">Our Story</Link>
          </div>
          <div className="flex items-center gap-3 mt-8 animate-fade-up animate-fade-up-delay-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((item) => (
                <span
                  key={item}
                  className="w-8 h-8 rounded-full bg-cream-warm border-2 border-cream shadow-warm-sm"
                />
              ))}
            </div>
            <p className="text-brown-muted text-xs">Loved by 200+ customers ✦</p>
          </div>
        </div>
      </section>

      <MarqueeBanner variant="forest" />

      <section className="bg-cream-warm py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Handpicked for you</p>
            <h2 className="heading-editorial text-5xl lg:text-6xl mt-2">Bestsellers</h2>
          </div>
          <ProductGrid products={featured} />
          <div className="text-center mt-12">
            <Link href="/shop" className="btn-ghost">View entire collection →</Link>
          </div>
        </div>
      </section>

      <StripeDivider variant="terracotta" height={12} />

      <section className="bg-forest py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-14 items-center">
          <div>
            <p className="section-label text-mustard">Our Story</p>
            <h2 className="heading-editorial text-5xl text-cream mt-3">Made with intention.</h2>
            <div className="w-[60px] h-px bg-terracotta mt-4" />
            <div className="font-body text-cream/70 mt-6 leading-relaxed max-w-xl space-y-4">
              <p>
                ZAYED is built around clothes that carry warmth without noise: editorial shapes,
                soft movement, and details inspired by Egyptian ease.
              </p>
              <p>
                Each piece is chosen for daily confidence, made to feel considered, comfortable,
                and quietly distinctive.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center justify-center border border-cream text-cream px-6 py-3 rounded-btn transition-all duration-200 hover:bg-cream hover:text-forest"
            >
              Shop the Collection →
            </Link>
          </div>

          <div className="relative h-[420px] lg:h-[520px]">
            {collageImages.map((src, index) => {
              const positions = [
                'left-2 top-4 -rotate-3',
                'right-4 top-20 rotate-1',
                'left-1/4 bottom-2 -rotate-1',
              ]
              return (
                <div
                  key={src}
                  className={`absolute ${positions[index]} bg-white p-3 pb-10 shadow-warm-lg transition-transform duration-300 hover:z-10 hover:scale-[1.03]`}
                >
                  <div className="relative w-44 h-56 md:w-52 md:h-64 overflow-hidden bg-cream-warm">
                    <Image src={src} alt="ZAYED story collage" fill className="object-cover" unoptimized />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-cream-warm py-16 px-6 text-center">
        <p className="font-heading italic text-[8rem] text-terracotta/20 leading-none">200+</p>
        <p className="section-label">happy customers</p>
        <h2 className="heading-editorial text-3xl text-brown mt-2">and counting.</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {[
            ['50+ Pieces', 'in our collection'],
            ['2-3 Days', 'Cairo delivery'],
            ['Made in Egypt', 'locally crafted'],
          ].map(([value, label]) => (
            <div key={value}>
              <p className="font-heading italic text-2xl text-forest">{value}</p>
              <p className="section-label text-brown-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Just landed</p>
            <h2 className="heading-editorial text-5xl lg:text-6xl mt-2">New Arrivals</h2>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <MarqueeBanner variant="terracotta" />
      <Footer />
    </>
  )
}
