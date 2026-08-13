import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Lock, CheckCircle, MapPin, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import type { Address, PlaceOrderResult } from '@/types'
import { AddressModal } from '@/components/profile/AddressModal'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [addresses, setAddresses]         = useState<Address[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string>('')
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [submitting, setSubmitting]       = useState(false)

  // Inline address fallback state if no saved address is chosen
  const [inlineAddress, setInlineAddress] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    if (!isOpen || !user) return
    ;(async () => {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      if (data && data.length > 0) {
        setAddresses(data as Address[])
        setSelectedAddrId(data[0].id)
      }
    })()
  }, [isOpen, user])

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

    // Determine final shipping address
    let shippingAddressObj: any = null
    const chosenSaved = addresses.find((a) => a.id === selectedAddrId)

    if (chosenSaved) {
      shippingAddressObj = chosenSaved
    } else if (
      inlineAddress.full_name.trim() &&
      inlineAddress.phone.trim() &&
      inlineAddress.street_address.trim() &&
      inlineAddress.city.trim() &&
      inlineAddress.pincode.trim()
    ) {
      shippingAddressObj = {
        full_name: inlineAddress.full_name.trim(),
        phone: inlineAddress.phone.trim(),
        street_address: inlineAddress.street_address.trim(),
        city: inlineAddress.city.trim(),
        state: inlineAddress.state.trim(),
        pincode: inlineAddress.pincode.trim(),
      }
    } else {
      showError('Please select or provide a valid shipping address.')
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
        p_user_id:          user.id,
        p_items:            preparedItems,
        p_total_amount:     Number(totalAmount.toFixed(2)),
        p_shipping_address: shippingAddressObj,
      })

      if (error) throw new Error(error.message)

      const result = data as PlaceOrderResult
      if (result?.success) {
        showSuccess('Order placed successfully! Check your order history for details.')
        clearCart()
        onClose()
        if (result.order_id) {
          navigate(`/orders/${result.order_id}`)
        } else {
          navigate('/profile')
        }
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

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors'

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(15,23,42,0.6)' }}
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Checkout & Order Review</h2>
                <p className="text-[11px] text-slate-500">Confirm delivery address and items</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-4">

            {/* Shipping Address Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Shipping Address
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Address
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedAddrId === addr.id
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_address_choice"
                        value={addr.id}
                        checked={selectedAddrId === addr.id}
                        onChange={() => setSelectedAddrId(addr.id)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{addr.full_name}</span>
                          <span className="text-slate-500">({addr.phone})</span>
                          {addr.is_default && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-700 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-slate-600 truncate mt-0.5">
                          {addr.street_address}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-700">Enter Shipping Address:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={inlineAddress.full_name}
                      onChange={(e) => setInlineAddress({ ...inlineAddress, full_name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      placeholder="Phone *"
                      value={inlineAddress.phone}
                      onChange={(e) => setInlineAddress({ ...inlineAddress, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address / House No. *"
                    value={inlineAddress.street_address}
                    onChange={(e) => setInlineAddress({ ...inlineAddress, street_address: e.target.value })}
                    className={inputClass}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      value={inlineAddress.city}
                      onChange={(e) => setInlineAddress({ ...inlineAddress, city: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={inlineAddress.state}
                      onChange={(e) => setInlineAddress({ ...inlineAddress, state: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={inlineAddress.pincode}
                      onChange={(e) => setInlineAddress({ ...inlineAddress, pincode: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Items ({items.length})
              </label>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <img
                      src={item.product.image_url || ''}
                      alt={item.product.name}
                      className="w-9 h-9 object-cover rounded bg-white shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 shrink-0">
                      {fmt(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-3.5 space-y-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{fmt(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">Total Payable</span>
                <span className="font-black text-blue-700 text-lg">{fmt(totalAmount)}</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Atomic PostgreSQL transaction via <code className="font-mono text-[10px]">place_order_atomic</code>.</span>
            </div>

          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              onClick={handlePlaceOrder}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Place Order
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSaved={(newAddr) => {
          setAddresses([newAddr, ...addresses])
          setSelectedAddrId(newAddr.id)
        }}
      />
    </>
  )
}
