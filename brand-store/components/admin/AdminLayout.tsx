'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ExternalLink, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, X } from 'lucide-react'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'mennadel.official@gmail.com'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const navLinks = useMemo(() => [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ], [])

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await fetch('/api/orders?status=pending')
        if (!res.ok) return
        const data = await res.json()
        setPendingCount(Array.isArray(data.orders) ? data.orders.length : 0)
      } catch {
        setPendingCount(0)
      }
    }
    fetchPendingCount()
  }, [])

  async function handleSignOut() {
    try {
      await fetch('/api/admin/login?action=logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const breadcrumb = pathname
    .split('/')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' / ')

  const initials = ADMIN_EMAIL.split('@')[0]
    .split(/[.\-_]/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const SidebarContent = () => (
    <>
      <div className="pt-8 px-6">
        <div className="flex items-center justify-between">
          <span className="font-heading italic text-xl text-cream">Zayed</span>
          <button
            type="button"
            aria-label="Close menu"
            className="md:hidden text-cream/70 hover:text-cream transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <div className="w-8 h-0.5 bg-mustard mt-2 mb-8" />
      </div>

      <nav className="flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          const isOrders = link.href === '/admin/orders'
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                relative mx-2 mb-1 flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm transition-all duration-200
                ${isActive
                  ? 'bg-white/10 text-cream border-l-[3px] border-terracotta pl-[calc(1rem-3px)]'
                  : 'text-cream/60 hover:bg-white/5 hover:text-cream/90'
                }
              `}
            >
              <span className="relative">
                <Icon size={18} />
                {isOrders && pendingCount > 0 && (
                  <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-terracotta" />
                )}
              </span>
              {link.label}
            </Link>
          )
        })}

        <Link
          href="/"
          target="_blank"
          className="mx-2 mb-1 flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm text-cream/60 hover:bg-white/5 hover:text-cream/90 transition-all duration-200"
        >
          <ExternalLink size={18} />
          View Store
        </Link>
      </nav>

      <div className="pb-4">
        <p className="text-cream/40 text-xs px-6 truncate">{ADMIN_EMAIL}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-cream/50 hover:text-cream text-sm flex items-center gap-2 px-6 py-4 transition-colors duration-200"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-cream-light flex flex-col md:flex-row">
      <div className="md:hidden bg-forest-dark h-14 flex items-center justify-between px-4 shrink-0 sticky top-0 z-40">
        <span className="font-heading italic text-xl text-cream">Zayed</span>
        <button type="button" onClick={() => setMobileMenuOpen(true)} className="text-cream">
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-brown/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-forest-dark h-full flex flex-col shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-forest-dark flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      <div className="flex-1 md:ml-64 min-h-screen">
        <header className="hidden md:flex h-16 bg-cream-light border-b border-brown/10 items-center justify-between px-8 sticky top-0 z-20">
          <p className="text-sm text-brown-muted">{breadcrumb || 'Admin'}</p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-brown-muted">{ADMIN_EMAIL}</p>
            <span className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center text-xs font-medium">
              {initials}
            </span>
          </div>
        </header>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
