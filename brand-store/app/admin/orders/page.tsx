'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageCircle, MoreHorizontal } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { useToast } from '@/context/ToastContext'
import { buildWhatsAppURL } from '@/lib/whatsapp'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered'

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
  status: OrderStatus
  total: number
  fulfillment: {
    type: 'delivery' | 'pickup'
    address?: string
    city?: string
    notes?: string
  }
  items: AdminOrderItem[]
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-mustard/15 text-mustard border border-mustard/20',
  confirmed: 'bg-mint/15 text-mint border border-mint/20',
  shipped: 'bg-forest/15 text-forest border border-forest/20',
  delivered: 'bg-brown/15 text-brown border border-brown/20',
}

const STATUS_DOT: Record<OrderStatus, string> = {
  pending: 'bg-mustard',
  confirmed: 'bg-mint',
  shipped: 'bg-forest',
  delivered: 'bg-brown',
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const fetchOrders = useCallback(async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      toast({ type: 'error', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const previousOrders = [...orders]
    setOrders((current) => current.map((order) => order._id === orderId ? { ...order, status } : order))
    setOpenMenu(null)

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast({ type: 'success', message: 'Status updated' })
    } catch (err) {
      setOrders(previousOrders)
      toast({ type: 'error', message: (err as Error).message })
    }
  }

  const counts = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    confirmed: orders.filter((order) => order.status === 'confirmed').length,
    shipped: orders.filter((order) => order.status === 'shipped').length,
  }), [orders])

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading italic text-4xl text-brown">Orders</h1>
        <p className="section-label text-brown-muted mt-1">Live order management</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          ['Total', counts.total, 'bg-brown'],
          ['Pending', counts.pending, STATUS_DOT.pending],
          ['Confirmed', counts.confirmed, STATUS_DOT.confirmed],
          ['Shipped', counts.shipped, STATUS_DOT.shipped],
        ].map(([label, value, dot]) => (
          <div key={label as string} className="bg-white rounded-full px-4 py-2 shadow-warm-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dot as string}`} />
            <span className="text-sm text-brown">{value as number} {label as string}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[20px] shadow-warm-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1.6fr_1fr_1fr_1fr_0.7fr] bg-cream-warm text-brown-muted section-label px-6 py-4">
          <div>Order ID</div>
          <div>Customer</div>
          <div>Total</div>
          <div>Status</div>
          <div>Date</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brown-muted">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-brown-muted">No orders found.</div>
        ) : (
          orders.map((order) => {
            const shortId = order._id.slice(-6).toUpperCase()
            const isExpanded = expandedRow === order._id
            const whatsappURL = buildWhatsAppURL({
              orderId: order._id,
              customerName: order.customerName,
              phone: order.phone,
              fulfillment: order.fulfillment,
              items: order.items,
              total: order.total,
            })

            return (
              <div key={order._id} className="border-t border-brown/10 first:border-t-0">
                <button
                  type="button"
                  onClick={() => setExpandedRow(isExpanded ? null : order._id)}
                  className="w-full grid grid-cols-1 md:grid-cols-[1fr_1.6fr_1fr_1fr_1fr_0.7fr] gap-3 md:gap-0 items-center px-6 py-4 text-left hover:bg-cream/50 transition-colors cursor-pointer"
                >
                  <div className="monospace text-brown-muted text-xs font-mono">#{shortId}</div>
                  <div className="font-medium text-brown">{order.customerName}</div>
                  <div className="font-heading italic text-lg text-terracotta">EGP {order.total.toLocaleString('en-EG')}</div>
                  <div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_BADGE[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-brown-muted text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === order._id ? null : order._id)}
                      className="p-2 rounded-full hover:bg-cream-warm text-brown-muted hover:text-brown transition-all duration-200"
                      aria-label="Order actions"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenu === order._id && (
                      <div className="absolute right-0 top-9 z-10 bg-white rounded-[12px] shadow-warm-lg border border-brown/5 w-44 py-2">
                        {[
                          ['Confirm', 'confirmed'],
                          ['Ship', 'shipped'],
                          ['Deliver', 'delivered'],
                        ].map(([label, status]) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateOrderStatus(order._id, status as OrderStatus)}
                            className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-cream transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                        <div className="border-t border-brown/10 my-1" />
                        {whatsappURL && (
                          <a href={whatsappURL} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-brown hover:bg-cream">
                            Open WhatsApp
                          </a>
                        )}
                        <button type="button" onClick={() => setExpandedRow(order._id)} className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-cream">
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-cream-warm border-t border-brown/10 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="section-label mb-3">Customer Details</p>
                        <p className="text-sm text-brown"><span className="font-medium">Email:</span> {order.email}</p>
                        <p className="text-sm text-brown mt-1"><span className="font-medium">Phone:</span> {order.phone}</p>
                        {order.fulfillment.type === 'delivery' ? (
                          <div className="mt-3 text-sm text-brown-muted">
                            <p>{order.fulfillment.address}</p>
                            <p>{order.fulfillment.city}</p>
                            {order.fulfillment.notes && <p className="mt-2">{order.fulfillment.notes}</p>}
                          </div>
                        ) : (
                          <p className="text-sm text-forest mt-3 font-medium">Store Pickup</p>
                        )}
                      </div>
                      <div>
                        <p className="section-label mb-3">Order Items</p>
                        <ul className="space-y-3">
                          {order.items.map((item, index) => (
                            <li key={`${item.name}-${index}`} className="flex justify-between gap-3 text-sm">
                              <div>
                                <p className="font-medium text-brown">{item.name}</p>
                                <p className="text-brown-muted text-xs">{item.size} · {item.color}</p>
                              </div>
                              <p className="text-terracotta whitespace-nowrap">
                                × {item.quantity} · EGP {(item.price * item.quantity).toLocaleString('en-EG')}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      {(['confirmed', 'shipped', 'delivered'] as const).map((status) => (
                        <button key={status} type="button" onClick={() => updateOrderStatus(order._id, status)} className="btn-ghost text-sm capitalize">
                          Mark {status}
                        </button>
                      ))}
                      {whatsappURL && (
                        <a href={whatsappURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-btn text-sm transition-all duration-200 hover:brightness-95">
                          <MessageCircle size={16} />
                          Message on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}
