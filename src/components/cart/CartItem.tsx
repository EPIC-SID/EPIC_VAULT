import React from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types'
import { useCart } from '@/context/CartContext'

interface CartItemProps {
  item: CartItemType
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()
  const { product, quantity } = item

  const isMaxStock = quantity >= product.stock
  const lineTotal  = Number(product.price) * quantity

  return (
    <div className="flex gap-3 bg-white border border-slate-200 rounded-xl p-3 items-start">

      {/* Image */}
      <img
        src={product.image_url || FALLBACK_IMAGE}
        alt={product.name}
        className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0"
        onError={(e) => {
          const target = e.currentTarget
          if (target.src !== FALLBACK_IMAGE) {
            target.src = FALLBACK_IMAGE
          }
        }}
      />

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug flex-1">
            {product.name}
          </h4>
          <button
            onClick={() => removeFromCart(product.id)}
            className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            aria-label="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Qty controls */}
          <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 overflow-hidden text-xs">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold"
            >
              −
            </button>
            <span className="px-2 py-1 font-bold text-slate-800 min-w-[1.75rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={isMaxStock}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Line Total */}
          <span className="text-sm font-extrabold text-slate-900">
            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {isMaxStock && (
          <p className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" /> Max stock reached
          </p>
        )}
      </div>
    </div>
  )
}
