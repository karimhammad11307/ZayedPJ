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

function colorToCss(color: string) {
  const normalized = color.toLowerCase()
  if (normalized.includes('forest') || normalized.includes('green')) return '#1E4D3A'
  if (normalized.includes('terracotta') || normalized.includes('rust') || normalized.includes('red')) return '#C94B2C'
  if (normalized.includes('mustard') || normalized.includes('yellow')) return '#E8A820'
  if (normalized.includes('cream') || normalized.includes('white')) return '#F5F0E8'
  if (normalized.includes('brown')) return '#2C1810'
  if (normalized.includes('black')) return '#111111'
  if (normalized.includes('blue')) return '#345C7C'
  if (normalized.includes('pink') || normalized.includes('blush')) return '#E8B4A0'
  return '#8B6F5E'
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
      <p className="section-label mb-2">
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
                w-10 h-10 rounded-full border text-[0px] transition-all duration-150
                ${outOfStock
                  ? 'opacity-40 cursor-not-allowed border-brown/20 bg-cream-light'
                  : isSelected
                    ? 'ring-2 ring-offset-2 ring-terracotta border-transparent'
                    : 'border-transparent hover:ring-1 hover:ring-brown/30 cursor-pointer'
                }
              `}
              style={{ backgroundColor: colorToCss(color) }}
            >
              {color}
            </button>
          )
        })}
      </div>
    </div>
  )
}
