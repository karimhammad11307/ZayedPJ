'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const router = useRouter()
  
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Invalid credentials')
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const INPUT_CLASS =
    'w-full border border-brown/20 rounded-card bg-cream-light px-4 py-3 font-body text-brown text-sm ' +
    'focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint ' +
    'placeholder:text-brown-muted/50 transition-colors duration-150'

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="bg-white rounded-card shadow-md p-10 max-w-sm w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image 
            src="/icon-removebg-preview.png" 
            alt="Zayed Logo" 
            width={200} 
            height={200} 
            className="object-contain h-32 w-auto mb-2" 
            priority
          />
          <p className="label-caps text-brown-muted">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label-caps text-brown mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label-caps text-brown mb-1 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full mt-6 text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {error && (
            <p className="text-terracotta text-sm text-center mt-3 font-body">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
