'use client'

import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-cream-light flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="heading-editorial text-5xl">Something went wrong.</h1>
        <p className="section-label text-brown-muted mt-4">{error.message || 'The admin panel could not load.'}</p>
        <div className="flex justify-center gap-3 mt-8">
          <button type="button" onClick={reset} className="btn-outline">Try Again</button>
          <Link href="/" className="btn-ghost">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
