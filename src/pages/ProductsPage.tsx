import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import type { Product } from '@/types'
import { ShoppingBag, AlertCircle, RefreshCw, Package, CheckCircle2, Layers } from 'lucide-react'

export function ProductsPage() {
  const { products, categories, loading, error, refetch } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')

  const [searchQuery, setSearchQuery]           = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All')
  const [sortBy, setSortBy]                     = useState('name-asc')
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null)

  // Sync selected category when URL query parameter changes
  useEffect(() => {
    const catFromUrl = searchParams.get('category')
    if (catFromUrl) {
      setSelectedCategory(catFromUrl)
    } else {
      setSelectedCategory('All')
    }
  }, [searchParams])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Hero Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            ACM Webmaster Store Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            EPIC_VAULT Store
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Browse our full catalog of items. Inventory levels are tracked in real-time using Supabase PostgreSQL with atomic transaction checkouts.
          </p>
        </div>

        {/* Stats Summary Widget */}
        <div className="flex flex-row md:flex-col justify-around gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Products</p>
              <p className="text-base font-extrabold text-slate-900 leading-none">{products.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">In Stock</p>
              <p className="text-base font-extrabold text-slate-900 leading-none">{inStockCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Categories</p>
              <p className="text-base font-extrabold text-slate-900 leading-none">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Filters & Search */}
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        categories={categories}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalResults={filteredProducts.length}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading catalog from database...</p>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing <strong className="text-slate-900">{filteredProducts.length}</strong> products</span>
            {selectedCategory !== 'All' && (
              <span className="chip chip-blue">Category: {selectedCategory}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>
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
