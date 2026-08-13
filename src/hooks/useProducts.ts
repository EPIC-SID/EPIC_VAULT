import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

const CACHE_KEY     = 'epic_vault_products_cache'
const CACHE_TTL_MS  = 5 * 60 * 1000   // 5 minutes freshness window
const MAX_RETRIES   = 3
const BASE_DELAY_MS = 1000             // 1s → 2s → 4s exponential backoff

interface CacheEntry {
  products: Product[]
  categories: string[]
  timestamp: number
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry
  } catch {
    return null
  }
}

function writeCache(products: Product[], categories: string[]) {
  try {
    const entry: CacheEntry = { products, categories, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Storage quota exceeded — fail silently
  }
}

function isCacheFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL_MS
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useProducts() {
  const [products,       setProducts]       = useState<Product[]>([])
  const [categories,     setCategories]     = useState<string[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [isStale,        setIsStale]        = useState(false)   // true → showing cached data while re-fetching
  const [lastUpdated,    setLastUpdated]    = useState<Date | null>(null)

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    setError(null)

    // --- 1. Serve from cache immediately (Stale-While-Revalidate) ---
    const cached = readCache()
    if (cached && !forceRefresh) {
      if (isCacheFresh(cached)) {
        // Cache is fresh — serve instantly, skip network
        setProducts(cached.products)
        setCategories(cached.categories)
        setLastUpdated(new Date(cached.timestamp))
        setLoading(false)
        setIsStale(false)
        return
      } else {
        // Cache is stale — show it immediately while we re-fetch in background
        setProducts(cached.products)
        setCategories(cached.categories)
        setLastUpdated(new Date(cached.timestamp))
        setLoading(false)      // don't block UI
        setIsStale(true)       // signal to UI that this is stale cached data
      }
    } else {
      setLoading(true)
    }

    // --- 2. Fetch from Supabase with Exponential Backoff Retry ---
    let attempt = 0
    while (attempt < MAX_RETRIES) {
      try {
        const { data, error: fetchErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchErr) throw fetchErr

        const fetchedProducts = (data ?? []) as Product[]
        const cats = Array.from(
          new Set(fetchedProducts.map((p) => p.category).filter(Boolean))
        )
        const allCategories = ['All', ...cats]

        setProducts(fetchedProducts)
        setCategories(allCategories)
        setIsStale(false)
        setLastUpdated(new Date())
        writeCache(fetchedProducts, allCategories)
        break   // success — exit retry loop

      } catch (err) {
        attempt++
        if (attempt >= MAX_RETRIES) {
          console.error('[useProducts] All retries exhausted:', err)
          // Only show error if we have no cached data to fall back on
          if (!cached) {
            setError(err instanceof Error ? err.message : 'Failed to load products from database.')
          }
        } else {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1)
          console.warn(`[useProducts] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`)
          await sleep(delay)
        }
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    categories,
    loading,
    error,
    isStale,
    lastUpdated,
    refetch: () => fetchProducts(true),
  }
}
