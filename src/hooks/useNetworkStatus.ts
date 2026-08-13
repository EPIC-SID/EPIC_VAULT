import { useState, useEffect } from 'react'

type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g'

interface NetworkStatus {
  isOnline:  boolean
  isSlow:    boolean          // true when on 2G / slow-2g
  effectiveType: EffectiveConnectionType | null
}

declare global {
  interface Navigator {
    connection?: {
      effectiveType?: EffectiveConnectionType
      downlink?: number
      addEventListener(type: string, listener: () => void): void
      removeEventListener(type: string, listener: () => void): void
    }
  }
}

function getStatus(): NetworkStatus {
  const isOnline = navigator.onLine
  const conn     = navigator.connection
  const effectiveType = (conn?.effectiveType ?? null) as EffectiveConnectionType | null
  const isSlow   = !isOnline || effectiveType === 'slow-2g' || effectiveType === '2g'
  return { isOnline, isSlow, effectiveType }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(getStatus)

  useEffect(() => {
    const update = () => setStatus(getStatus())

    window.addEventListener('online',  update)
    window.addEventListener('offline', update)
    navigator.connection?.addEventListener('change', update)

    return () => {
      window.removeEventListener('online',  update)
      window.removeEventListener('offline', update)
      navigator.connection?.removeEventListener('change', update)
    }
  }, [])

  return status
}
