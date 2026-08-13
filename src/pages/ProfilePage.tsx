import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import type { Order, Address } from '@/types'
import { AddressModal } from '@/components/profile/AddressModal'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
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
  Edit,
  Phone,
  Sparkles,
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
  const [isAddrModalOpen, setIsAddrModalOpen]       = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen]   = useState(false)

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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-xs">
                  {initials}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold text-slate-900">{profile?.name ?? 'Account'}</h1>
                  <span className={`chip ${profile?.role === 'admin' ? 'chip-amber' : 'chip-blue'}`}>
                    {profile?.role ?? 'customer'}
                  </span>
                </div>

                {profile?.bio && (
                  <p className="text-xs text-slate-600 font-medium">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user?.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      +91 {profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Action Button */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs border border-slate-200 hover:border-blue-300 transition-all shadow-xs shrink-0"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white border rounded-xl p-4 space-y-2 relative transition-all ${
                    addr.is_default ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{addr.full_name}</span>
                      <p className="text-[11px] text-slate-500">{addr.phone}</p>
                    </div>
                    {addr.is_default && (
                      <span className="chip chip-blue text-[10px]">Default</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {addr.street_address}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order History Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">My Orders & Purchases</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No orders placed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't placed any orders yet. Browse our catalog and start shopping!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const totalItems = order.products.reduce((acc, p) => acc + (p.quantity || 1), 0)
                const firstImg   = order.products[0]?.image_url

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <StatusBadge status={order.order_status} />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                        <span className="text-base font-extrabold text-slate-900">{fmt(order.total_amount)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt="Order Preview"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {order.products.map((p) => p.name).join(', ')}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 hover:border-blue-200 transition-colors"
                      >
                        View Order Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>

      {/* Modals */}
      <AddressModal
        isOpen={isAddrModalOpen}
        onClose={() => setIsAddrModalOpen(false)}
        onAddressSaved={(newAddr) => setAddresses([newAddr, ...addresses])}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  )
}
