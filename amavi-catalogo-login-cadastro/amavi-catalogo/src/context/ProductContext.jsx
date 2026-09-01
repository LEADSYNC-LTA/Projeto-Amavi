import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as productsApi from '../api/productsApi'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await productsApi.listProducts()
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Não foi possível carregar os produtos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addProduct(data) {
    const created = await productsApi.createProduct(data)
    await refresh()
    return created
  }

  async function editProduct(id, data) {
    const updated = await productsApi.updateProduct(id, data)
    await refresh()
    return updated
  }

  async function removeProduct(id) {
    await productsApi.deleteProduct(id)
    await refresh()
  }

  const value = { products, isLoading, error, refresh, addProduct, editProduct, removeProduct }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts precisa estar dentro de <ProductProvider>')
  return ctx
}
