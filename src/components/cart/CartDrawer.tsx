import React, { useState } from 'react'
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartItem } from './CartItem'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, cartCount, totalAmount, clearCart } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  if (!isOpen) return null

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Shopping Cart</h3>
            {cartCount > 0 && (
              <span className="badge badge-blue">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                title="Clear all"
                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-0.5">Browse products and add items here</p>
              </div>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.product.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Order Total</p>
                <p className="text-xl font-extrabold text-slate-900">{fmt(totalAmount)}</p>
              </div>
              <p className="text-xs text-slate-400">{cartCount} items</p>
            </div>

            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Stock verified at checkout via atomic database transaction
            </p>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false)
          onClose()
        }}
      />
    </>
  )
}
