interface MarqueeBannerProps {
  /** The repeating text unit. Defaults to "BRAND NAME ✕ " */
  text?: string
}

export default function MarqueeBanner({ text = 'BRAND NAME ✕ ' }: MarqueeBannerProps) {
  // Repeat content 8 times per track; two tracks side-by-side for seamless loop
  const content = text.repeat(8)

  return (
    <div
      className="bg-forest text-cream py-3 marquee-container select-none"
      aria-hidden="true" // decorative element
    >
      {/* Two identical tracks placed side by side — CSS animates -50% so it loops seamlessly */}
      <div className="marquee-track">
        <span className="font-body text-sm tracking-widest uppercase opacity-90 pr-0">
          {content}
        </span>
        <span className="font-body text-sm tracking-widest uppercase opacity-90 pr-0">
          {content}
        </span>
      </div>
    </div>
  )
}
