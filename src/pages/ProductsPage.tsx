import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import type { Product } from '@/types'
import { ShoppingBag, AlertCircle, RefreshCw, Package, CheckCircle2, Layers, ChevronDown, Clock, Wifi } from 'lucide-react'

// Skeleton Loader Card component for slow network connections
function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col space-y-3 p-3">
      <div className="aspect-4/3 w-full bg-slate-200 rounded-xl" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded w-16" />
        <div className="h-8 bg-slate-200 rounded-lg w-20" />
      </div>
    </div>
  )
}

export function ProductsPage() {
  const { products, categories, loading, error, isStale, lastUpdated, refetch } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')

  const [searchQuery, setSearchQuery]           = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All')
  const [sortBy, setSortBy]                     = useState('name-asc')
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null)
  
  // Progressive Chunking for Low Network Connectivity (Lazy Load 12 per batch)
  const [visibleCount, setVisibleCount]         = useState(12)

  // Sync selected category when URL query parameter changes
  useEffect(() => {
    const catFromUrl = searchParams.get('category')
    if (catFromUrl) {
      setSelectedCategory(catFromUrl)
    } else {
      setSelectedCategory('All')
    }
    setVisibleCount(12)
  }, [searchParams])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setVisibleCount(12)
    const newParams = new URLSearchParams(searchParams)
    if (cat === 'All') {
      newParams.delete('category')
    } else {
      newParams.set('category', cat)
    }
    setSearchParams(newParams)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSortBy('name-asc')
    setVisibleCount(12)
    setSearchParams({})
  }

  const inStockCount = useMemo(
    () => products.filter((p) => p.stock > 0).length,
    [products]
  )

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const catOk  = selectedCategory === 'All' || p.category === selectedCategory
        const q      = searchQuery.toLowerCase().trim()
        const nameOk = !q || p.name.toLowerCase().includes(q) ||
                       (p.description && p.description.toLowerCase().includes(q))
        return catOk && nameOk
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':   return a.name.localeCompare(b.name)
          case 'name-desc':  return b.name.localeCompare(a.name)
          case 'price-asc':  return Number(a.price) - Number(b.price)
          case 'price-desc': return Number(b.price) - Number(a.price)
          case 'stock-desc': return b.stock - a.stock
          default:           return 0
        }
      })
  }, [products, searchQuery, selectedCategory, sortBy])

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">

      {/* Hero Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] sm:text-xs font-semibold">
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ACM Webmaster Store Catalog
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            EPIC_VAULT Store
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Browse our catalog. Optimized with lazy image loading and progressive chunking for seamless low-network browsing.
          </p>
        </div>

        {/* Stats Summary Widget (Compact mobile row / desktop col) */}
        <div className="grid grid-cols-3 md:flex md:flex-col gap-2 sm:gap-4 p-2.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Total</p>
              <p className="text-xs sm:text-base font-extrabold text-slate-900 leading-none">{products.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">In Stock</p>
              <p className="text-xs sm:text-base font-extrabold text-slate-900 leading-none">{inStockCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Categories</p>
              <p className="text-xs sm:text-base font-extrabold text-slate-900 leading-none">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stale Cache Notice — shown when serving cached data while re-fetching */}
      {isStale && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Showing cached catalog from {lastUpdated ? lastUpdated.toLocaleTimeString() : 'earlier'}. Fetching updates…
            </span>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold text-[11px] sm:text-xs transition-colors whitespace-nowrap"
          >
            <Wifi className="w-3 h-3" />
            Refresh
          </button>
        </div>
      )}

      {/* Product Filters & Search */}
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={(q) => { setSearchQuery(q); setVisibleCount(12); }}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        categories={categories}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalResults={filteredProducts.length}
      />

      {/* Quick Category Chips Scrollbar for Mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mt-1 scrollbar-none">
        {['All', ...categories.filter(c => c !== 'All')].map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            >
              {cat === 'All' ? '✨ All' : cat}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Skeleton Grid for Low Network Connectivity */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">Failed to load catalog</h3>
          <p className="text-xs text-red-700">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No items matched your current filter criteria. Try adjusting your search keywords or category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing <strong className="text-slate-900">{visibleProducts.length}</strong> of <strong className="text-slate-900">{filteredProducts.length}</strong> products</span>
            {selectedCategory !== 'All' && (
              <span className="chip chip-blue text-[10px] sm:text-xs">Category: {selectedCategory}</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>

          {/* Progressive Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div className="text-center pt-2 sm:pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs inline-flex items-center justify-center gap-2 transition-all hover:border-blue-300 hover:text-blue-600"
              >
                <ChevronDown className="w-4 h-4" />
                Load More Products ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
