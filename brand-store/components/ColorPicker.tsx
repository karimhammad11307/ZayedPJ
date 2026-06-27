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
      <div className="flex flex-wrap gap-2">
        {uniqueColors.map(({ color, stock }) => {
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
                rounded-md border text-sm font-body px-3 py-2 transition-all duration-150
                ${outOfStock
                  ? 'opacity-40 line-through cursor-not-allowed border-brown/20 bg-cream-light text-brown'
                  : isSelected
                    ? 'bg-forest text-cream border-forest'
                    : 'bg-cream-light text-brown border-brown/20 hover:border-mint hover:text-mint cursor-pointer'
                }
              `}
            >
              {color}
            </button>
          )
        })}
      </div>
    </div>
  )
}
