import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { LogIn, Mail, Lock, Store, ArrowRight, KeyRound, ShieldCheck, Hash, Eye, EyeOff } from 'lucide-react'

import { validateEmail, formatUserFriendlyError } from '@/lib/validation'

export function LoginPage() {
  const [authMode, setAuthMode]       = useState<'password' | 'otp'>('password')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpToken, setOtpToken]       = useState('')
  const [otpStep, setOtpStep]         = useState<'request' | 'verify'>('request')
  const [submitting, setSubmitting]   = useState(false)

  const { signIn, sendOtp, verifyOtp } = useAuth()
  const { showSuccess, showError }    = useToast()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailCheck = validateEmail(email)
    if (!emailCheck.isValid) {
      showError(emailCheck.error!)
      return
    }
    if (!password) {
      showError('Please enter your password.')
      return
    }

    try {
      setSubmitting(true)
      await signIn({ email: email.trim(), password })
      showSuccess('Successfully logged in!')
      navigate(from, { replace: true })
    } catch (err) {
      showError(formatUserFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailCheck = validateEmail(email)
    if (!emailCheck.isValid) {
      showError(emailCheck.error!)
      return
    }

    try {
      setSubmitting(true)
      await sendOtp(email.trim())
      setOtpStep('verify')
      showSuccess('OTP Code sent! Please check your email inbox.')
    } catch (err) {
      showError(formatUserFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpToken.trim()) {
      showError('Please enter the 6-digit OTP code sent to your email.')
      return
    }
    if (otpToken.trim().length !== 6) {
      showError('Please enter a valid 6-digit OTP code.')
      return
    }

    try {
      setSubmitting(true)
      await verifyOtp(email.trim(), otpToken.trim())
      showSuccess('OTP Verified! Welcome back.')
      navigate(from, { replace: true })
    } catch (err) {
      showError(formatUserFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors'

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-2xl text-slate-900">User Login</h1>
          <p className="text-xs text-slate-500">Sign in to your EPIC_VAULT account</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setOtpStep('request') }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'password'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setOtpStep('request') }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'otp'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> One-Time Passcode (OTP)
          </button>
        </div>

        {/* Password Auth Form */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
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
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP Code Form */}
        {authMode === 'otp' && (
          otpStep === 'request' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">
                📬 Enter your registered email to receive a <strong>6-digit One-Time Passcode (OTP)</strong> delivered to your inbox.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Send 6-Digit OTP
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    OTP Passcode
                  </label>
                  <span className="text-[11px] text-slate-500">{email}</span>
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.trim())}
                    placeholder="Enter OTP Passcode"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-lg pl-10 pr-3.5 py-2.5 text-center text-lg tracking-widest font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Verify OTP &amp; Log In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpStep('request')}
                className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 text-center block pt-1"
              >
                ← Resend OTP or change email
              </button>
            </form>
          )
        )}

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
