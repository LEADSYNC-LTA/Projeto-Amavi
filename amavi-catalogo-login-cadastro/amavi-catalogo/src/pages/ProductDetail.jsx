import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import { formatCurrency, buildWhatsappProductInquiryUrl } from '../utils/whatsapp'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, isLoading } = useProducts()
  const { addItem, openCart } = useCart()

  const product = products.find((p) => p.id === id)

  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (product) {
      setSize(product.sizes?.[0] ?? '')
      setColor(product.colors?.[0] ?? '')
      setActiveImage(0)
      setQty(1)
    }
  }, [product])

  if (isLoading) {
    return <p className="px-5 py-24 text-center text-ink-soft">Carregando produto...</p>
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-24 text-center">
        <p className="text-ink-soft">Produto não encontrado.</p>
        <Link to="/" className="font-medium text-ink underline underline-offset-4">
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3)

  function handleAddToCart() {
    if (!size || !color) {
      setFeedback('Selecione tamanho e cor antes de continuar.')
      return
    }
    addItem(product, { size, color, qty })
    setFeedback('')
    openCart()
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-ink-soft hover:text-ink"
      >
        ← Voltar
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-taupe-light">
            <img
              src={product.images?.[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-14 overflow-hidden rounded-sm border ${
                    i === activeImage ? 'border-ink' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs uppercase tracking-wide text-ink-soft/70">{product.category}</span>
          <h1 className="mt-1 font-display text-2xl text-ink">{product.name}</h1>
          <p className="mt-2 text-lg text-ink-soft">{formatCurrency(product.price)}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-6">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-soft">
              Tamanho
            </span>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-sm border px-3 py-1.5 text-sm transition ${
                    size === s ? 'border-ink bg-ink text-cream' : 'border-taupe-dark text-ink-soft hover:border-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-soft">Cor</span>
            <div className="flex flex-wrap gap-2">
              {product.colors?.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`rounded-sm border px-3 py-1.5 text-sm transition ${
                    color === c ? 'border-ink bg-ink text-cream' : 'border-taupe-dark text-ink-soft hover:border-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">Qtd.</span>
            <div className="flex items-center gap-3 rounded-sm border border-taupe-dark px-3 py-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
                −
              </button>
              <span className="w-4 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar">
                +
              </button>
            </div>
            <span className="text-xs text-ink-soft/70">
              {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
            </span>
          </div>

          {feedback && <p className="mt-3 text-sm text-red-700">{feedback}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 rounded-sm bg-ink py-3 text-sm font-medium text-cream transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              Adicionar ao carrinho
            </button>
            <a
              href={buildWhatsappProductInquiryUrl(product)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-sm border border-ink/20 py-3 text-center text-sm text-ink transition hover:border-ink"
            >
              Perguntar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-xl text-ink">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
