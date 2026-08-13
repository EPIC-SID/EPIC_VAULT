import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { CartItem, CartContextType, Product } from '@/types'
import { useToast } from './ToastContext'

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = 'epic_vault_cart_v1'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const { showSuccess, showError, showInfo } = useToast()

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('[CartContext] localStorage write error:', e)
    }
  }, [items])

  /**
   * Safe toast execution deferred after render batch
   */
  const notifySuccess = (msg: string) => setTimeout(() => showSuccess(msg), 0)
  const notifyError   = (msg: string) => setTimeout(() => showError(msg), 0)
  const notifyInfo    = (msg: string) => setTimeout(() => showInfo(msg), 0)

  /**
   * Add a product to cart. Returns true on success, false on stock failure.
   * Enforces: quantity in cart can never exceed product.stock.
   */
  const addToCart = (product: Product, quantityToAdd = 1): boolean => {
    if (product.stock <= 0) {
      notifyError(`"${product.name}" is out of stock.`)
      return false
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id)
    const existingQty = existingIndex > -1 ? items[existingIndex].quantity : 0
    const newQty = existingQty + quantityToAdd

    if (newQty > product.stock) {
      notifyError(
        `Max available stock for "${product.name}" is ${product.stock}. You already have ${existingQty} in cart.`
      )
      return false
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id)
      if (idx > -1) {
        const updated = [...prev]
        updated[idx] = { product, quantity: newQty }
        return updated
      }
      return [...prev, { product, quantity: quantityToAdd }]
    })

    if (existingIndex > -1) {
      notifySuccess(`Updated "${product.name}" quantity to ${newQty}.`)
    } else {
      notifySuccess(`Added "${product.name}" to cart.`)
    }

    return true
  }

  const updateQuantity = (productId: string, newQty: number): void => {
    if (newQty <= 0) {
      removeFromCart(productId)
      return
    }

    const item = items.find((i) => i.product.id === productId)
    if (!item) return

    if (newQty > item.product.stock) {
      notifyError(
        `Cannot exceed stock limit of ${item.product.stock} for "${item.product.name}".`
      )
      return
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === productId)
      if (idx === -1) return prev
      const updated = [...prev]
      updated[idx] = { ...updated[idx], quantity: newQty }
      return updated
    })
  }

  const removeFromCart = (productId: string): void => {
    const item = items.find((i) => i.product.id === productId)
    if (item) notifyInfo(`Removed "${item.product.name}" from cart.`)
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const clearCart = (): void => setItems([])

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
