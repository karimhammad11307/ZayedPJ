import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import StripeDivider from '@/components/StripeDivider'

export const metadata = {
  title: 'Our Story | Brand Store',
  description: 'The story behind our Egyptian clothing brand.',
}

export default function AboutPage() {
  return (
    <>
      <div className="bg-forest min-h-screen pt-20 pb-24 px-6 text-cream">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-heading italic text-5xl md:text-7xl mb-4 text-cream">
              Made with intention.
            </h1>
            <p className="font-body text-cream/70 text-lg max-w-xl mx-auto">
              Our pieces are crafted to speak quietly of confidence, warmth, and culture rooted in the Egyptian spirit.
            </p>
          </div>

          {/* Image + Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-card overflow-hidden shadow-2xl bg-blush/30">
              <Image
                src="https://placehold.co/600x750/E8B4A0/2C1810?text=Our+Story"
                alt="Our Story"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <p className="label-caps text-cream/50 mb-4">Our Philosophy</p>
              <div className="space-y-6 font-body text-cream/80 text-base leading-relaxed">
                <p>
                  We believe clothing is a language. Every piece in our collection is crafted to
                  speak quietly of confidence, warmth, and culture rooted in the Egyptian spirit.
                </p>
                <p>
                  Born in Egypt, designed for the woman who knows what she wants — comfort
                  without compromise, elegance without effort. We source the finest materials to ensure 
                  each garment feels as good as it looks.
                </p>
                <p>
                  Our commitment is to quality, sustainability, and timeless design. We don't follow fast fashion trends; 
                  we create wardrobe staples that you will cherish for years to come.
                </p>
              </div>

              <div className="mt-10">
                <Link
                  href="/shop"
                  className="
                    inline-flex items-center justify-center gap-2
                    border border-cream text-cream
                    font-body font-medium text-sm
                    px-6 py-3 rounded-btn
                    transition-all duration-200
                    hover:bg-cream hover:text-forest
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream
                    select-none
                  "
                >
                  Shop the Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StripeDivider />
      <Footer />
    </>
  )
}
