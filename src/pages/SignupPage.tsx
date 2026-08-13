import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { UserPlus, User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react'

export function SignupPage() {
  const [name, setName]                       = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting]           = useState(false)

  const { signUp } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  // Calculate Password Strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '', width: 'w-0' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600', width: 'w-1/4' }
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600', width: 'w-2/4' }
      case 3:
        return { score: 3, label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-600', width: 'w-3/4' }
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: 'w-full' }
      default:
        return { score: 0, label: 'Too Short', color: 'bg-rose-400', textColor: 'text-rose-500', width: 'w-12' }
    }
  }

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showError('Please enter your full name.')
      return
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.')
      return
    }
    try {
      setSubmitting(true)
      await signUp({ name: name.trim(), email: email.trim(), password })
      showSuccess('Account created! Welcome to EPIC_VAULT.')
      navigate('/')
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Registration failed. Email may already be in use.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-2xl text-slate-900">User Registration</h1>
          <p className="text-xs text-slate-500">Create your student account to place orders</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className={inputClass}
              />
            </div>
          </div>

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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              {password && (
                <span className={`text-[11px] font-bold ${strength.textColor}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator Bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                  <span className={password.length >= 6 ? 'text-emerald-600 font-medium flex items-center gap-0.5' : ''}>
                    {password.length >= 6 ? <CheckCircle2 className="w-3 h-3" /> : '•'} Min. 6 chars
                  </span>
                  <span className={/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'text-emerald-600 font-medium flex items-center gap-0.5' : ''}>
                    {/[A-Z]/.test(password) && /[0-9]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : '•'} Uppercase &amp; Number
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-rose-600 font-semibold mt-1">Passwords do not match</p>
            )}
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
                <UserPlus className="w-4 h-4" />
                Register Account
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
          >
            Sign In <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  )
}
