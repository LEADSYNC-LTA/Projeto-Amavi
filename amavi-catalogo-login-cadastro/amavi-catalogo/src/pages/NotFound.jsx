import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-ink">Página não encontrada</h1>
      <p className="text-sm text-ink-soft">O endereço acessado não existe.</p>
      <Link to="/" className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink-soft">
        Voltar ao catálogo
      </Link>
    </div>
  )
}
