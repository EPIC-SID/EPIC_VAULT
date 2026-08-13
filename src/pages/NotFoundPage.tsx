import React from 'react'
import { Link } from 'react-router-dom'
import { Vault, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <Vault className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="font-display text-4xl font-black text-white">404 — Page Not Found</h1>
        <p className="text-sm text-slate-400">
          The vault sector you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>
    </div>
  )
}
