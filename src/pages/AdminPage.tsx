import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, Order, OrderStatus, Profile } from '@/types'
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
  RefreshCw,
  Users,
  Wand2,
  UserCheck,
  Mail,
  ShieldAlert,
  BarChart3,
} from 'lucide-react'
import { validateEmail, formatUserFriendlyError } from '@/lib/validation'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export function AdminPage() {
  const { showSuccess, showError } = useToast()

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'analytics'>('products')
  const [products, setProducts]   = useState<Product[]>([])
  const [orders, setOrders]       = useState<Order[]>([])
  const [profiles, setProfiles]   = useState<Profile[]>([])
  const [loading, setLoading]     = useState(true)

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct]     = useState<Product | null>(null)
  
  const [name, setName]               = useState('')
  const [category, setCategory]       = useState('')
  const [price, setPrice]             = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl]       = useState('')
  const [stock, setStock]             = useState('')

  // Invite Admin Modal State
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail]         = useState('')
  const [inviteName, setInviteName]           = useState('')
  const [submitting, setSubmitting]           = useState(false)

  const fmt = (n: number) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Products
      const prodRes = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!prodRes.error) setProducts((prodRes.data || []) as Product[])

      // Fetch Orders
      const orderRes = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!orderRes.error) setOrders((orderRes.data || []) as Order[])

      // Fetch User Profiles
      const profileRes = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!profileRes.error) setProfiles((profileRes.data || []) as Profile[])

    } catch (err) {
      console.error('[AdminPage] Unexpected error:', err)
      showError(formatUserFriendlyError(err))
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
      showError(formatUserFriendlyError(err))
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
      const targetOrder = orders.find((o) => o.id === orderId)

      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      showSuccess(`Order status updated to ${newStatus}.`)

      // Trigger Brevo Order Status Email
      if (targetOrder?.user_id) {
        supabase
          .from('profiles')
          .select('email')
          .eq('id', targetOrder.user_id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.email) {
              import('@/lib/brevo').then((brevo) => {
                brevo.sendOrderStatusUpdateEmail(data.email, orderId, newStatus).catch(console.error)
              })
            }
          })
      }

      fetchData()
    } catch (err) {
      console.error('[AdminPage] Order update error:', err)
      showError(formatUserFriendlyError(err))
    }
  }

  const handleToggleUserRole = async (targetProfile: Profile) => {
    const newRole = targetProfile.role === 'admin' ? 'customer' : 'admin'
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetProfile.id)

      if (error) throw error
      showSuccess(`Updated ${targetProfile.name || targetProfile.email}'s role to ${newRole}.`)
      fetchData()
    } catch (err) {
      showError(formatUserFriendlyError(err))
    }
  }

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailCheck = validateEmail(inviteEmail)
    if (!emailCheck.isValid) {
      showError(emailCheck.error!)
      return
    }

    try {
      setSubmitting(true)

      // Send Magic Link OTP via Supabase
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: inviteEmail.trim(),
        options: {
          data: { name: inviteName.trim() || 'Co-Admin' },
        },
      })

      if (magicLinkError) throw magicLinkError

      // Update existing profile role if user already exists
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', inviteEmail.trim().toLowerCase())

      showSuccess(`Magic Link Admin Invite sent to ${inviteEmail}!`)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteName('')
      fetchData()
    } catch (err) {
      console.error('[AdminInvite Error]', err)
      showError(err instanceof Error ? err.message : 'Failed to send admin invite.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Manage catalog products, customer orders, and co-admins</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Invite Admin (OTP Code)
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
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
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Admins &amp; Users ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'analytics'
                ? 'text-emerald-600 border-emerald-600'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading admin data...
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeTab === 'products' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
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
                          className="w-9 h-9 object-cover rounded bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{prod.description}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="chip chip-slate">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 text-sm">
                        {fmt(Number(prod.price))}
                      </td>
                      <td className="p-3">
                        {prod.stock === 0 ? (
                          <span className="chip chip-red">Out of Stock</span>
                        ) : prod.stock <= 3 ? (
                          <span className="chip chip-amber">{prod.stock} (Low)</span>
                        ) : (
                          <span className="font-bold text-emerald-700">{prod.stock}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600"
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
        ) : activeTab === 'orders' ? (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
                No customer orders found in system.
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600">Order ID: #{ord.id}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">User ID: {ord.user_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-lg">
                        {fmt(Number(ord.total_amount))}
                      </span>
                      
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="Processing">Status: Processing</option>
                        <option value="Shipped">Status: Shipped</option>
                        <option value="Out for Delivery">Status: Out for Delivery</option>
                        <option value="Delivered">Status: Delivered</option>
                        <option value="Cancelled">Status: Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(ord.products) &&
                      ord.products.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-xs text-slate-700 font-medium">
                          {item.name} × {item.quantity} ({fmt(Number(item.price))})
                        </span>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Users & Admin Roles Tab */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">User Profile</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3 text-right">Role Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {profiles.map((prof) => (
                    <tr key={prof.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {(prof.name || prof.email)[0].toUpperCase()}
                        </div>
                        {prof.name || 'Unnamed User'}
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{prof.email}</td>
                      <td className="p-3">
                        <span className={`chip ${prof.role === 'admin' ? 'chip-amber' : 'chip-slate'}`}>
                          {prof.role === 'admin' ? <ShieldAlert className="w-3 h-3 text-amber-600" /> : <UserCheck className="w-3 h-3 text-slate-500" />}
                          {prof.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserRole(prof)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            prof.role === 'admin'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {prof.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin 🛡️'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 border border-slate-200 shadow-xl">
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

        {/* Invite Admin Magic Link Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 border border-slate-200 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Invite Co-Admin via OTP Passcode</h3>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteAdmin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Co-Admin Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Co-Admin Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="admin2@epicvault.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                  ✨ Sending an invite delivers a 1-click passwordless <strong>Magic Link email via Brevo</strong>. Once the co-admin clicks the link, they gain access to the Admin Dashboard.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Send Admin Magic Link
                      </>
                    )}
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
