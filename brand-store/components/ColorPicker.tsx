'use client'

interface ColorOption {
  color: string
  hex?: string
  stock: number
}

interface ColorPickerProps {
  variants: ColorOption[]
  selected: string | null
  onChange: (color: string) => void
}

export default function ColorPicker({ variants, selected, onChange }: ColorPickerProps) {
  // Deduplicate colors — keep the one with highest stock when same color appears multiple times
  const colorMap = new Map<string, ColorOption>()
  for (const v of variants) {
    const existing = colorMap.get(v.color)
    if (!existing || v.stock > existing.stock) {
      colorMap.set(v.color, v)
    }
  }
  const uniqueColors = Array.from(colorMap.values())

  return (
    <div>
      <p className="label-caps mb-2">
        Color{selected ? <span className="normal-case font-normal tracking-normal ml-1 text-brown">— {selected}</span> : null}
      </p>
      <div className="flex flex-wrap gap-3">
        {uniqueColors.map(({ color, hex, stock }) => {
          const outOfStock = stock === 0
          const isSelected = selected === color

          return (
            <button
              key={color}
              onClick={() => !outOfStock && onChange(color)}
              disabled={outOfStock}
              title={outOfStock ? `${color} — out of stock` : color}
              aria-label={outOfStock ? `${color} — out of stock` : color}
              aria-pressed={isSelected}
              className={`
                relative w-8 h-8 rounded-full border-2 transition-all duration-150
                ${outOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                  ? 'border-transparent ring-2 ring-mint ring-offset-2 ring-offset-cream'
                  : 'border-transparent hover:scale-110'
                }
              `}
              style={{ backgroundColor: hex ?? '#2C1810' }}
            >
              {/* Out of stock slash line */}
              {outOfStock && (
                <span
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <span className="block w-full h-px bg-brown/40 rotate-45" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
