import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

/* ── Google Fonts via next/font (zero layout shift) ── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'serif'],
})

/* ── Site-wide metadata ── */
export const metadata: Metadata = {
  title: {
    default: 'ZAYED — Egyptian Clothing Brand',
    template: '%s | ZAYED',
  },
  description:
    'Discover our curated collection of Egyptian-inspired clothing. Warm, editorial, and beautifully crafted.',
  keywords: ['Egyptian fashion', 'clothing brand', 'women fashion', 'editorial style'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ZAYED',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-cream text-brown font-body antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
