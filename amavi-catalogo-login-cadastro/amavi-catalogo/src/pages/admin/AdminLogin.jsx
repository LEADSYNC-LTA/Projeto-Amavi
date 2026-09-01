import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { login, isAdmin, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAdmin) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    const success = await login(email, password)
    if (success) navigate('/admin')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="mb-1 font-display text-2xl text-ink">Acesso administrativo</h1>
      <p className="mb-8 text-sm text-ink-soft">Entre para gerenciar o catálogo Amavi.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@amavi.com.br"
            className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 rounded-sm bg-ink py-3 text-sm font-medium text-cream transition hover:bg-ink-soft disabled:opacity-60"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="mt-3 rounded-sm bg-taupe-light px-3 py-2 text-xs text-ink-soft">
          Demonstração: <strong>admin@amavi.com.br</strong> / <strong>amavi123</strong>
          <br />
          Altere essa credencial em <code>src/api/authApi.js</code> antes de publicar.
        </p>
      </form>
    </div>
  )
}
