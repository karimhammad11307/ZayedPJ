import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Zayed — Egyptian Clothing Brand',
    template: '%s — Zayed',
  },
  description:
    'Warm, editorial clothing pieces crafted with Egyptian spirit.',
  keywords: ['Egyptian fashion', 'clothing brand', 'women fashion', 'editorial style'],
  openGraph: {
    type: 'website',
    locale: 'en_EG',
    siteName: 'Zayed',
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
          <ToastProvider>
            {children}
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}
