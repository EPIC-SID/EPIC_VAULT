import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { Toast, ToastType, ToastContextType } from '@/types'

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), duration)
    },
    [removeToast]
  )

  const showSuccess = useCallback(
    (msg: string) => addToast(msg, 'success'),
    [addToast]
  )
  const showError = useCallback(
    (msg: string) => addToast(msg, 'error', 5500),
    [addToast]
  )
  const showInfo = useCallback(
    (msg: string) => addToast(msg, 'info'),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, removeToast }}>
      {children}

      {/* Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[99] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto animate-slide-up flex items-start justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/25 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/25 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/25 text-indigo-200'
            }`}
          >
            <div className="flex items-start gap-2.5 pt-0.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100 p-0.5 shrink-0 transition-opacity mt-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
