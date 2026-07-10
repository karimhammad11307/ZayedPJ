'use client'

import { useState } from 'react'
import { ImagePlus, Loader2, Plus, X } from 'lucide-react'
import Image from 'next/image'
import ImageUploader from './ImageUploader'

interface Variant {
  size: string
  color: string
  stock: number
  waistPerimeter: string
}

interface ProductFormData {
  name: string
  category: string
  price: string
  description: string
  images: string[]
  variants: Variant[]
  isFeatured: boolean
  isActive: boolean
}

interface InitialProductData {
  name?: string
  category?: string
  price?: number
  description?: string
  images?: string[]
  variants?: { size: string; color: string; stock: number; waistPerimeter?: number }[]
  isFeatured?: boolean
  isActive?: boolean
  slug?: string
}

interface ProductFormProps {
  initialData?: InitialProductData
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear']
const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const DEFAULT_VARIANT = { size: 'S', color: '', stock: 0, waistPerimeter: '' }

function Toggle({
  checked,
  onChange,
  label,
  sublabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  sublabel: string
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-left">
      <span className={`w-12 h-6 rounded-full p-0.5 transition-all duration-200 ${checked ? 'bg-mint' : 'bg-brown/20'}`}>
        <span className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </span>
      <span>
        <span className="block text-sm font-medium text-brown">{label}</span>
        <span className="block text-xs text-brown-muted">{sublabel}</span>
      </span>
    </button>
  )
}

export default function ProductForm({ initialData, onClose, onSuccess }: ProductFormProps) {
  const isEdit = !!initialData
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'tops',
    price: initialData?.price?.toString() || '',
    description: initialData?.description || '',
    images: initialData?.images || [],
    variants: (initialData?.variants?.length ?? 0) > 0
      ? initialData!.variants!.map((v) => ({ ...v, waistPerimeter: v.waistPerimeter?.toString() ?? '' }))
      : [{ ...DEFAULT_VARIANT }],
    isFeatured: initialData?.isFeatured ?? false,
    isActive: initialData?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField(field: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleVariantChange(index: number, field: keyof Variant, value: string | number) {
    const variants = [...formData.variants]
    variants[index] = { ...variants[index], [field]: value }
    updateField('variants', variants)
  }

  function addVariant() {
    updateField('variants', [...formData.variants, { ...DEFAULT_VARIANT }])
  }

  function removeVariant(index: number) {
    if (formData.variants.length <= 1) return
    updateField('variants', formData.variants.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...formData,
      price: Number(formData.price),
      variants: formData.variants.map((variant) => ({
        ...variant,
        stock: Number(variant.stock),
        waistPerimeter: variant.waistPerimeter !== '' ? Number(variant.waistPerimeter) : undefined,
      })),
    }

    try {
      const url = isEdit ? `/api/products/${initialData.slug}` : '/api/products'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save product')
      }
      onSuccess()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-brown/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[18px] w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white z-10 border-b border-brown/10 px-8 pt-8 pb-4 flex items-start justify-between">
          <h2 className="heading-editorial text-2xl">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button type="button" onClick={onClose} className="text-brown/40 hover:text-terracotta transition-colors">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
            <div className="space-y-5">
              <input required value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="input-base" placeholder="Product name" />
              <textarea required value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows={5} className="input-base resize-y" placeholder="Description" />
              <select required value={formData.category} onChange={(e) => updateField('category', e.target.value)} className="input-base capitalize">
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div className="space-y-5">
              <div className="flex rounded-[10px] overflow-hidden border border-brown/15 bg-cream-light">
                <span className="bg-cream-warm px-3 border-r border-brown/15 text-brown-muted flex items-center text-sm">EGP</span>
                <input required type="number" min="0" value={formData.price} onChange={(e) => updateField('price', e.target.value)} className="flex-1 bg-transparent px-4 py-3 outline-none text-brown" placeholder="0" />
              </div>
              <Toggle checked={formData.isFeatured} onChange={(checked) => updateField('isFeatured', checked)} label="Featured" sublabel="Show on homepage" />
              <Toggle checked={formData.isActive} onChange={(checked) => updateField('isActive', checked)} label="Active" sublabel="Visible in store" />
            </div>

            <section className="md:col-span-2">
              <p className="section-label mb-3">Product Images</p>
              <div className="border-2 border-dashed border-brown/20 rounded-[16px] bg-cream-warm p-8 text-center hover:border-terracotta hover:bg-terracotta/3 transition-colors duration-200 mb-4">
                <ImagePlus className="text-brown/30 w-10 h-10 mx-auto" />
                <p className="font-body text-brown-muted mt-3">Drag images here or click to upload</p>
                <p className="section-label text-brown/30 mt-1">PNG, JPG up to 10MB · First image = main photo</p>
                <div className="mt-5">
                  <ImageUploader images={formData.images} onChange={(images) => updateField('images', images)} />
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {formData.images.map((image, index) => (
                    <div key={image} className="relative w-24 h-28 rounded-[10px] overflow-hidden border border-brown/10 flex-shrink-0">
                      <Image src={image} alt={`Product image ${index + 1}`} fill sizes="96px" className="object-cover" />
                      <span className="absolute left-1.5 top-1.5 text-white bg-brown/50 rounded px-1 text-xs">⠿</span>
                      <button type="button" onClick={() => updateField('images', formData.images.filter((_, i) => i !== index))} className="absolute top-1.5 right-1.5 bg-brown/60 text-white rounded-full w-5 h-5 hover:bg-terracotta transition-colors">×</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="md:col-span-2">
              <p className="section-label mb-3">Sizes & Stock</p>
              <div className="overflow-x-auto rounded-[12px] border border-brown/10">
                <div className="grid grid-cols-[90px_1fr_100px_60px] bg-cream-warm section-label px-4 py-2 min-w-[520px]">
                  <span>Size</span>
                  <span>Color</span>
                  <span>Stock</span>
                  <span />
                </div>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-[90px_1fr_100px_60px] items-center gap-3 bg-white border-b border-brown/5 px-4 py-3 min-w-[520px]">
                    <select value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="input-base py-2 px-3">
                      {SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-brown/15 flex-shrink-0" style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(variant.color) ? variant.color : '#8B6F5E' }} />
                      <input required value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="input-base py-2" placeholder="Forest Green or #1E4D3A" />
                    </div>
                    <input required type="number" min="0" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="input-base py-2" />
                    <button type="button" onClick={() => removeVariant(index)} disabled={formData.variants.length === 1} className="text-brown/30 hover:text-terracotta disabled:opacity-30 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addVariant} className="btn-ghost text-sm mt-3 inline-flex items-center gap-2">
                <Plus size={16} /> Add Variant
              </button>
            </section>

            {error && <p className="md:col-span-2 text-terracotta text-sm bg-terracotta/10 p-3 rounded-[10px]">{error}</p>}
          </div>

          <div className="bg-white border-t border-brown/10 px-8 py-5 sticky bottom-0 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving || formData.images.length === 0} className={`btn-primary ${saving ? 'opacity-70' : ''}`}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
