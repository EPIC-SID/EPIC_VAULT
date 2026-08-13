import React, { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Verifying session…
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 px-6 space-y-5 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400 mt-2">
            This area requires administrator privileges. Your current role is{' '}
            <span className="font-semibold text-slate-200">
              "{profile?.role ?? 'customer'}"
            </span>
            .
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <>{children}</>
}
