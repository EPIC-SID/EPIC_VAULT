// ─── Supabase Table Row Types ────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  street_address: string
  city: string
  state: string
  pincode: string
  is_default: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  description: string | null
  image_url: string | null
  stock: number
  created_at: string
  updated_at: string
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled'

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

export interface StatusTimelineItem {
  status: OrderStatus
  timestamp: string
}

export interface Order {
  id: string
  user_id: string
  products: OrderItem[]
  total_amount: number
  order_status: OrderStatus
  shipping_address: Address | null
  status_timeline: StatusTimelineItem[]
  created_at: string
  updated_at: string
}

// ─── Cart Types ──────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

// ─── Auth Context Types ──────────────────────────────────────────────────────

export interface AuthContextType {
  user: import('@supabase/supabase-js').User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signUp: (args: { name: string; email: string; password: string }) => Promise<void>
  signIn: (args: { email: string; password: string }) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signOut: () => Promise<void>
}

// ─── Cart Context Types ──────────────────────────────────────────────────────

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => boolean
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartCount: number
  totalAmount: number
}

// ─── Toast Types ─────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export interface ToastContextType {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  removeToast: (id: string) => void
}

// ─── Admin Form Types ─────────────────────────────────────────────────────────

export interface ProductFormData {
  name: string
  category: string
  price: string
  description: string
  image_url: string
  stock: string
}

// ─── Supabase RPC Return Types ────────────────────────────────────────────────

export interface PlaceOrderResult {
  success: boolean
  order_id: string
  message?: string
}
