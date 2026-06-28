'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'

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
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  
  // Delete Confirmation Modal state
  const [productToDelete, setProductToDelete] = useState<{ slug: string, name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      setErrorMsg((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(slug: string, currentStatus: boolean) {
    const previousProducts = [...products]
    setProducts(products.map(p => p.slug === slug ? { ...p, isActive: !currentStatus } : p))
    
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error('Toggle failed')
    } catch (_err) {
      setProducts(previousProducts)
      alert('Failed to update product status')
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return
    setIsDeleting(true)
    
    const slug = productToDelete.slug
    const previousProducts = [...products]
    setProducts(products.filter(p => p.slug !== slug)) // Completely remove it
    
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setProductToDelete(null)
      fetchProducts() // Refresh to get proper list
    } catch (_err) {
      setProducts(previousProducts)
      alert('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    fetchProducts()
  }

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading italic text-4xl text-brown">Products</h1>
          <p className="label-caps text-brown-muted mt-1">{products.length} total</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {errorMsg && (
        <div className="bg-terracotta/10 text-terracotta p-4 rounded-card mb-6 text-sm font-body">
          {errorMsg}
        </div>
      )}

      {/* ── Products Grid ── */}
      {loading ? (
        <div className="p-8 text-center text-brown-muted font-body">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-card shadow-sm p-12 text-center border border-brown/10">
          <p className="font-heading italic text-2xl text-brown mb-2">No products yet</p>
          <p className="text-brown-muted font-body mb-6 text-sm">Add your first piece to the collection.</p>
          <button onClick={openAddModal} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => {
            const totalStock = product.variants?.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0) || 0
            const primaryImg = product.images?.[0] || 'https://placehold.co/400x400/F5F0E8/2C1810?text=No+Image'

            return (
              <div key={product._id} className={`bg-white rounded-card shadow-sm overflow-hidden flex flex-col transition-opacity ${!product.isActive ? 'opacity-70 grayscale-[20%]' : ''}`}>
                {/* Image */}
                <div className="relative aspect-square w-full bg-cream-light">
                  <Image 
                    src={primaryImg} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                    unoptimized={primaryImg.includes('placehold.co')} 
                  />
                  {!product.isActive && (
                    <div className="absolute top-3 left-3 bg-brown/80 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                      Hidden
                    </div>
                  )}
                  {product.isFeatured && (
                    <div className="absolute top-3 right-3 bg-mint text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow">
                      Featured
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-body font-medium text-brown text-base leading-tight line-clamp-1 flex-1 pr-2">
                      {product.name}
                    </h3>
                    <span className="font-heading italic text-lg text-mint whitespace-nowrap">
                      EGP {product.price?.toLocaleString('en-EG')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 mb-4">
                    <span className="label-caps text-brown-muted capitalize">{product.category}</span>
                    <span className={`text-xs font-medium ${totalStock === 0 ? 'text-terracotta' : 'text-brown-muted'}`}>
                      {totalStock} in stock
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-auto pt-4 border-t border-brown/10 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => openEditModal(product)} 
                      className="btn-outline flex-1 py-1.5 text-xs flex justify-center items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    
                    <button 
                      onClick={() => toggleActive(product.slug, product.isActive)}
                      className={`p-2 rounded-md border transition-colors ${product.isActive ? 'border-mint text-mint hover:bg-mint/10' : 'border-brown-muted text-brown-muted hover:bg-brown/5'}`}
                      title={product.isActive ? 'Hide product' : 'Show product'}
                    >
                      {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    
                    <button 
                      onClick={() => setProductToDelete({ slug: product.slug, name: product.name })}
                      className="p-2 rounded-md border border-terracotta/20 text-terracotta hover:bg-terracotta/10 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {isModalOpen && (
        <ProductForm 
          initialData={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleModalSuccess} 
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brown/50 backdrop-blur-sm" onClick={() => !isDeleting && setProductToDelete(null)} />
          <div className="relative bg-white rounded-card shadow-2xl p-8 max-w-sm w-full border border-brown/10">
            <div className="flex justify-center mb-4">
              <div className="bg-terracotta/10 p-3 rounded-full text-terracotta">
                <Trash2 size={32} />
              </div>
            </div>
            <h3 className="font-heading italic text-3xl text-brown text-center mb-2">Delete Product</h3>
            <p className="font-body text-brown-muted text-center text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-brown">{productToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)} 
                className="flex-1 btn-outline !border-brown/20 !text-brown hover:!bg-brown/5"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 btn-primary !bg-terracotta hover:!bg-rust"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
