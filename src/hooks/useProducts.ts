import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) {
        throw fetchErr
      }

      const fetchedProducts = (data ?? []) as Product[]
      setProducts(fetchedProducts)

      // Extract unique categories for filter dropdown
      const cats = Array.from(
        new Set(fetchedProducts.map((p) => p.category).filter(Boolean))
      )
      setCategories(['All', ...cats])
    } catch (err) {
      console.error('[useProducts] Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products from database.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    categories,
    loading,
    error,
    refetch: fetchProducts
  }
}
