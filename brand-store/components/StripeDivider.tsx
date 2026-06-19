interface StripeDividerProps {
  /** Height in pixels. Defaults to 60. */
  height?: number
  className?: string
}

export default function StripeDivider({ height = 60, className = '' }: StripeDividerProps) {
  return (
    <div
      className={`stripe-divider w-full ${className}`}
      style={{ height }}
      aria-hidden="true"
    />
  )
}
