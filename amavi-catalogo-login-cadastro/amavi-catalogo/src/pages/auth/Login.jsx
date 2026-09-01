import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import fashionIcon from '../../assets/fashion-icon.svg'

export default function Login() {
  const { login, session, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (session) return <Navigate to={session.role === 'admin' ? '/admin' : '/'} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await login(email, password)
    if (result) navigate(result.role === 'admin' ? '/admin' : '/')
  }

  const adminHint = new URLSearchParams(location.search).get('tipo') === 'admin'

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-login">
        <div className="auth-visual">
          <div className="auth-brand">AMAVI</div>
          <div className="auth-welcome">
            <img src={fashionIcon} alt="Ícone de cabide relacionado à moda feminina" />
            <h2>Bem-vinda à Amavi</h2>
            <p>Moda feminina, leveza e estilo em cada detalhe.</p>
          </div>
          <p className="auth-switch">Ainda não possui conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-title">
            <span>Acesse sua conta</span>
            <h1>Login</h1>
          </div>

          <label className="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2M5 10h14v10H5z" /></svg>
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <div className="auth-help-row">
            <span>Entram aqui contas de usuário e administrador.</span>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {adminHint && <p className="auth-info">Acesse com uma conta de administrador para abrir o painel.</p>}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="auth-demo">Admin de demonstração: <strong>admin@amavi.com.br</strong> / <strong>amavi123</strong></p>
        </form>
      </section>
    </main>
  )
}
