import React, { useState } from 'react'
import { ShoppingBag, Eye, AlertTriangle, CheckCircle, Flame, Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onSelectProduct: (p: Product) => void
}

// Fallback image if product image_url is broken or missing
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=75&fm=webp'

export function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [imageLoaded, setImageLoaded] = useState(false)
  const wishlisted = isWishlisted(product.id)

  const isOutOfStock = product.stock <= 0
  const isLowStock   = product.stock > 0 && product.stock <= 3

  return (
    <article className="card-base card-hover rounded-xl sm:rounded-2xl overflow-hidden flex flex-col group relative">

      {/* Image Area with Shimmer Skeleton Loader */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        {/* Shimmer skeleton before load */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-slate-300 border-t-slate-400 animate-spin" />
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
        <span className="chip chip-slate absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 text-[9px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 shadow-xs">
          {product.category}
        </span>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleWishlist(product)
          }}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
            wishlisted
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-rose-50 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Stock Badge */}
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5">
          {isOutOfStock ? (
            <span className="chip chip-red text-[9px] sm:text-xs px-1.5 py-0.5 shadow-xs">
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Sold Out</span>
              <span className="sm:hidden">Out</span>
            </span>
          ) : isLowStock ? (
            <span className="chip chip-amber text-[9px] sm:text-xs px-1.5 py-0.5 shadow-xs">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {product.stock} left
            </span>
          ) : (
            <span className="chip chip-green text-[9px] sm:text-xs px-1.5 py-0.5 shadow-xs">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">In Stock</span>
              <span className="sm:hidden">In Stock</span>
            </span>
          )}
        </div>

        {/* Hover Quick View Overlay */}
        <div className="hidden sm:flex absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
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
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 sm:line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'No description provided.'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="font-extrabold text-xs sm:text-base text-slate-900">
              ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isOutOfStock ? 'Sold' : 'Add'}</span>
          </button>
        </div>

      </div>

    </article>
  )
}
