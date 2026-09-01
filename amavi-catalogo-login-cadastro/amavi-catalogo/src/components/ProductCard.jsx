import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/whatsapp'

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0

  return (
    <Link
      to={`/produto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-sm bg-white/60 transition hover:bg-white"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-taupe-light">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-sm bg-ink px-2 py-1 text-[11px] font-medium text-cream">
            Novo
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-sm font-medium text-cream">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1 py-3">
        <span className="text-[11px] uppercase tracking-wide text-ink-soft/70">{product.category}</span>
        <h3 className="font-body text-sm font-medium text-ink">{product.name}</h3>
        <span className="mt-auto font-body text-sm text-ink-soft">{formatCurrency(product.price)}</span>
      </div>
    </Link>
  )
}
