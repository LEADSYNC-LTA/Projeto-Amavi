import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { STORE_CONFIG } from '../config/store'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { totalItems, openCart } = useCart()
  const { isAdmin, isAuthenticated, session, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-taupe/95 backdrop-blur border-b border-taupe-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-xl tracking-wide text-ink" onClick={() => setMenuOpen(false)}>{STORE_CONFIG.name}</Link>
        <nav className="hidden items-center gap-8 font-body text-sm text-ink-soft md:flex">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-ink font-medium' : 'hover:text-ink')}>Roupas</NavLink>
          <NavLink to="/?destaque=lancamentos" className="hover:text-ink">Lançamentos</NavLink>
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => (isActive ? 'text-ink font-medium' : 'hover:text-ink')}>Painel admin</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          <button type="button" onClick={openCart} aria-label="Abrir carrinho de compras" className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-ink/20 text-ink transition hover:bg-ink hover:text-cream">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 6L4.5 2H2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></svg>
            {totalItems > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-cream">{totalItems}</span>}
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="max-w-28 truncate text-xs text-ink-soft">Olá, {session?.name?.split(' ')[0]}</span>
              {isAdmin && <Link to="/admin" className="rounded-sm bg-ink px-3 py-2 text-sm font-medium text-cream transition hover:bg-ink-soft">Admin</Link>}
              <button onClick={logout} className="text-sm text-ink-soft hover:text-ink">Sair</button>
            </div>
          ) : (
            <Link to="/login" className="hidden rounded-sm bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-ink-soft sm:inline-block">Login</Link>
          )}

          <button type="button" className="flex h-9 w-9 items-center justify-center text-ink md:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen((v) => !v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-taupe-dark bg-taupe px-5 py-3 font-body text-sm md:hidden">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className="py-2 text-ink-soft">Roupas</NavLink>
          <NavLink to="/?destaque=lancamentos" onClick={() => setMenuOpen(false)} className="py-2 text-ink-soft">Lançamentos</NavLink>
          {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="py-2 text-ink-soft">Painel admin</NavLink>}
          {!isAuthenticated ? <NavLink to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-ink-soft">Login</NavLink> : <button onClick={() => { logout(); setMenuOpen(false) }} className="py-2 text-left text-ink-soft">Sair</button>}
        </nav>
      )}
    </header>
  )
}
