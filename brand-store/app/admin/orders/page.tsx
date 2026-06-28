'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MessageCircle, Trash2, AlertTriangle, X } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { buildWhatsAppURL } from '@/lib/whatsapp'

const STATUSES = ['All', 'pending', 'confirmed', 'shipped', 'delivered'] as const
type TabStatus = typeof STATUSES[number]

const STATUS_BADGE = {
  pending:   'bg-mustard text-brown',
  confirmed: 'bg-mint text-white',
  shipped:   'bg-terracotta text-white',
  delivered: 'bg-forest text-cream',
} as const
interface AdminOrderItem {
  name: string
  size: string
  color: string
  quantity: number
  price: number
}

interface AdminOrder {
  _id: string
  customerName: string
  email: string
  phone: string
  createdAt: string
  status: string
  total: number
  fulfillment: {
    type: 'delivery' | 'pickup'
    address?: string
    city?: string
    notes?: string
  }
  items: AdminOrderItem[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabStatus>('All')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      setErrorMsg((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    // Optimistic UI update
    const previousOrders = [...orders]
    setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
    } catch {
      // Revert on failure
      setOrders(previousOrders)
      alert('Failed to update status')
    }
  }

  async function confirmDeleteOrder() {
    if (!orderToDelete) return
    const orderId = orderToDelete
    setOrderToDelete(null)

    const previousOrders = [...orders]
    setOrders(orders.filter(o => o._id !== orderId))
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
    } catch {
      setOrders(previousOrders)
      alert('Failed to delete order')
    }
  }

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeTab)

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading italic text-4xl text-brown">Orders</h1>
          <p className="label-caps text-brown-muted mt-1">{orders.length} total</p>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((status) => {
          const isActive = activeTab === status
          let activeClass = 'bg-brown text-white'
          if (isActive) {
            if (status === 'All')       activeClass = 'bg-forest text-cream'
            if (status === 'pending')   activeClass = 'bg-mustard text-brown'
            if (status === 'confirmed') activeClass = 'bg-mint text-white'
            if (status === 'shipped')   activeClass = 'bg-terracotta text-white'
            if (status === 'delivered') activeClass = 'bg-forest-dark text-cream'
          }

          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`
                px-4 py-2 rounded-full font-body text-sm transition-all duration-200 capitalize
                ${isActive ? activeClass : 'bg-white text-brown hover:bg-cream border border-brown/10'}
              `}
            >
              {status}
            </button>
          )
        })}
      </div>

      {errorMsg && (
        <div className="bg-terracotta/10 text-terracotta p-4 rounded-card mb-6 text-sm font-body">
          {errorMsg}
        </div>
      )}

      {/* ── Orders Table ── */}
      <div className="bg-white rounded-card shadow-sm overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-cream-light px-6 py-3 border-b border-brown/10">
          <div className="label-caps text-brown-muted">Order #</div>
          <div className="label-caps text-brown-muted">Customer</div>
          <div className="label-caps text-brown-muted">Phone</div>
          <div className="label-caps text-brown-muted">Items</div>
          <div className="label-caps text-brown-muted">Total</div>
          <div className="label-caps text-brown-muted">Status</div>
          <div className="label-caps text-brown-muted">Date</div>
          <div className="label-caps text-brown-muted text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brown-muted font-body">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-brown-muted font-body">No orders found.</div>
        ) : (
          <div className="flex flex-col">
            {filteredOrders.map((order) => {
              const isExpanded = expandedRow === order._id
              const statusKey = (order.status as keyof typeof STATUS_BADGE) || 'pending'
              const badgeClass = STATUS_BADGE[statusKey] || STATUS_BADGE.pending
              const shortId = String(order._id).slice(-6).toUpperCase()

              return (
                <div key={order._id} className="border-b border-brown/10 last:border-0 hover:bg-cream-light/30 transition-colors">
                  {/* Row */}
                  <div 
                    className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 cursor-pointer"
                    onClick={() => setExpandedRow(isExpanded ? null : order._id)}
                  >
                    <div className="text-brown-muted text-xs font-mono">#{shortId}</div>
                    <div className="font-body font-medium text-brown">{order.customerName}</div>
                    <div className="text-brown-muted text-sm">{order.phone}</div>
                    <div className="text-brown-muted text-sm">{order.items?.length || 0} items</div>
                    <div className="font-heading italic text-lg text-terracotta">EGP {order.total?.toLocaleString('en-EG')}</div>
                    
                    <div>
                      <span className={`rounded-full px-3 py-1 text-xs font-body capitalize ${badgeClass}`}>
                        {statusKey}
                      </span>
                    </div>
                    
                    <div className="text-brown-muted text-xs font-body">
                      {new Date(order.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={statusKey}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`text-xs font-body px-2 py-1.5 rounded-btn border border-transparent outline-none focus:ring-1 cursor-pointer transition-colors ${badgeClass}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>

                      <button 
                        onClick={() => setOrderToDelete(order._id)}
                        className="p-1 text-terracotta/70 hover:text-terracotta transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <button className="p-1 text-brown-muted hover:text-brown ml-1">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-cream-light/50 px-6 py-6 border-t border-brown/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="label-caps text-brown-muted mb-3">Customer Details</p>
                        <p className="font-body text-sm text-brown mb-1"><span className="font-medium">Email:</span> {order.email}</p>
                        {order.fulfillment?.type === 'delivery' ? (
                          <>
                            <p className="font-body text-sm text-brown mb-1"><span className="font-medium">Address:</span> {order.fulfillment.address}</p>
                            <p className="font-body text-sm text-brown mb-1"><span className="font-medium">City:</span> {order.fulfillment.city}</p>
                            {order.fulfillment.notes && (
                              <p className="font-body text-sm text-brown mt-2 p-2 bg-white rounded border border-brown/10">
                                <span className="font-medium block text-xs mb-1">Notes:</span> 
                                {order.fulfillment.notes}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="font-body text-sm text-mint font-medium">Store Pickup</p>
                        )}
                        
                        <a 
                          href={buildWhatsAppURL({
                            orderId: String(order._id),
                            customerName: order.customerName,
                            phone: order.phone,
                            fulfillment: order.fulfillment,
                            items: order.items,
                            total: order.total
                          }) ?? `https://wa.me/${order.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-mint hover:underline"
                        >
                          <MessageCircle size={16} /> Open WhatsApp
                        </a>
                      </div>
                      
                      <div>
                        <p className="label-caps text-brown-muted mb-3">Order Items</p>
                        <ul className="space-y-3">
                          {order.items.map((item: AdminOrderItem, i: number) => (
                            <li key={i} className="flex justify-between items-start text-sm font-body">
                              <div>
                                <p className="font-medium text-brown">{item.name}</p>
                                <p className="text-brown-muted text-xs">{item.size} · {item.color}</p>
                              </div>
                              <p className="text-brown-muted whitespace-nowrap">
                                × {item.quantity} · EGP {item.price * item.quantity}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/40 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-lg max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-terracotta">
                <AlertTriangle size={24} />
                <h3 className="font-heading italic text-xl">Delete Order</h3>
              </div>
              <button onClick={() => setOrderToDelete(null)} className="text-brown-muted hover:text-brown">
                <X size={20} />
              </button>
            </div>
            
            <p className="font-body text-sm text-brown mb-6">
              Are you sure you want to delete this order? This action cannot be undone and the data will be permanently lost.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-sm font-body text-brown hover:bg-cream-light rounded-btn transition-colors border border-brown/10"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteOrder}
                className="px-4 py-2 text-sm font-body text-white bg-terracotta hover:bg-terracotta/90 rounded-btn transition-colors"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
