type Variant = 'forest' | 'terracotta' | 'mustard'

interface StripeDividerProps {
  /** Height in pixels. Defaults to 12. */
  height?: number
  /** Color variant of the stripe. Defaults to 'forest'. */
  variant?: Variant
  className?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  forest:     'stripe-divider',
  terracotta: 'stripe-divider-terracotta',
  mustard:    'stripe-divider-mustard',
}

export default function StripeDivider({
  height = 12,
  variant = 'forest',
  className = '',
}: StripeDividerProps) {
  return (
    <div
      className={`w-full ${VARIANT_CLASS[variant]} ${className}`}
      style={{ height }}
      aria-hidden="true"
    />
  )
}
