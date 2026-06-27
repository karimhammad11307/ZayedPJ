type Variant = 'forest' | 'terracotta' | 'mustard'

interface MarqueeBannerProps {
  /** The repeating text unit. Defaults to "ZAYED ✕ " */
  text?: string
  /** Background color variant. Defaults to 'forest'. */
  variant?: Variant
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string }> = {
  forest:     { bg: 'bg-forest',     text: 'text-cream' },
  terracotta: { bg: 'bg-terracotta', text: 'text-white' },
  mustard:    { bg: 'bg-mustard',    text: 'text-brown' },
}

export default function MarqueeBanner({
  text = 'ZAYED ✕ ',
  variant = 'forest',
}: MarqueeBannerProps) {
  const content = text.repeat(8)
  const { bg, text: textColor } = VARIANT_STYLES[variant]

  return (
    <div
      className={`${bg} ${textColor} py-3 marquee-container select-none`}
      aria-hidden="true"
    >
      <div className="marquee-track">
        <span className="font-body text-sm tracking-widest uppercase opacity-90">
          {content}
        </span>
        <span className="font-body text-sm tracking-widest uppercase opacity-90">
          {content}
        </span>
      </div>
    </div>
  )
}
