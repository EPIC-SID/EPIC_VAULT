import React from 'react'
import { Store, Shield, Lock, Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">

          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                <Store className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900 text-sm">EPIC_VAULT</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              A full-stack e-commerce application built for the ACM Junior Webmaster Recruitment Task.
              React 19, TypeScript, Supabase PostgreSQL, deployed on Vercel.
            </p>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Technology Stack
            </h4>
            <ul className="space-y-1 text-xs text-slate-500">
              <li>React 19 + Vite 6</li>
              <li>TypeScript (Strict Mode)</li>
              <li>Tailwind CSS v4</li>
              <li>Supabase Auth &amp; PostgreSQL</li>
            </ul>
          </div>

          {/* Security Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Key Features
            </h4>
            <ul className="space-y-1 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Row-Level Security (RLS)
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                JWT Auth via Supabase
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Atomic Checkout (SELECT FOR UPDATE)
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} EPIC_VAULT — ACM Webmaster Task Submission</p>
          <p>Deployable to Vercel · No Docker</p>
        </div>
      </div>
    </footer>
  )
}
