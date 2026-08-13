import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, Order, OrderStatus } from '@/types'
import { useToast } from '@/context/ToastContext'
import { 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Package, 
  ShoppingBag, 
  RefreshCw 
} from 'lucide-react'

export function AdminPage() {
  const { showSuccess, showError } = useToast()

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [stock, setStock] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Products
      const prodRes = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (prodRes.error) {
        console.error('[AdminPage] Products fetch error:', prodRes.error)
        showError(`Products fetch error: ${prodRes.error.message}`)
      } else {
        setProducts((prodRes.data || []) as Product[])
      }

      // Fetch Orders
      const orderRes = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (orderRes.error) {
        console.error('[AdminPage] Orders fetch error:', orderRes.error)
        // If RLS blocked order fetch because user role in PostgreSQL is still 'customer'
        showError(`Orders RLS notice: ${orderRes.error.message}. Please verify user role is 'admin' in Supabase profiles table.`)
      } else {
        setOrders((orderRes.data || []) as Order[])
      }
    } catch (err) {
      console.error('[AdminPage] Unexpected error:', err)
      showError(err instanceof Error ? err.message : 'Unexpected error loading admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreateModal = () => {
    setEditingProduct(null)
    setName('')
    setCategory('Electronics')
    setPrice('')
    setDescription('')
    setImageUrl('')
    setStock('10')
    setShowProductModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setCategory(product.category)
    setPrice(String(product.price))
    setDescription(product.description || '')
    setImageUrl(product.image_url || '')
    setStock(String(product.stock))
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !category.trim() || !price || !stock) {
      showError('Please fill in all required fields.')
      return
    }

    const priceNum = parseFloat(price)
    const stockNum = parseInt(stock, 10)

    if (isNaN(priceNum) || priceNum < 0) {
      showError('Price must be a valid positive number.')
      return
    }

    if (isNaN(stockNum) || stockNum < 0) {
      showError('Stock must be a valid non-negative integer.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        name: name.trim(),
        category: category.trim(),
        price: priceNum,
        description: description.trim() || null,
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        stock: stockNum
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)

        if (error) throw error
        showSuccess(`Product "${name}" updated successfully!`)
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload])

        if (error) throw error
        showSuccess(`Product "${name}" created successfully!`)
      }

      setShowProductModal(false)
      fetchData()
    } catch (err) {
      console.error('[AdminPage] Save error:', err)
      showError(err instanceof Error ? err.message : 'Failed to save product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error
      showSuccess(`Deleted "${product.name}".`)
      fetchData()
    } catch (err) {
      console.error('[AdminPage] Delete error:', err)
      showError(err instanceof Error ? err.message : 'Failed to delete product.')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      showSuccess(`Order status updated to ${newStatus}.`)
      fetchData()
    } catch (err) {
      console.error('[AdminPage] Order update error:', err)
      showError(err instanceof Error ? err.message : 'Failed to update order status.')
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Manage products, stock levels, and user orders</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'products'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading admin data...
          </div>
        ) : activeTab === 'products' ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2.5">
                        <img
                          src={prod.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'}
                          alt={prod.name}
                          className="w-9 h-9 object-cover rounded bg-slate-100 shrink-0"
                          onError={(e) => {
                            const t = e.currentTarget
                            if (!t.src.includes('unsplash')) {
                              t.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'
                            }
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{prod.description}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 text-sm">
                        {fmt(Number(prod.price))}
                      </td>
                      <td className="p-3">
                        {prod.stock === 0 ? (
                          <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px]">Out of Stock</span>
                        ) : prod.stock <= 3 ? (
                          <span className="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">{prod.stock} (Low)</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">{prod.stock}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-blue-700"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                No customer orders found in system.
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">Order ID: {ord.id}</span>
                      <p className="text-xs text-slate-700">User ID: {ord.user_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">
                        {fmt(Number(ord.total_amount))}
                      </span>
                      
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-2 py-1 focus:outline-none"
                      >
                        <option value="Processing">Status: Processing</option>
                        <option value="Shipped">Status: Shipped</option>
                        <option value="Delivered">Status: Delivered</option>
                        <option value="Cancelled">Status: Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(ord.products) &&
                      ord.products.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700">
                          {item.name} × {item.quantity} ({fmt(Number(item.price))})
                        </span>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Form Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4 border border-slate-200 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-base text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Stock *</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
