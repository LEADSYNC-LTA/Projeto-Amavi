import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import fashionIcon from '../../assets/fashion-icon.svg'

export default function Register() {
  const { register, session, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' })
  const [localError, setLocalError] = useState('')

  if (session) return <Navigate to={session.role === 'admin' ? '/admin' : '/'} replace />

  function updateField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    if (form.password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('As senhas não coincidem.')
      return
    }

    const created = await register(form)
    if (created) navigate('/login', { state: { registered: true } })
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-register">
        <div className="auth-visual auth-visual-register">
          <div className="auth-brand">AMAVI</div>
          <div className="auth-welcome">
            <img src={fashionIcon} alt="Ícone de cabide relacionado à moda feminina" />
            <h2>Seu espaço Amavi</h2>
            <p>Crie sua conta para acessar a loja ou administrar o catálogo.</p>
          </div>
          <p className="auth-switch">Já possui uma conta? <Link to="/login">Entrar</Link></p>
        </div>

        <form className="auth-form auth-form-register" onSubmit={handleSubmit}>
          <div className="auth-title">
            <span>Faça parte da Amavi</span>
            <h1>Cadastro</h1>
          </div>

          <label className="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <input name="name" type="text" placeholder="Nome completo" value={form.name} onChange={updateField} required />
          </label>

          <label className="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
            <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={updateField} required />
          </label>

          <label className="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2M5 10h14v10H5z" /></svg>
            <input name="password" type="password" placeholder="Senha" value={form.password} onChange={updateField} required />
          </label>

          <label className="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2M5 10h14v10H5z" /></svg>
            <input name="confirmPassword" type="password" placeholder="Confirmar senha" value={form.confirmPassword} onChange={updateField} required />
          </label>

          <label className="auth-field auth-select-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20v-9l8-5 8 5v9M8 20v-6h8v6" /></svg>
            <select name="role" value={form.role} onChange={updateField} aria-label="Tipo de conta">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          {(localError || error) && <p className="auth-error">{localError || error}</p>}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="auth-security-note">Neste protótipo, o cadastro é salvo no navegador. Em produção, contas admin devem ser autorizadas pelo back-end.</p>
        </form>
      </section>
    </main>
  )
}
