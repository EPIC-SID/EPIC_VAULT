import React, { useState } from 'react'
import { ShoppingBag, Eye, AlertTriangle, CheckCircle, Flame } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onSelectProduct: (p: Product) => void
}

// Fallback image if product image_url is broken or missing
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=75&fm=webp'

export function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const { addToCart } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)

  const isOutOfStock = product.stock <= 0
  const isLowStock   = product.stock > 0 && product.stock <= 3

  return (
    <article className="card-base card-hover overflow-hidden flex flex-col group relative">

      {/* Image Area with Shimmer Skeleton Loader */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        {/* Shimmer skeleton before load */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-400 animate-spin" />
          </div>
        )}

        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            const target = e.currentTarget
            if (target.src !== FALLBACK_IMAGE) {
              target.src = FALLBACK_IMAGE
            }
            setImageLoaded(true)
          }}
        />

        {/* Category Tag */}
        <span className="chip chip-slate absolute top-2.5 left-2.5 shadow-xs">
          {product.category}
        </span>

        {/* Stock Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="chip chip-red shadow-xs">
              <AlertTriangle className="w-3 h-3" />
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="chip chip-amber shadow-xs">
              <Flame className="w-3 h-3" />
              {product.stock} left
            </span>
          ) : (
            <span className="chip chip-green shadow-xs">
              <CheckCircle className="w-3 h-3" />
              In Stock
            </span>
          )}
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectProduct(product)
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-slate-800 font-semibold text-xs shadow-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-sm text-slate-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'No description provided.'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="font-extrabold text-base text-slate-900">
              ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add'}
          </button>
        </div>

      </div>

    </article>
  )
}
