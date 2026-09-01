import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authApi.getSession())
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function login(email, password) {
    setIsLoading(true)
    setError(null)
    try {
      const result = await authApi.login(email, password)
      setSession(result)
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function register(data) {
    setIsLoading(true)
    setError(null)
    try {
      return await authApi.registerUser(data)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    await authApi.logout()
    setSession(null)
  }

  const value = {
    session,
    isAuthenticated: Boolean(session),
    isAdmin: session?.role === 'admin',
    login,
    register,
    logout,
    error,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
