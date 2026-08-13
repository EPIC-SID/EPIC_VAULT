import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { LogIn, Mail, Lock, Store, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signIn } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      showError('Please enter both email and password.')
      return
    }
    try {
      setSubmitting(true)
      await signIn({ email: email.trim(), password })
      showSuccess('Successfully logged in!')
      navigate(from, { replace: true })
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors'

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center mx-auto text-white shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-2xl text-slate-900">User Login</h1>
          <p className="text-xs text-slate-500">Sign in to your EPIC_VAULT account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
          >
            Create an Account <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  )
}
