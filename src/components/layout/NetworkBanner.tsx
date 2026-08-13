import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function NetworkBanner() {
  const { isOnline, isSlow, effectiveType } = useNetworkStatus()
  const [dismissed, setDismissed] = useState(false)
  const [wasOffline,  setWasOffline]  = useState(false)
  const [showRestored, setShowRestored] = useState(false)

  // Track going offline → online transitions to show "Connection Restored" toast
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      setDismissed(false)
    } else if (wasOffline && isOnline) {
      setWasOffline(false)
      setShowRestored(true)
      const t = setTimeout(() => setShowRestored(false), 4000)
      return () => clearTimeout(t)
    }
  }, [isOnline, wasOffline])

  // Reset dismissed whenever network changes to bad
  useEffect(() => {
    if (!isOnline || isSlow) setDismissed(false)
  }, [isOnline, isSlow])

  if (showRestored) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center px-4 py-2.5 bg-emerald-500 text-white text-xs font-semibold shadow-lg animate-in slide-in-from-top-2 duration-300"
        role="status"
        aria-live="polite"
      >
        <Wifi className="w-4 h-4 mr-2 shrink-0" />
        Connection restored — showing latest catalog
        <button
          onClick={() => setShowRestored(false)}
          className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  if (!isOnline && !dismissed) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-3 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold shadow-lg"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>You're offline — showing cached catalog. Some features may be unavailable.</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap"
          aria-label="Retry connection"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    )
  }

  if (isOnline && isSlow && !dismissed) {
    const label = effectiveType === 'slow-2g' ? '2G/Slow' : '3G'
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-3 px-4 py-2 bg-amber-500 text-white text-xs font-semibold shadow-md"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Slow connection detected ({label}) — images load progressively to save data.</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss slow network warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return null
}
