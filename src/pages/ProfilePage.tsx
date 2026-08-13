import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { User, Mail, Calendar, ShoppingBag, PackageCheck, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react'

function StatusBadge({ status }: { status: Order['order_status'] }) {
  const map: Record<Order['order_status'], { icon: React.ReactNode; cls: string }> = {
    Processing: { icon: <Clock className="w-3 h-3" />,       cls: 'badge-amber' },
    Shipped:    { icon: <Truck className="w-3 h-3" />,        cls: 'badge-blue'  },
    Delivered:  { icon: <CheckCircle2 className="w-3 h-3" />, cls: 'badge-green' },
    Cancelled:  { icon: <XCircle className="w-3 h-3" />,      cls: 'badge-red'   },
  }
  const { icon, cls } = map[status] ?? { icon: null, cls: 'badge-gray' }
  return <span className={`badge ${cls}`}>{icon}{status}</span>
}

export function ProfilePage() {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setOrders((data ?? []) as Order[])
      setLoading(false)
    })()
  }, [user])

  const initials = (profile?.name ?? user?.email ?? 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 })

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.name ?? 'Account'}</h1>
                <span className={`badge ${profile?.role === 'admin' ? 'badge-amber' : 'badge-blue'}`}>
                  {profile?.role ?? 'customer'}
                </span>
              </div>
              <div className="flex flex-wrap gap-5 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Order History</h2>
            </div>
            <span className="badge badge-gray">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 max-w-sm mx-auto">
              <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-900">No Orders Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Browse the catalog and place your first order!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
                      <p className="text-xs font-mono text-slate-700">{order.id}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="font-extrabold text-lg text-slate-900">
                          {fmt(Number(order.total_amount))}
                        </p>
                      </div>
                      <StatusBadge status={order.order_status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Array.isArray(order.products) && order.products.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name}
                            className="w-10 h-10 object-cover rounded bg-white shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.quantity} × {fmt(Number(item.price))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
