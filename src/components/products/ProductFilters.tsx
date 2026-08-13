import React from 'react'
import { Search, Filter, ArrowUpDown, X } from 'lucide-react'

interface ProductFiltersProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedCategory: string
  setSelectedCategory: (v: string) => void
  sortBy: string
  setSortBy: (v: string) => void
  categories: string[]
  totalResults: number
}

export function ProductFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  totalResults,
}: ProductFiltersProps) {
  const hasActiveFilters =
    searchQuery !== '' || selectedCategory !== 'All' || sortBy !== 'name-asc'

  const clearAll = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSortBy('name-asc')
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">

      {/* Row 1: Search + Dropdowns */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product by name or description..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-10 pr-9 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm">
          <Filter className="w-4 h-4 text-blue-600 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </label>

        {/* Sort Dropdown */}
        <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm">
          <ArrowUpDown className="w-4 h-4 text-blue-600 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-sm"
          >
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-desc">In Stock First</option>
          </select>
        </label>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Row 2: Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span>Showing <strong className="text-slate-800">{totalResults}</strong> products</span>
        {selectedCategory !== 'All' && (
          <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-md font-medium">
            Category: {selectedCategory}
          </span>
        )}
      </div>

    </div>
  )
}
