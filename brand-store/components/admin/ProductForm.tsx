'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ImageUploader from './ImageUploader'

interface Variant {
  size:           string
  color:          string
  stock:          number
  waistPerimeter: string  // stored as string in form, converted to number on submit
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
const DEFAULT_VARIANT = { size: 'S', color: '', stock: 0, waistPerimeter: '' }

export default function ProductForm({ initialData, onClose, onSuccess }: ProductFormProps) {
  const isEdit = !!initialData

  const [formData, setFormData] = useState<ProductFormData>({
    name:        initialData?.name || '',
    category:    initialData?.category || 'tops',
    price:       initialData?.price?.toString() || '',
    description: initialData?.description || '',
    images:      initialData?.images || [],
    variants:    (initialData?.variants?.length ?? 0) > 0
      ? (initialData!.variants!).map((v: { size: string; color: string; stock: number; waistPerimeter?: number }) => ({
          ...v,
          waistPerimeter: v.waistPerimeter?.toString() ?? '',
        }))
      : [{ ...DEFAULT_VARIANT }],
    isFeatured:  initialData?.isFeatured ?? false,
    isActive:    initialData?.isActive ?? true,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const addVariant = () => {
    setFormData(prev => ({ ...prev, variants: [...prev.variants, { ...DEFAULT_VARIANT }] }))
  }

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) return
    const newVariants = [...formData.variants]
    newVariants.splice(index, 1)
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Format payload
    const payload = {
      ...formData,
      price: Number(formData.price),
      variants: formData.variants.map(v => ({
        ...v,
        stock: Number(v.stock),
        waistPerimeter: v.waistPerimeter !== '' ? Number(v.waistPerimeter) : undefined,
      }))
    }

    try {
      const url = isEdit ? `/api/products/${initialData.slug}` : '/api/products'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  const INPUT_CLASS = "w-full border border-brown/20 rounded-md bg-cream-light px-3 py-2 font-body text-sm text-brown focus:border-mint focus:outline-none"
  const LABEL_CLASS = "label-caps text-brown mb-1 block"

  return (
    <div className="fixed inset-0 bg-forest/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-brown/10 px-8 py-5 flex items-center justify-between z-10">
          <h2 className="font-heading italic text-2xl text-brown">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-brown-muted hover:text-brown">
            <Trash2 size={20} className="hidden" /> {/* just for spacing consistency if needed, wait no we use X */}
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* ── Basic Info ── */}
          <section>
            <h3 className="label-caps border-b border-brown/10 pb-2 mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={LABEL_CLASS}>Product Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className={INPUT_CLASS} placeholder="e.g. The Linen Wrap Dress" />
              </div>
              
              <div>
                <label className={LABEL_CLASS}>Category</label>
                <select required name="category" value={formData.category} onChange={handleChange} className={`${INPUT_CLASS} capitalize`}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className={LABEL_CLASS}>Price (EGP)</label>
                <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className={INPUT_CLASS} placeholder="0.00" />
              </div>

              <div className="md:col-span-2">
                <label className={LABEL_CLASS}>Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className={`${INPUT_CLASS} resize-none`} placeholder="Write a compelling description..." />
              </div>
            </div>
          </section>

          {/* ── Images ── */}
          <section>
            <h3 className="label-caps border-b border-brown/10 pb-2 mb-4">Product Images</h3>
            <ImageUploader 
              images={formData.images} 
              onChange={(images) => setFormData(prev => ({ ...prev, images }))} 
            />
          </section>

          {/* ── Variants ── */}
          <section>
            <h3 className="label-caps border-b border-brown/10 pb-2 mb-4">Sizes & Stock</h3>
            <div className="space-y-3">
              {formData.variants.map((variant, i) => (
                <div key={i} className="flex items-end gap-3 bg-cream-light p-3 rounded-md border border-brown/10 flex-wrap">
                  <div className="w-20">
                    <label className="text-[10px] uppercase tracking-wider text-brown-muted block mb-1">Size</label>
                    <input required value={variant.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} className={INPUT_CLASS} placeholder="S" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] uppercase tracking-wider text-brown-muted block mb-1">Color</label>
                    <input required value={variant.color} onChange={(e) => handleVariantChange(i, 'color', e.target.value)} className={INPUT_CLASS} placeholder="e.g. Olive" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] uppercase tracking-wider text-brown-muted block mb-1">Stock</label>
                    <input required type="number" min="0" value={variant.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} className={INPUT_CLASS} />
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] uppercase tracking-wider text-brown-muted block mb-1">Waist (cm) <span className="normal-case text-[9px] text-brown-muted">(optional)</span></label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={variant.waistPerimeter}
                      onChange={(e) => handleVariantChange(i, 'waistPerimeter', e.target.value)}
                      className={INPUT_CLASS}
                      placeholder="e.g. 72.5"
                    />
                  </div>
                  <div className="pb-0.5">
                    <button type="button" onClick={() => removeVariant(i)} disabled={formData.variants.length === 1} className="p-2 text-brown-muted hover:text-terracotta disabled:opacity-30">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="flex items-center gap-2 text-sm font-body text-mint hover:text-forest mt-2">
                <Plus size={16} /> Add Variant
              </button>
            </div>
          </section>

          {/* ── Settings ── */}
          <section>
            <h3 className="label-caps border-b border-brown/10 pb-2 mb-4">Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isFeatured} 
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} 
                  className="w-4 h-4 text-mint focus:ring-mint border-brown/20 rounded"
                />
                <span className="font-body text-sm text-brown">Featured Product (Shows on homepage)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} 
                  className="w-4 h-4 text-mint focus:ring-mint border-brown/20 rounded"
                />
                <span className="font-body text-sm text-brown">Active / Visible in store</span>
              </label>
            </div>
          </section>

          {error && <p className="text-terracotta text-sm font-body bg-terracotta/10 p-3 rounded-md">{error}</p>}

          {/* ── Submit ── */}
          <div className="pt-4 border-t border-brown/10 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="btn-outline px-6 py-2">
              Cancel
            </button>
            <button type="submit" disabled={saving || formData.images.length === 0} className={`btn-primary px-8 py-2 ${saving ? 'opacity-70' : ''}`}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
