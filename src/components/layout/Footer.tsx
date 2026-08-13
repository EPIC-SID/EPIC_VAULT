import React from 'react'
import { Link } from 'react-router-dom'
import { Store, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/70 text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-5 sm:mb-6">

          {/* Brand Column */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight">EPIC_VAULT</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Your destination for premium electronics, gaming gear, and audio essentials with real-time stock sync.
            </p>
          </div>

          {/* 2-Column Sub-grid on Mobile: Quick Navigation & Support */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:contents gap-4">

            {/* Quick Links Column */}
            <div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">
                Navigation
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs font-medium">
                <li>
                  <Link to="/products" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-slate-600 hover:text-rose-600 transition-colors inline-flex items-center gap-1">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-slate-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1">
                    Admin Portal <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Location Column */}
            <div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">
                Contact &amp; Location
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a href="mailto:support@epicvault.store" className="hover:text-blue-600 truncate transition-colors">
                    support@epicvault.store
                  </a>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 leading-snug">
                    PCCOE Campus, Pune 411044
                  </span>
                </li>
                <li className="flex items-center gap-1.5 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">100% Secure Checkout</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-3 sm:pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} EPIC_VAULT Store. All rights reserved.</p>
          <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
            <span>Secure Checkout</span>
            <span>•</span>
            <span>Live Stock Sync</span>
            <span>•</span>
            <span>Fast Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
