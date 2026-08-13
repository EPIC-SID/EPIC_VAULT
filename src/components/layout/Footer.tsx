import React from 'react'
import { Link } from 'react-router-dom'
import { Store, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">

          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight">EPIC_VAULT</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Your premier destination for high-quality electronics, gear, apparel, and lifestyle accessories.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/products" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                  Browse Store Catalog
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                  My Profile &amp; Orders
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                  Admin Portal <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Address Column */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Contact &amp; Location
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">John Doe</span>
                  <p className="text-slate-500 font-mono">johndoe@epicvault.com</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-slate-700">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-snug">
                  Pimpri Chinchwad College of Engineering (PCCOE), Sector 26, Pradhikaran, Nigdi, Pune, Maharashtra 411044
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} EPIC_VAULT Store. All rights reserved.</p>
          <p className="text-[11px]">Pimpri Chinchwad College of Engineering, Pune</p>
        </div>
      </div>
    </footer>
  )
}
