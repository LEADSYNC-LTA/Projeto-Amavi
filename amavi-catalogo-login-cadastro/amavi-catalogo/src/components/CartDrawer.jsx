import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency, buildWhatsappCheckoutUrl } from '../utils/whatsapp'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, totalPrice, totalItems } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Fechar carrinho"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <aside className="relative flex h-full w-full max-w-sm flex-col bg-cream shadow-xl">
        <div className="flex items-center justify-between border-b border-taupe-dark px-5 py-4">
          <h2 className="font-display text-lg text-ink">Seu carrinho ({totalItems})</h2>
          <button onClick={closeCart} aria-label="Fechar" className="text-ink-soft hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ink-soft">
              <p className="font-body text-sm">Seu carrinho está vazio.</p>
              <Link to="/" onClick={closeCart} className="text-sm font-medium text-ink underline underline-offset-4">
                Ver o catálogo
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.lineId} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-16 flex-shrink-0 rounded-sm object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-body text-sm font-medium text-ink">{item.name}</span>
                    <span className="text-xs text-ink-soft">
                      Tam. {item.size} · {item.color}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.lineId, item.qty - 1)}
                        className="h-6 w-6 rounded-sm border border-ink/20 text-ink-soft hover:border-ink hover:text-ink"
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.lineId, item.qty + 1)}
                        className="h-6 w-6 rounded-sm border border-ink/20 text-ink-soft hover:border-ink hover:text-ink"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.lineId)}
                        className="ml-auto text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <span className="text-sm text-ink">{formatCurrency(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-taupe-dark px-5 py-4">
            <div className="mb-3 flex items-center justify-between font-body text-sm text-ink">
              <span>Total</span>
              <span className="font-medium">{formatCurrency(totalPrice)}</span>
            </div>
            <a
              href={buildWhatsappCheckoutUrl(items, totalPrice)}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-sm bg-ink py-3 text-center text-sm font-medium text-cream transition hover:bg-ink-soft"
            >
              Finalizar pelo WhatsApp
            </a>
            <Link
              to="/carrinho"
              onClick={closeCart}
              className="mt-2 block w-full rounded-sm border border-ink/20 py-3 text-center text-sm text-ink transition hover:border-ink"
            >
              Ver carrinho completo
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
