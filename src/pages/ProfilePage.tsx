import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import type { Order, Address } from '@/types'
import { AddressModal } from '@/components/profile/AddressModal'
import {
  Mail,
  Calendar,
  ShoppingBag,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react'

function StatusBadge({ status }: { status: Order['order_status'] }) {
  const map: Record<Order['order_status'], { icon: React.ReactNode; cls: string }> = {
    Processing:         { icon: <Clock className="w-3 h-3" />,        cls: 'chip-amber' },
    Shipped:            { icon: <Truck className="w-3 h-3" />,        cls: 'chip-blue'  },
    'Out for Delivery': { icon: <PackageCheck className="w-3 h-3 text-purple-600" />, cls: 'chip-blue' },
    Delivered:          { icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />, cls: 'chip-green' },
    Cancelled:          { icon: <XCircle className="w-3 h-3" />,       cls: 'chip-red'   },
  }
  const { icon, cls } = map[status] ?? { icon: null, cls: 'chip-slate' }
  return <span className={`chip ${cls}`}>{icon}{status}</span>
}

export function ProfilePage() {
  const { user, profile } = useAuth()
  const { showSuccess, showError } = useToast()

  const [orders, setOrders]       = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading]     = useState(true)
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false)

  const fetchUserData = async () => {
    if (!user) return
    setLoading(true)

    // Fetch Orders
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (orderData) setOrders(orderData as Order[])

    // Fetch Addresses
    const { data: addrData } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
    if (addrData) setAddresses(addrData as Address[])

    setLoading(false)
  }

  useEffect(() => {
    fetchUserData()
  }, [user])

  const handleDeleteAddress = async (addrId: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', addrId)
      if (error) throw error
      showSuccess('Address deleted.')
      setAddresses(addresses.filter((a) => a.id !== addrId))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete address.')
    }
  }

  const initials = (profile?.name ?? user?.email ?? 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const fmt = (n: number) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.name ?? 'Account'}</h1>
                <span className={`chip ${profile?.role === 'admin' ? 'chip-amber' : 'chip-blue'}`}>
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

        {/* Saved Addresses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Saved Shipping Addresses</h2>
            </div>
            <button
              onClick={() => setIsAddrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No Shipping Addresses Saved</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Save an address now for faster checkout on your next purchase!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{addr.full_name}</h4>
                      <p className="text-[11px] text-slate-500">{addr.phone}</p>
                    </div>
                    {addr.is_default && (
                      <span className="chip chip-blue text-[9px]">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                    {addr.street_address}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 pt-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Address
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orders Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Order History</h2>
            </div>
            <span className="chip chip-slate">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-500">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 max-w-sm mx-auto shadow-xs">
              <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-900">No Orders Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Browse the catalog and place your first order!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          #{order.id.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="font-extrabold text-lg text-slate-900">
                          {fmt(Number(order.total_amount))}
                        </p>
                      </div>
                      <StatusBadge status={order.order_status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {Array.isArray(order.products) && order.products.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg bg-white shrink-0 border border-slate-200" />
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

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Full Order Receipt &amp; Live Tracking ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      <AddressModal
        isOpen={isAddrModalOpen}
        onClose={() => setIsAddrModalOpen(false)}
        onAddressSaved={(newAddr) => {
          setAddresses([newAddr, ...addresses])
        }}
      />
    </div>
  )
}
