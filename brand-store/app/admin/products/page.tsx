'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Edit2, Eye, EyeOff, Grid2X2, List, Plus, Search, Trash2 } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'
import { useToast } from '@/context/ToastContext'

interface AdminProduct {
  _id: string
  name: string
  slug: string
  price: number
  category: string
  images: string[]
  variants: { size: string; color: string; stock: number; waistPerimeter?: number }[]
  isFeatured: boolean
  isActive: boolean
}

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [productToDelete, setProductToDelete] = useState<{ slug: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = useCallback(async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      toast({ type: 'error', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function toggleActive(slug: string, currentStatus: boolean) {
    const previousProducts = [...products]
    setProducts(products.map((product) => product.slug === slug ? { ...product, isActive: !currentStatus } : product))
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error('Toggle failed')
      toast({ type: 'success', message: 'Product status updated' })
    } catch (err) {
      setProducts(previousProducts)
      toast({ type: 'error', message: (err as Error).message })
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return
    setIsDeleting(true)
    const previousProducts = [...products]
    setProducts(products.filter((product) => product.slug !== productToDelete.slug))

    try {
      const res = await fetch(`/api/products/${productToDelete.slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast({ type: 'success', message: 'Product deleted' })
      setProductToDelete(null)
    } catch (err) {
      setProducts(previousProducts)
      toast({ type: 'error', message: (err as Error).message })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) =>
      [product.name, product.category, product.slug].some((value) => value.toLowerCase().includes(query))
    )
  }, [products, search])

  function openAddModal() {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  function openEditModal(product: AdminProduct) {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  function handleModalSuccess() {
    setIsModalOpen(false)
    toast({ type: 'success', message: 'Product saved' })
    fetchProducts()
  }

  function stockLabel(totalStock: number) {
    if (totalStock === 0) return <span className="text-brown-muted">Out of stock</span>
    if (totalStock < 5) return <span className="text-terracotta">Low stock</span>
    return <span className="text-brown-muted">{totalStock} in stock</span>
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading italic text-4xl text-brown">Products</h1>
          <p className="section-label text-brown-muted mt-1">{filteredProducts.length} shown</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-base max-w-xs pl-10"
              placeholder="Search products"
            />
          </div>
          <div className="flex bg-white border border-brown/10 rounded-[10px] p-1">
            <button type="button" onClick={() => setView('grid')} className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-cream-warm' : 'hover:bg-cream'}`} aria-label="Grid view">
              <Grid2X2 size={18} />
            </button>
            <button type="button" onClick={() => setView('list')} className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-cream-warm' : 'hover:bg-cream'}`} aria-label="List view">
              <List size={18} />
            </button>
          </div>
          <button type="button" onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-[16px] overflow-hidden border border-brown/5 shadow-warm-sm">
              <div className="aspect-square skeleton-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 skeleton-shimmer rounded w-2/3" />
                <div className="h-5 skeleton-shimmer rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
            const primaryImg = product.images[0] || 'https://placehold.co/400x400/F5F0E8/2C1810?text=No+Image'
            return (
              <div key={product._id} className="group bg-white rounded-[16px] overflow-hidden border border-brown/5 shadow-warm-sm relative">
                <div className="relative aspect-square bg-cream-warm">
                  <Image src={primaryImg} alt={product.name} fill className="object-cover" unoptimized={primaryImg.includes('placehold.co')} />
                  <span title={product.isActive ? 'Active' : 'Hidden'} className={`absolute top-3 right-3 w-3 h-3 rounded-full ${product.isActive ? 'bg-mint' : 'bg-brown/30'} ring-2 ring-white`} />
                  <div className="absolute inset-x-3 bottom-3 flex justify-end gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button type="button" onClick={() => openEditModal(product)} className="bg-white shadow-warm-sm rounded-md p-2 hover:text-mint transition-colors" aria-label="Edit product">
                      <Edit2 size={16} />
                    </button>
                    <button type="button" onClick={() => toggleActive(product.slug, product.isActive)} className="bg-white shadow-warm-sm rounded-md p-2 hover:text-forest transition-colors" aria-label="Toggle active">
                      {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button type="button" onClick={() => setProductToDelete({ slug: product.slug, name: product.name })} className="bg-white shadow-warm-sm rounded-md p-2 hover:text-terracotta transition-colors" aria-label="Delete product">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-brown text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-terracotta font-heading italic text-xl mt-1">EGP {product.price.toLocaleString('en-EG')}</p>
                  <p className="text-xs mt-2">{stockLabel(totalStock)}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[16px] border border-brown/5 shadow-warm-sm overflow-hidden">
          {filteredProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
            return (
              <div key={product._id} className="grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center px-5 py-4 border-b border-brown/10 last:border-0">
                <div>
                  <p className="font-medium text-brown text-sm">{product.name}</p>
                  <p className="section-label text-brown-muted mt-1">{product.category}</p>
                </div>
                <p className="font-heading italic text-terracotta">EGP {product.price.toLocaleString('en-EG')}</p>
                <p className="text-xs">{stockLabel(totalStock)}</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => openEditModal(product)} className="p-2 rounded-md hover:bg-cream transition-colors"><Edit2 size={16} /></button>
                  <button type="button" onClick={() => toggleActive(product.slug, product.isActive)} className="p-2 rounded-md hover:bg-cream transition-colors">{product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button type="button" onClick={() => setProductToDelete({ slug: product.slug, name: product.name })} className="p-2 rounded-md hover:bg-cream hover:text-terracotta transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <ProductForm
          initialData={editingProduct ?? undefined}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close delete modal" className="absolute inset-0 bg-brown/50 backdrop-blur-sm" onClick={() => !isDeleting && setProductToDelete(null)} />
          <div className="relative bg-white rounded-[16px] shadow-2xl p-8 max-w-sm w-full border border-brown/10">
            <h3 className="heading-editorial text-3xl text-brown text-center mb-2">Delete Product</h3>
            <p className="text-brown-muted text-center text-sm mb-6 leading-relaxed">
              Permanently delete <span className="font-semibold text-brown">{productToDelete.name}</span>?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setProductToDelete(null)} className="flex-1 btn-ghost" disabled={isDeleting}>Cancel</button>
              <button type="button" onClick={confirmDelete} className="flex-1 btn-primary" disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
