import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import type { PlaceOrderResult } from '@/types'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handlePlaceOrder = async () => {
    if (!user) {
      showError('Please sign in to place your order.')
      navigate('/login')
      onClose()
      return
    }
    if (items.length === 0) {
      showError('Your cart is empty!')
      return
    }

    try {
      setSubmitting(true)

      const preparedItems = items.map((item) => ({
        product_id: item.product.id,
        name:       item.product.name,
        price:      Number(item.product.price),
        quantity:   item.quantity,
        image_url:  item.product.image_url,
      }))

      const { data, error } = await supabase.rpc('place_order_atomic', {
        p_user_id:      user.id,
        p_items:        preparedItems,
        p_total_amount: Number(totalAmount.toFixed(2)),
      })

      if (error) throw new Error(error.message)

      const result = data as PlaceOrderResult
      if (result?.success) {
        showSuccess('Order placed successfully! Check your profile for details.')
        clearCart()
        onClose()
        navigate('/profile')
      } else {
        throw new Error('Order processing failed. Please try again.')
      }
    } catch (err) {
      console.error('[Checkout]', err)
      showError(err instanceof Error ? err.message : 'Checkout failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Order Summary</h2>
              <p className="text-[11px] text-slate-500">Review and confirm your purchase</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="px-5 py-3 space-y-2 max-h-48 overflow-y-auto border-b border-slate-100">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 py-1.5">
              <img
                src={item.product.image_url || ''}
                alt={item.product.name}
                className="w-8 h-8 object-cover rounded-md bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{item.product.name}</p>
                <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-xs font-bold text-slate-900 shrink-0">
                {fmt(Number(item.product.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 space-y-2 border-b border-slate-100 bg-slate-50">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal ({items.length} items)</span>
            <span className="font-medium text-slate-700">{fmt(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Delivery</span>
            <span className="text-emerald-600 font-semibold">FREE</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
            <span className="font-bold text-slate-900">Total Payable</span>
            <span className="font-extrabold text-blue-700 text-lg">{fmt(totalAmount)}</span>
          </div>
        </div>

        {/* Security note */}
        <div className="mx-5 my-3 flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Protected by <code className="font-mono text-[10px]">place_order_atomic</code> PostgreSQL function with row-level locking.</span>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            onClick={handlePlaceOrder}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Confirm Order
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
