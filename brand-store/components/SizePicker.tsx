'use client'

interface SizePickerProps {
  variants: { size: string; stock: number }[]
  selected: string | null
  onChange: (size: string) => void
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL']

export default function SizePicker({ variants, selected, onChange }: SizePickerProps) {
  // Build a map: size → total stock (sum across all colors)
  const stockBySize = variants.reduce<Record<string, number>>((acc, v) => {
    acc[v.size] = (acc[v.size] ?? 0) + v.stock
    return acc
  }, {})

  // Only show sizes that exist in the variant list, in standard order
  const sizes = SIZE_ORDER.filter((s) => stockBySize[s] !== undefined)

  return (
    <div>
      <p className="label-caps mb-2">Size</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const stock     = stockBySize[size] ?? 0
          const outOfStock = stock === 0
          const isSelected = selected === size

          return (
            <button
              key={size}
              onClick={() => !outOfStock && onChange(size)}
              disabled={outOfStock}
              aria-pressed={isSelected}
              aria-label={outOfStock ? `${size} — out of stock` : size}
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
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
