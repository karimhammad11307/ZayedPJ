'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, ExternalLink, LogOut, Menu, X } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NAV_LINKS = [
    { label: 'Dashboard', href: '/admin',          icon: LayoutDashboard },
    { label: 'Products',  href: '/admin/products', icon: Package },
    { label: 'Orders',    href: '/admin/orders',   icon: ShoppingBag },
  ]

  async function handleSignOut() {
    try {
      await fetch('/api/admin/login?action=logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const SidebarContent = () => (
    <>
      {/* Mustard accent top bar */}
      <div className="h-1 w-full bg-mustard shrink-0" aria-hidden="true" />
      <div className="pt-6 px-6 mb-8 flex items-center justify-between">
        <span className="font-heading italic text-2xl text-cream">ZAYED</span>
        {/* Mobile close button */}
        <button 
          className="md:hidden text-cream/70 hover:text-cream"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-6 py-3 font-body text-sm transition-colors
                ${isActive 
                  ? 'text-cream bg-white/10 border-r-2 border-mustard' 
                  : 'text-cream/70 hover:text-cream hover:bg-forest-dark'
                }
              `}
            >
              <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.label}
            </Link>
          )
        })}

        <div className="my-4 mx-6 border-t border-cream/10" />

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-6 py-3 font-body text-sm text-cream/70 hover:text-cream hover:bg-forest-dark transition-colors"
        >
          <ExternalLink size={18} />
          View Store
        </Link>
        
        <button
          onClick={handleSignOut}
          className="w-full text-left flex items-center gap-3 px-6 py-3 font-body text-sm text-terracotta hover:bg-forest-dark transition-colors mt-auto mb-8"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-cream-light flex flex-col md:flex-row">
      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden bg-forest h-14 flex items-center justify-between px-4 shrink-0 sticky top-0 z-40 border-b-4 border-mustard">
        <span className="font-heading italic text-xl text-cream">ZAYED</span>
        <button onClick={() => setMobileMenuOpen(true)} className="text-cream">
          <Menu size={24} />
        </button>
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="absolute inset-0 bg-brown/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-forest h-full flex flex-col shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex w-64 bg-forest flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
