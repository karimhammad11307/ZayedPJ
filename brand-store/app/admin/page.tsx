import Link from 'next/link'
import { ShoppingBag, Clock, TrendingUp, Package } from 'lucide-react'

import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Dashboard | ZAYED',
}

const STATUS_BADGE = {
  pending:   'bg-mustard text-brown',
  confirmed: 'bg-mint text-white',
  shipped:   'bg-terracotta text-white',
  delivered: 'bg-forest text-cream',
} as const

type OrderStatus = keyof typeof STATUS_BADGE

export default async function AdminDashboardPage() {
  await connectDB()

  // ── Fetch Stats ───────────────────────────────────────────────
  const [totalOrders, pendingOrders, activeProducts, allOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Product.countDocuments({ isActive: true }),
    Order.find().lean(),
  ])

  // Calculate Confirmed Revenue
  const validStatuses = ['confirmed', 'shipped', 'delivered']
  const confirmedRevenue = allOrders
    .filter((o) => validStatuses.includes(o.status ?? ''))
    .reduce((sum, o) => sum + (o.total || 0), 0)

  // Recent 10 Orders
  const recentOrders = allOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const today = new Date().toLocaleDateString('en-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="font-heading italic text-4xl text-brown">Dashboard</h1>
        <p className="text-brown-muted text-sm mt-1">{today}</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Card 1: Total Orders */}
        <div className="bg-white rounded-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <p className="label-caps text-brown-muted">Total Orders</p>
            <ShoppingBag className="text-mint w-8 h-8 opacity-80" strokeWidth={1.5} />
          </div>
          <p className="font-heading italic text-4xl text-brown">{totalOrders}</p>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="bg-white rounded-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <p className="label-caps text-brown-muted">Awaiting Confirmation</p>
            <Clock className="text-terracotta w-8 h-8 opacity-80" strokeWidth={1.5} />
          </div>
          <p className={`font-heading italic text-4xl ${pendingOrders > 0 ? 'text-terracotta' : 'text-brown'}`}>
            {pendingOrders}
          </p>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white rounded-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <p className="label-caps text-brown-muted">Confirmed Revenue</p>
            <TrendingUp className="text-mint w-8 h-8 opacity-80" strokeWidth={1.5} />
          </div>
          <p className="font-heading italic text-4xl text-mint">
            EGP {confirmedRevenue.toLocaleString('en-EG')}
          </p>
        </div>

        {/* Card 4: Active Products */}
        <div className="bg-white rounded-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <p className="label-caps text-brown-muted">Products Live</p>
            <Package className="text-mint w-8 h-8 opacity-80" strokeWidth={1.5} />
          </div>
          <p className="font-heading italic text-4xl text-brown">{activeProducts}</p>
        </div>

      </div>

      {/* ── Recent Orders Table ── */}
      <div className="bg-white rounded-card shadow-sm p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6 min-w-[600px]">
          <h2 className="font-heading italic text-2xl text-brown">Recent Orders</h2>
          <Link href="/admin/orders" className="text-mint text-sm hover:underline underline-offset-2">
            View All Orders
          </Link>
        </div>

        <div className="min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brown/10">
                <th className="label-caps text-brown-muted py-3 px-2 font-normal">Order ID</th>
                <th className="label-caps text-brown-muted py-3 px-2 font-normal">Customer</th>
                <th className="label-caps text-brown-muted py-3 px-2 font-normal">Items</th>
                <th className="label-caps text-brown-muted py-3 px-2 font-normal">Total</th>
                <th className="label-caps text-brown-muted py-3 px-2 font-normal">Status</th>
                <th className="label-caps text-brown-muted py-3 px-2 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brown-muted text-sm font-body">
                    No orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const statusKey = (order.status as OrderStatus) || 'pending'
                  const badgeClass = STATUS_BADGE[statusKey] || STATUS_BADGE.pending

                  return (
                    <tr key={String(order._id)} className="border-b border-brown/10 last:border-0 hover:bg-cream-light/50 transition-colors">
                      <td className="py-4 px-2 text-brown-muted text-xs font-mono">
                        #{String(order._id).slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-2 font-body font-medium text-brown text-sm">
                        {order.customerName}
                      </td>
                      <td className="py-4 px-2 text-brown-muted text-sm">
                        {order.items?.length || 0} items
                      </td>
                      <td className="py-4 px-2 font-body font-medium text-brown text-sm">
                        EGP {order.total?.toLocaleString('en-EG')}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-body capitalize ${badgeClass}`}>
                          {statusKey}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-brown-muted text-xs font-body">
                        {new Date(order.createdAt).toLocaleDateString('en-EG', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
