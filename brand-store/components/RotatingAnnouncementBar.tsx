'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Free delivery on orders over 500 EGP',
  'New collection — now live',
  'Handcrafted in Egypt ✦',
]

export default function RotatingAnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % MESSAGES.length)
        setVisible(true)
      }, 220)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="bg-forest text-cream/90 text-center py-2.5 text-xs tracking-wide">
      <p className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {MESSAGES[index]}
      </p>
    </div>
  )
}
