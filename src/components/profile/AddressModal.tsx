import React, { useState } from 'react'
import { MapPin, X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Address } from '@/types'

import { validateMobile, formatUserFriendlyError } from '@/lib/validation'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onAddressSaved: (address: Address) => void
}

export function AddressModal({ isOpen, onClose, onAddressSaved }: AddressModalProps) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [fullName, setFullName]           = useState('')
  const [phone, setPhone]                 = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity]                   = useState('')
  const [stateName, setStateName]         = useState('')
  const [pincode, setPincode]             = useState('')
  const [isDefault, setIsDefault]         = useState(false)
  const [saving, setSaving]               = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showError('Please sign in to save your shipping address.')
      return
    }

    if (!fullName.trim()) {
      showError('Please enter the recipient full name.')
      return
    }

    const mobileCheck = validateMobile(phone)
    if (!mobileCheck.isValid) {
      showError(mobileCheck.error!)
      return
    }

    if (!streetAddress.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      showError('Please fill out all address fields (street, city, state, pincode).')
      return
    }

    try {
      setSaving(true)

      // If set as default, reset existing defaults for this user
      if (isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const newAddr = {
        user_id: user.id,
        full_name: fullName.trim(),
        phone: mobileCheck.cleaned,
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        is_default: isDefault,
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert(newAddr)
        .select('*')
        .single()

      if (error) throw error

      showSuccess('Shipping address saved successfully!')
      onAddressSaved(data as Address)
      onClose()

      // Reset form
      setFullName('')
      setPhone('')
      setStreetAddress('')
      setCity('')
      setStateName('')
      setPincode('')
      setIsDefault(false)
    } catch (err) {
      showError(formatUserFriendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-slate-900">Add New Shipping Address</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Flat / House No. / Building / Street
            </label>
            <input
              type="text"
              required
              placeholder="102, Green Park Avenue, Main Road"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                required
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                required
                placeholder="Maharashtra"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pincode
              </label>
              <input
                type="text"
                required
                placeholder="400001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-xs text-slate-600 font-medium">
              Set as my default delivery address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Save Address
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
