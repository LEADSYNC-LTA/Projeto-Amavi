import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage } from '../api/httpClient'

const CART_KEY = 'amavi:cart'
const CartContext = createContext(null)

// Cada item do carrinho é identificado pela combinação produto+tamanho+cor,
// já que o mesmo produto pode ser adicionado em variações diferentes.
function lineId(productId, size, color) {
  return `${productId}__${size}__${color}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage(CART_KEY, []))
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    writeStorage(CART_KEY, items)
  }, [items])

  function addItem(product, { size, color, qty = 1 }) {
    setItems((prev) => {
      const id = lineId(product.id, size, color)
      const existing = prev.find((item) => item.lineId === id)
      if (existing) {
        return prev.map((item) =>
          item.lineId === id ? { ...item, qty: item.qty + qty } : item
        )
      }
      return [
        ...prev,
        {
          lineId: id,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          color,
          qty,
        },
      ]
    })
    setIsOpen(true)
  }

  function removeItem(lineIdToRemove) {
    setItems((prev) => prev.filter((item) => item.lineId !== lineIdToRemove))
  }

  function updateQty(lineIdToUpdate, qty) {
    if (qty < 1) return removeItem(lineIdToUpdate)
    setItems((prev) =>
      prev.map((item) => (item.lineId === lineIdToUpdate ? { ...item, qty } : item))
    )
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items])
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [items]
  )

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
