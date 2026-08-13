import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, FileText, Image, Lock, ShieldCheck, Check, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { validateMobile, formatUserFriendlyError } from '@/lib/validation'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

// Preset cool avatar options
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
]

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, profile, updateProfile } = useAuth()
  const { showSuccess, showError } = useToast()

  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [bio, setBio]             = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(profile?.name || user?.user_metadata?.name || '')
      setPhone(profile?.phone || '')
      setBio(profile?.bio || '')
      setAvatarUrl(profile?.avatar_url || '')
    }
  }, [isOpen, profile, user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showError('Please enter your full name.')
      return
    }

    let cleanedPhone: string | null = null
    if (phone.trim()) {
      const mobileCheck = validateMobile(phone)
      if (!mobileCheck.isValid) {
        showError(mobileCheck.error!)
        return
      }
      cleanedPhone = mobileCheck.cleaned
    }

    try {
      setSubmitting(true)

      await updateProfile({
        name: name.trim(),
        phone: cleanedPhone,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })

      showSuccess('Profile updated successfully!')
      onClose()
    } catch (err) {
      showError(formatUserFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const initials = (name.trim() || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 sm:p-7 space-y-6 my-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Edit Profile</h2>
              <p className="text-xs text-slate-500">Update your student personal details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Live Preview & Selector */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-xs font-bold text-slate-800">Avatar Selection</span>
              <p className="text-[11px] text-slate-500">Pick a preset profile photo or paste an image URL below</p>
            </div>
          </div>

          {/* Preset Avatar Bubbles */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(url)}
                className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  avatarUrl === url ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="w-9 h-9 object-cover" />
                {avatarUrl === url && (
                  <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-300 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className={inputClass}
              />
            </div>
          </div>

          {/* Email Address (READ-ONLY / EXCLUDED from edit as requested) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <Lock className="w-2.5 h-2.5" /> Cannot be changed
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Your registered email is permanently tied to your account and orders.
            </p>
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                className={inputClass}
              />
            </div>
          </div>

          {/* Bio / Student Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Bio / Note (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Computer Engineering Student @ PCCOE"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Custom Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Custom Image URL (Optional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
