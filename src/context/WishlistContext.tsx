import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Product } from '@/types'

interface WishlistContextType {
  wishlistIds: Set<string>
  wishlistProducts: Product[]
  loading: boolean
  toggleWishlist: (product: Product) => Promise<void>
  isWishlisted: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch wishlist from Supabase whenever user changes
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set())
      setWishlistProducts([])
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(*)')
        .eq('user_id', user.id)
      if (error) throw error

      const ids = new Set<string>()
      const products: Product[] = []
      for (const row of data ?? []) {
        ids.add(row.product_id)
        if (row.products) products.push(row.products as unknown as Product)
      }
      setWishlistIds(ids)
      setWishlistProducts(products)
    } catch (err) {
      console.error('Wishlist fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      showError('Please sign in to save items to your wishlist.')
      return
    }

    const alreadySaved = wishlistIds.has(product.id)

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev)
      if (alreadySaved) next.delete(product.id)
      else next.add(product.id)
      return next
    })
    setWishlistProducts(prev =>
      alreadySaved
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )

    try {
      if (alreadySaved) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
        if (error) throw error
        showSuccess(`"${product.name}" removed from wishlist.`)
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: product.id })
        if (error) throw error
        showSuccess(`"${product.name}" saved to wishlist! ❤️`)
      }
    } catch (err) {
      // Rollback optimistic update on error
      console.error('Wishlist toggle error:', err)
      showError('Something went wrong. Please try again.')
      fetchWishlist()
    }
  }

  const isWishlisted = (productId: string) => wishlistIds.has(productId)

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        loading,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlistIds.size,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
