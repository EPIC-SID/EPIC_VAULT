import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowLeft, Trash2, PackageSearch } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import type { Product } from '@/types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=75&fm=webp'

export function WishlistPage() {
  const { user } = useAuth()
  const { wishlistProducts, loading, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
    setAddedIds(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2000)
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
          <Heart className="w-10 h-10 text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Your Wishlist</h1>
          <p className="text-slate-500 mb-6">Sign in to save and view your favourite items.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <Heart className="w-6 h-6 text-rose-500" /> My Wishlist
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-72" />
          ))}
        </div>
      </div>
    )
  }

  // Empty wishlist
  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <PackageSearch className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Your wishlist is empty</h1>
          <p className="text-slate-500 mb-6">
            Tap the ❤️ on any product to save it here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Wishlist
          <span className="px-2.5 py-0.5 text-sm font-bold bg-rose-50 text-rose-600 rounded-full">
            {wishlistProducts.length}
          </span>
        </h1>
        <Link
          to="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {wishlistProducts.map(product => {
          const isOutOfStock = product.stock <= 0
          const added = addedIds.has(product.id)

          return (
            <article
              key={product.id}
              className="card-base overflow-hidden flex flex-col group relative"
            >
              {/* Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src={product.image_url || FALLBACK_IMAGE}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_IMAGE)
                      e.currentTarget.src = FALLBACK_IMAGE
                  }}
                />
                <span className="chip chip-slate absolute top-2.5 left-2.5 shadow-xs">
                  {product.category}
                </span>

                {/* Remove from wishlist */}
                <button
                  onClick={() => toggleWishlist(product)}
                  title="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                    <span className="font-extrabold text-base text-slate-900">
                      ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : added
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {isOutOfStock ? 'Sold Out' : added ? 'Added ✓' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
