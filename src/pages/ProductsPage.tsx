import React, { useState, useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import type { Product } from '@/types'
import { ShoppingBag, AlertCircle, RefreshCw, Package, CheckCircle2, Layers } from 'lucide-react'

export function ProductsPage() {
  const { products, categories, loading, error, refetch } = useProducts()
  const [searchQuery, setSearchQuery]         = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy]                   = useState('name-asc')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Hero Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            ACM Webmaster Recruitment Project
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            EPIC_VAULT Store
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Browse our full catalog of items. Inventory levels are tracked in real-time using Supabase PostgreSQL with atomic transaction checkouts.
          </p>
        </div>

        {/* Stats Summary Widget */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
          <div className="text-center px-3 border-r border-slate-200">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-xl">
              <Package className="w-4 h-4 text-blue-600" />
              {products.length}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Total</p>
          </div>

          <div className="text-center px-3 border-r border-slate-200">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {inStockCount}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">In Stock</p>
          </div>

          <div className="text-center px-3">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-xl">
              <Layers className="w-4 h-4 text-indigo-600" />
              {Math.max(0, categories.length - 1)}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Categories</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Component */}
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        totalResults={filteredProducts.length}
      />

      {/* Error View */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900">Database Connection Error</h3>
            <p className="text-xs text-slate-600 mt-1">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse shadow-xs">
              <div className="aspect-square bg-slate-100 rounded-lg"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="pt-2 flex justify-between items-center">
                <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                <div className="h-8 bg-slate-100 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">No Products Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No products match your active search term or category filter. Try clearing filters.
            </p>
          </div>
        </div>
      ) : (
        /* Product Cards Grid — Proportional 4-column layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* Product Quick View Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  )
}
