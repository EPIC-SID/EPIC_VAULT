import React, { useState, useEffect } from 'react'
import { X, ShoppingBag, CheckCircle, AlertTriangle, Flame, Shield, Truck } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart, items } = useCart()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => { setQuantity(1) }, [product])

  if (!product) return null

  const inCart         = items.find((i) => i.product.id === product.id)
  const qtyInCart      = inCart?.quantity ?? 0
  const remainingStock = Math.max(0, product.stock - qtyInCart)
  const isOutOfStock   = product.stock <= 0
  const isMaxInCart    = remainingStock <= 0
  const isLowStock     = !isOutOfStock && remainingStock <= 3

  const handleAdd = () => {
    if (addToCart(product, quantity)) onClose()
  }

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 min-h-0">

          {/* Image */}
          <div className="relative bg-slate-100" style={{ minHeight: '260px' }}>
            <img
              src={product.image_url || FALLBACK_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => {
                const target = e.currentTarget
                if (target.src !== FALLBACK_IMAGE) {
                  target.src = FALLBACK_IMAGE
                }
              }}
            />
            <span className="chip chip-slate absolute top-3 left-3 shadow-xs">
              {product.category}
            </span>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col gap-4">

            {/* Availability */}
            <div>
              {isOutOfStock ? (
                <span className="chip chip-red">
                  <AlertTriangle className="w-3 h-3" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="chip chip-amber">
                  <Flame className="w-3 h-3" /> Only {remainingStock} left!
                </span>
              ) : (
                <span className="chip chip-green">
                  <CheckCircle className="w-3 h-3" /> In Stock — {product.stock} units
                </span>
              )}
            </div>

            {/* Name & Price */}
            <div>
              <h2 className="font-bold text-xl text-slate-900 leading-snug">{product.name}</h2>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">{fmt(Number(product.price))}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed border-y border-slate-100 py-3">
              {product.description || 'No detailed description available for this product.'}
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Verified Authentic Product
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Fast Delivery Across India
              </div>
            </div>

            {/* Quantity + CTA */}
            <div className="mt-auto space-y-3 pt-2 border-t border-slate-100">

              {!isOutOfStock && !isMaxInCart && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden text-sm">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-bold text-slate-900 min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                      disabled={quantity >= remainingStock}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {qtyInCart > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-md font-medium">
                  {qtyInCart} already in your cart.
                </p>
              )}

              <button
                disabled={isOutOfStock || isMaxInCart}
                onClick={handleAdd}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                  isOutOfStock || isMaxInCart
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock
                  ? 'Sold Out'
                  : isMaxInCart
                  ? 'Max Limit in Cart'
                  : `Add ${quantity} to Cart — ${fmt(Number(product.price) * quantity)}`}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
