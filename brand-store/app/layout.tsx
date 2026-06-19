import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

/* ── Google Fonts via next/font (zero layout shift) ── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/* ── Site-wide metadata ── */
export const metadata: Metadata = {
  title: {
    default: 'Brand Store — Egyptian Clothing Brand',
    template: '%s | Brand Store',
  },
  description:
    'Discover our curated collection of Egyptian-inspired clothing. Warm, editorial, and beautifully crafted.',
  keywords: ['Egyptian fashion', 'clothing brand', 'women fashion', 'editorial style'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Brand Store',
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
