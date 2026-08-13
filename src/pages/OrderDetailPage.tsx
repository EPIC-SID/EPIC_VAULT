import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Building,
  Phone,
  User,
} from 'lucide-react'

const STAGES: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'Processing',       label: 'Order Placed',       icon: <Clock className="w-4 h-4" /> },
  { status: 'Shipped',          label: 'Shipped',            icon: <Truck className="w-4 h-4" /> },
  { status: 'Out for Delivery', label: 'Out for Delivery',   icon: <PackageCheck className="w-4 h-4" /> },
  { status: 'Delivered',        label: 'Delivered',          icon: <CheckCircle2 className="w-4 h-4" /> },
]

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setOrder(data as Order)
      }
      setLoading(false)
    })()
  }, [id])

  const fmt = (n: number) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Fetching order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested order ID does not exist.'}</p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Order History
        </Link>
      </div>
    )
  }

  // Calculate timeline index
  const isCancelled = order.order_status === 'Cancelled'
  const isDelivered = order.order_status === 'Delivered'
  const currentStageIndex = isCancelled
    ? -1
    : STAGES.findIndex((s) => s.status === order.order_status)

  const addr = order.shipping_address

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order History
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Invoice
        </button>
      </div>

      {/* Order Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Order Receipt</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">#{order.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Order Details &amp; Live Tracking
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
            <p className="text-2xl font-black text-slate-900">{fmt(Number(order.total_amount))}</p>
          </div>
        </div>

        {/* Visual Progress Timeline Tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Delivery Progress</h3>
            {isDelivered && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Successfully Delivered
              </span>
            )}
          </div>

          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <XCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">Order Cancelled</span>
                <span className="text-red-600">This order has been cancelled and refunded.</span>
              </div>
            </div>
          ) : isDelivered ? (
            <div className="space-y-3">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-sm block text-emerald-950">Package Delivered Successfully!</span>
                  <span className="text-emerald-700">Your shipment has arrived at the destination. Thank you for choosing EPIC_VAULT!</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STAGES.map((stage, idx) => (
                  <div
                    key={stage.status}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-600 text-white">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-emerald-950">
                        {stage.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 pl-8 font-medium">
                      Completed
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex
                const isCurrent   = idx === currentStageIndex

                return (
                  <div
                    key={stage.status}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        {stage.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-8">
                      {isCompleted ? (isCurrent ? 'In progress' : 'Completed') : 'Pending'}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Address & Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Shipping Address Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 md:col-span-1 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Shipping Address</h3>
          </div>

          {addr ? (
            <div className="space-y-2.5 text-xs text-slate-600">
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {addr.full_name}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {addr.phone}
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="font-medium text-slate-800">{addr.street_address}</p>
                <p>{addr.city}, {addr.state}</p>
                <p className="font-mono text-slate-500">Pincode: {addr.pincode}</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No explicit shipping address recorded for this order.</div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified delivery details.</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Purchased Items</h3>
            <span className="text-xs text-slate-500 font-semibold">{order.products.length} items</span>
          </div>

          <div className="divide-y divide-slate-100">
            {Array.isArray(order.products) && order.products.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center gap-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {fmt(Number(item.price))} × {item.quantity}
                  </p>
                </div>

                <div className="text-right font-extrabold text-xs text-slate-900 shrink-0">
                  {fmt(Number(item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Taxes Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{fmt(Number(order.total_amount))}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Standard Shipping</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span className="font-extrabold text-slate-900">Total Charged</span>
              <span className="font-black text-blue-700 text-base">{fmt(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
