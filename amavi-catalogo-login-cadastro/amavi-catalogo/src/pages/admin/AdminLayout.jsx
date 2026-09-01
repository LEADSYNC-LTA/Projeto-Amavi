import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { STORE_CONFIG } from '../../config/store'

export default function AdminLayout() {
  const { session, logout } = useAuth()

  return (
    <div className="min-h-screen bg-cream font-body text-ink">
      <header className="border-b border-taupe-dark bg-taupe">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-display text-lg text-ink">
              {STORE_CONFIG.name} <span className="text-sm font-body text-ink-soft">admin</span>
            </Link>
            <nav className="hidden gap-5 text-sm text-ink-soft sm:flex">
              <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'text-ink font-medium' : 'hover:text-ink')}>
                Produtos
              </NavLink>
              <NavLink to="/admin/produtos/novo" className={({ isActive }) => (isActive ? 'text-ink font-medium' : 'hover:text-ink')}>
                Novo produto
              </NavLink>
              <Link to="/" className="hover:text-ink">
                Ver loja
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm text-ink-soft">
            <span className="hidden sm:inline">{session?.name}</span>
            <button
              onClick={logout}
              className="rounded-sm border border-ink/20 px-3 py-1.5 text-ink transition hover:border-ink"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
