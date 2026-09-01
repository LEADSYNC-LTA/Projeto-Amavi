import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { CATEGORIES, SIZES, STORE_CONFIG } from '../config/store'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { products, isLoading, error } = useProducts()
  const [searchParams] = useSearchParams()
  const isLancamentos = searchParams.get('destaque') === 'lancamentos'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [size, setSize] = useState('Todos')

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (isLancamentos && !product.isNew) return false
      if (category !== 'Todas' && product.category !== category) return false
      if (size !== 'Todos' && !product.sizes?.includes(size)) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!product.name.toLowerCase().includes(q) && !product.category.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  }, [products, category, size, search, isLancamentos])

  return (
    <div>
      <section className="relative overflow-hidden bg-ink px-5 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.2em] text-cream/60">
            Moda feminina inclusiva
          </p>
          <h1 className="font-display text-3xl leading-snug text-cream sm:text-4xl">
            {STORE_CONFIG.tagline}
          </h1>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl text-ink">
            {isLancamentos ? 'Lançamentos' : 'Catálogo'}
          </h2>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar peça..."
              className="w-full rounded-sm border border-taupe-dark bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-ink focus:outline-none sm:w-56"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option>Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option>Todos</option>
              {SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <p className="py-16 text-center text-ink-soft">Carregando peças...</p>}
        {error && <p className="py-16 text-center text-red-700">{error}</p>}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-20 text-center text-ink-soft">
            <p className="font-body text-sm">Nenhuma peça encontrada com esses filtros.</p>
            <button
              onClick={() => {
                setSearch('')
                setCategory('Todas')
                setSize('Todos')
              }}
              className="text-sm font-medium text-ink underline underline-offset-4"
            >
              Limpar filtros
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
