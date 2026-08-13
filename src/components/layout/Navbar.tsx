import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Store, 
  Grid, 
  Laptop, 
  Dumbbell, 
  Headphones, 
  Gamepad2,
  PackageCheck
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

interface NavbarProps {
  onOpenCart: () => void
}

export function Navbar({ onOpenCart }: NavbarProps) {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { cartCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setMobileOpen(false)
  }

  const isCategoryActive = (cat: string) =>
    pathname === '/products' && search.includes(`category=${cat}`)

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-none">
              EPIC_VAULT
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider leading-none mt-0.5 block">
              Store Catalog
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 flex-1 ml-6">
          <Link
            to="/products"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              pathname === '/' || (pathname === '/products' && !search)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> All Products
          </Link>

          <Link
            to="/products?category=Electronics"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isCategoryActive('Electronics')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" /> Electronics
          </Link>

          <Link
            to="/products?category=Fitness"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isCategoryActive('Fitness')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> Fitness
          </Link>

          <Link
            to="/products?category=Audio"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isCategoryActive('Audio')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Audio
          </Link>

          <Link
            to="/products?category=Gaming"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isCategoryActive('Gaming')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Gaming
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                pathname === '/profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" /> My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                pathname === '/admin'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-extrabold bg-blue-600 text-white rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors max-w-[160px]"
              >
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{profile?.name ?? user.email}</span>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-lg bg-slate-100 text-slate-700"
          >
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 text-xs font-medium">
          <Link
            to="/products"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Grid className="w-4 h-4 text-blue-600" /> All Products
          </Link>
          <Link
            to="/products?category=Electronics"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Laptop className="w-4 h-4 text-slate-500" /> Electronics
          </Link>
          <Link
            to="/products?category=Fitness"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Dumbbell className="w-4 h-4 text-slate-500" /> Fitness
          </Link>
          <Link
            to="/products?category=Audio"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Headphones className="w-4 h-4 text-slate-500" /> Audio
          </Link>
          <Link
            to="/products?category=Gaming"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Gamepad2 className="w-4 h-4 text-slate-500" /> Gaming
          </Link>

          {user && (
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <PackageCheck className="w-4 h-4 text-blue-600" /> My Orders &amp; Addresses
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-800 font-bold bg-amber-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Portal
            </Link>
          )}

          <div className="pt-2 mt-2 border-t border-slate-200 space-y-2">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
