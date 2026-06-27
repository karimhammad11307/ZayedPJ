'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
  const pathname      = usePathname()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? 'bg-cream-warm/95 backdrop-blur-md shadow-sm'
          : 'bg-cream'
        }
      `}
      ref={menuRef}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-2 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex-shrink-0 hover:opacity-80 transition-opacity inline-flex items-center"
        >
          <Image 
            src="/icon-removebg-preview.png" 
            alt="Zayed Logo" 
            width={280} 
            height={280} 
            className="object-contain h-20 w-auto md:h-28" 
            priority
          />
        </Link>

        {/* ── Desktop Nav Links (center) ── */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`
                  font-body text-sm tracking-widest uppercase transition-colors duration-200
                  ${isActive(href)
                    ? 'text-terracotta underline underline-offset-4 decoration-terracotta'
                    : 'text-brown hover:text-terracotta'
                  }
                `}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop Actions (right) ── */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search */}
          <button
            aria-label="Search"
            className="text-brown hover:text-mint transition-colors duration-200 p-1"
          >
            <Search size={20} strokeWidth={1.5} />
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
            className="relative text-brown hover:text-mint transition-colors duration-200 p-1"
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
        <div className="flex md:hidden items-center gap-3">
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
            className="relative text-brown hover:text-mint transition-colors duration-200 p-1"
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

      {/* ── Mobile Dropdown Menu ── */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <ul className="bg-cream border-t border-brown/10">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`
                  block py-4 px-6 font-body text-sm tracking-widest uppercase
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
