import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { NetworkBanner } from './components/layout/NetworkBanner'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProfilePage } from './pages/ProfilePage'

// Lazy-loaded pages (code-split for performance)
const ProductsPage = React.lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
)
const WishlistPage = React.lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
)
const AdminPage = React.lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
)
const OrderDetailPage = React.lazy(() =>
  import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage }))
)
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

// Cart Drawer (lazy-loaded)
const CartDrawer = React.lazy(() =>
  import('./components/cart/CartDrawer').then((m) => ({ default: m.CartDrawer }))
)

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function AppShell() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen w-full">
      <NetworkBanner />
      <Navbar onOpenCart={() => setCartOpen(true)} />

      <main className="flex-1">
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"        element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/signup"  element={<SignupPage />} />
            <Route
              path="/wishlist"
              element={<WishlistPage />}
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </main>

      <Footer />

      {/* Cart Drawer */}
      <React.Suspense fallback={null}>
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </React.Suspense>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppShell />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
