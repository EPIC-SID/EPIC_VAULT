import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  Star,
  Tag,
  BarChart3,
  Loader2,
  ArrowUpRight,
  Trophy,
} from 'lucide-react'

interface AnalyticsData {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  topProducts: { name: string; image_url: string | null; orderCount: number; revenue: number }[]
  recentOrders: { id: string; total_amount: number; order_status: string; created_at: string }[]
  revenueByDay: { date: string; revenue: number }[]
  avgRating: number
  totalReviews: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// Mini bar chart (no external library needed)
function MiniBarChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" /> Revenue – Last 7 Days
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">₹ revenue per day</span>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d, i) => {
          const pct = (d.revenue / max) * 100
          const dateLabel = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all cursor-default min-h-[4px]"
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                ₹{d.revenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[9px] text-slate-400 font-medium truncate w-full text-center">{dateLabel}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fmt = (n: number) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        // Run all queries in parallel
        const [prodRes, usersRes, ordersRes, reviewsRes, couponsRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id, total_amount, order_status, created_at, products'),
          supabase.from('reviews').select('rating'),
          supabase.from('coupons').select('code, discount_percent, used_count, is_active'),
        ])

        const orders = (ordersRes.data ?? []) as any[]

        // Total revenue (excluding cancelled)
        const activeOrders = orders.filter((o) => o.order_status !== 'Cancelled')
        const totalRevenue = activeOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0)
        const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0

        // Top 5 products by order count
        const productMap: Record<string, { name: string; image_url: string | null; orderCount: number; revenue: number }> = {}
        for (const order of activeOrders) {
          const items: any[] = order.products ?? []
          for (const item of items) {
            const pid = item.product_id ?? item.name
            if (!productMap[pid]) {
              productMap[pid] = { name: item.name, image_url: item.image_url ?? null, orderCount: 0, revenue: 0 }
            }
            productMap[pid].orderCount += item.quantity ?? 1
            productMap[pid].revenue += Number(item.price) * (item.quantity ?? 1)
          }
        }
        const topProducts = Object.values(productMap)
          .sort((a, b) => b.orderCount - a.orderCount)
          .slice(0, 5)

        // Recent 5 orders
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((o: any) => ({ id: o.id, total_amount: o.total_amount, order_status: o.order_status, created_at: o.created_at }))

        // Revenue by day (last 7 days)
        const today = new Date()
        const revenueByDay: { date: string; revenue: number }[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          const dateStr = d.toISOString().slice(0, 10)
          const dayRevenue = activeOrders
            .filter((o: any) => o.created_at.slice(0, 10) === dateStr)
            .reduce((s: number, o: any) => s + Number(o.total_amount), 0)
          revenueByDay.push({ date: dateStr, revenue: dayRevenue })
        }

        // Reviews
        const reviews = reviewsRes.data ?? []
        const avgRating = reviews.length > 0
          ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
          : 0

        setData({
          totalProducts: prodRes.count ?? 0,
          totalUsers: usersRes.count ?? 0,
          totalOrders: orders.length,
          totalRevenue,
          avgOrderValue,
          topProducts,
          recentOrders,
          revenueByDay,
          avgRating,
          totalReviews: reviews.length,
        })
      } catch (err) {
        console.error('[AnalyticsDashboard]', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const statusColor: Record<string, string> = {
    Delivered: 'bg-emerald-100 text-emerald-700',
    Shipped: 'bg-blue-100 text-blue-700',
    'Out for Delivery': 'bg-violet-100 text-violet-700',
    Processing: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={String(data.totalProducts)}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={String(data.totalUsers)}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={String(data.totalOrders)}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={fmt(data.totalRevenue)}
          sub={`Avg: ${fmt(data.avgOrderValue)} / order`}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Secondary cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Star}
          label="Avg Product Rating"
          value={data.avgRating > 0 ? `${data.avgRating.toFixed(1)} ★` : '—'}
          sub={`from ${data.totalReviews} reviews`}
          color="bg-amber-50 text-amber-500"
        />
        <StatCard
          icon={Tag}
          label="Coupons Active"
          value="Available"
          sub="ACM10 · EPIC20 · PCCOE30 · STUDENT15"
          color="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Revenue Chart */}
      <MiniBarChart data={data.revenueByDay} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Most Popular Products
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No order data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-white' :
                    i === 1 ? 'bg-slate-300 text-slate-700' :
                    i === 2 ? 'bg-amber-700/40 text-amber-900' :
                    'bg-slate-100 text-slate-500'
                  }`}>{i + 1}</span>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.orderCount} unit{p.orderCount !== 1 ? 's' : ''} sold</p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 shrink-0">{fmt(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-blue-600" /> Recent Orders
          </h3>
          {data.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No orders yet.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 truncate font-mono">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${statusColor[o.order_status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {o.order_status}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{fmt(Number(o.total_amount))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
