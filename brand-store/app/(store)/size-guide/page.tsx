import Link from 'next/link'

const SIZE_ROWS = [
  ['XS', '80-84', '62-66', '88-92'],
  ['S', '84-88', '66-70', '92-96'],
  ['M', '88-94', '70-76', '96-102'],
  ['L', '94-100', '76-82', '102-108'],
  ['XL', '100-108', '82-90', '108-116'],
]

export const metadata = {
  title: 'Size Guide',
  description: 'Zayed size guide for choosing the right fit.',
}

export default function SizeGuidePage() {
  return (
    <main className="bg-cream min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/shop" className="text-brown-muted hover:text-brown text-sm transition-colors">
          ← Back to shop
        </Link>

        <div className="mt-10 text-center">
          <p className="section-label text-brown-muted">Fit reference</p>
          <h1 className="heading-display text-brown mt-2">Size Guide</h1>
          <p className="text-brown-muted max-w-xl mx-auto mt-4">
            Measurements are in centimeters. If you are between sizes, choose the larger size for a relaxed fit.
          </p>
        </div>

        <div className="bg-white rounded-[20px] shadow-warm-sm border border-brown/5 overflow-hidden mt-12">
          <div className="grid grid-cols-4 bg-cream-warm section-label text-brown-muted px-5 py-4">
            <span>Size</span>
            <span>Bust</span>
            <span>Waist</span>
            <span>Hips</span>
          </div>
          {SIZE_ROWS.map(([size, bust, waist, hips]) => (
            <div key={size} className="grid grid-cols-4 px-5 py-4 border-t border-brown/10 text-sm">
              <span className="font-heading italic text-xl text-forest">{size}</span>
              <span>{bust}</span>
              <span>{waist}</span>
              <span>{hips}</span>
            </div>
          ))}
        </div>

        <div className="bg-cream-warm rounded-[16px] p-6 mt-8">
          <p className="section-label text-brown-muted mb-3">How to measure</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-brown-muted leading-relaxed">
            <p><span className="font-medium text-brown">Bust:</span> Measure around the fullest part of your chest.</p>
            <p><span className="font-medium text-brown">Waist:</span> Measure the narrowest part of your waist.</p>
            <p><span className="font-medium text-brown">Hips:</span> Measure around the fullest part of your hips.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
