'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface NavbarProps {
  onCartOpen: () => void
}

const NAV_LINKS = [
  { label: 'Home',  href: '/' },
  { label: 'Shop',  href: '/shop' },
  { label: 'About', href: '/about' },
]

export default function Navbar({ onCartOpen }: NavbarProps) {
  const { itemCount } = useCart()
  const router        = useRouter()
  const pathname      = usePathname()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartBounce, setCartBounce] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const previousItemCount = useRef(itemCount)

  /* ── Scroll listener ── */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Close mobile menu on outside click ── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!searchOpen) return
    const focusTimeout = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 80)
    return () => window.clearTimeout(focusTimeout)
  }, [searchOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    if (searchOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  useEffect(() => {
    setShowAnnouncement(localStorage.getItem('zayed-announcement-dismissed') !== 'true')
  }, [])

  useEffect(() => {
    if (itemCount > previousItemCount.current) {
      setCartBounce(true)
      const timeout = window.setTimeout(() => setCartBounce(false), 300)
      previousItemCount.current = itemCount
      return () => window.clearTimeout(timeout)
    }
    previousItemCount.current = itemCount
  }, [itemCount])

  function closeAnnouncement() {
    localStorage.setItem('zayed-announcement-dismissed', 'true')
    setShowAnnouncement(false)
  }

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = searchQuery.trim()
    setSearchOpen(false)
    setMenuOpen(false)

    if (!query) {
      router.push('/shop')
      return
    }

    router.push(`/shop?search=${encodeURIComponent(query)}`)
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? 'bg-cream-warm/95 backdrop-blur-md shadow-warm-sm'
          : 'bg-cream/80 backdrop-blur-md border-b border-brown/5'
        }
      `}
      ref={menuRef}
    >
      {showAnnouncement && (
        <div className="relative bg-forest text-cream text-center text-xs py-2 px-10">
          Free delivery on orders over 500 EGP ✦ New collection now live
          <button
            type="button"
            onClick={closeAnnouncement}
            aria-label="Close announcement"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/80 hover:text-cream transition-colors"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      <nav className="relative max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-2 flex items-center justify-between">

        {/* ── Desktop Nav Links (left) ── */}
        <ul className="hidden md:flex items-center gap-8 min-w-0 flex-1">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`
                  relative font-body text-sm tracking-widest uppercase transition-colors duration-200
                  after:absolute after:left-0 after:-bottom-1.5 after:h-[1.5px] after:w-full after:origin-left
                  after:bg-terracotta after:transition-transform after:duration-300
                  ${isActive(href)
                    ? 'text-terracotta after:scale-x-100'
                    : 'text-brown hover:text-terracotta after:scale-x-0 hover:after:scale-x-100'
                  }
                `}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Centered Logo ── */}
        <Link
          href="/"
          aria-label="Zayed home"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/zayed-logo.png"
            alt="Zayed"
            width={92}
            height={92}
            priority
            className="h-16 w-auto object-contain md:h-20"
          />
        </Link>

        {/* ── Desktop Actions (right) ── */}
        <div className="hidden md:flex items-center justify-end gap-4 min-w-0 flex-1">
          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className="text-brown hover:text-mint transition-colors duration-200 p-1"
          >
            {searchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
          </button>

          {/* Admin */}
          <Link
            href="/admin/login"
            aria-label="Admin Login"
            className="text-brown hover:text-mint transition-colors duration-200 p-1"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          {/* Cart */}
          <button
            aria-label={`Open cart, ${itemCount} items`}
            onClick={onCartOpen}
            className={`relative text-brown hover:text-mint transition-colors duration-200 p-1 ${cartBounce ? 'animate-bounce' : ''}`}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-mint text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Mobile Actions (right) ── */}
        <div className="ml-auto flex md:hidden items-center gap-3">
          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className="text-brown hover:text-mint transition-colors duration-200 p-1"
          >
            {searchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
          </button>

          {/* Admin */}
          <Link
            href="/admin/login"
            aria-label="Admin Login"
            className="text-brown hover:text-mint transition-colors duration-200 p-1"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          {/* Cart */}
          <button
            aria-label={`Open cart, ${itemCount} items`}
            onClick={onCartOpen}
            className={`relative text-brown hover:text-mint transition-colors duration-200 p-1 ${cartBounce ? 'animate-bounce' : ''}`}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-mint text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
            className="text-brown hover:text-mint transition-colors duration-200 p-1"
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* ── Search Panel ── */}
      <div
        className={`
          overflow-hidden border-t border-brown/10 bg-cream/95 backdrop-blur-md
          transition-all duration-300 ease-in-out
          ${searchOpen ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <form
          onSubmit={submitSearch}
          className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              strokeWidth={1.6}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-muted pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dresses, tops, colors..."
              className="input-base pl-11 pr-4 py-3"
            />
          </div>
          <button type="submit" className="btn-primary px-5 py-3">
            Search
          </button>
        </form>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <ul className="bg-cream-warm border-t border-brown/10">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`
                  block py-5 px-6 font-body text-sm tracking-widest uppercase
                  border-b border-brown/10 transition-colors duration-200
                  ${isActive(href)
                    ? 'text-terracotta'
                    : 'text-brown hover:text-terracotta'
                  }
                `}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
