import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { STORE_CONFIG } from '../config/store'
import { formatCurrency, buildWhatsappCheckoutUrl } from '../utils/whatsapp'

export default function Cart() {
  const { items, updateQty, removeItem, totalPrice, clearCart } = useCart()
  const missingForFreeShipping = Math.max(0, STORE_CONFIG.freeShippingThreshold - totalPrice)

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Seu carrinho está vazio</h1>
        <p className="text-sm text-ink-soft">Que tal dar uma olhada nas nossas peças?</p>
        <Link to="/" className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink-soft">
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-1 font-display text-2xl text-ink">Meu carrinho</h1>
      <p className="mb-8 text-sm text-ink-soft">Revise os itens antes de enviar seu pedido.</p>

      <ul className="flex flex-col divide-y divide-taupe-dark border-y border-taupe-dark">
        {items.map((item) => (
          <li key={item.lineId} className="flex gap-4 py-5">
            <img src={item.image} alt={item.name} className="h-28 w-20 rounded-sm object-cover" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-body text-sm font-medium text-ink">{item.name}</h3>
                  <p className="text-xs text-ink-soft">
                    Tam. {item.size} · Cor: {item.color}
                  </p>
                </div>
                <span className="whitespace-nowrap text-sm text-ink">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>

              <div className="mt-auto flex items-center gap-3 pt-3">
                <div className="flex items-center gap-2 rounded-sm border border-taupe-dark px-2 py-1">
                  <button onClick={() => updateQty(item.lineId, item.qty - 1)} aria-label="Diminuir">
                    −
                  </button>
                  <span className="w-4 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.lineId, item.qty + 1)} aria-label="Aumentar">
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.lineId)}
                  className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        <button onClick={clearCart} className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink">
          Esvaziar carrinho
        </button>
        <Link to="/" className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink">
          Continuar comprando
        </Link>
      </div>

      <div className="mt-8 rounded-sm bg-taupe-light p-5">
        {missingForFreeShipping > 0 ? (
          <p className="mb-3 text-xs text-ink-soft">
            Faltam {formatCurrency(missingForFreeShipping)} para frete grátis*.
          </p>
        ) : (
          <p className="mb-3 text-xs text-ink-soft">Seu pedido já garante frete grátis*.</p>
        )}
        <div className="mb-4 flex items-center justify-between font-body text-base text-ink">
          <span>Total</span>
          <span className="font-medium">{formatCurrency(totalPrice)}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={buildWhatsappCheckoutUrl(items, totalPrice)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-sm bg-ink py-3 text-center text-sm font-medium text-cream transition hover:bg-ink-soft"
          >
            Finalizar pelo WhatsApp
          </a>
          <a
            href={STORE_CONFIG.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-sm border border-ink/30 py-3 text-center text-sm text-ink transition hover:border-ink"
          >
            Finalizar pelo Instagram
          </a>
        </div>
        <p className="mt-3 text-[11px] text-ink-soft/70">
          *Condições de frete confirmadas diretamente com a equipe Amavi. Ao finalizar, você será
          direcionada ao nosso canal de vendas para confirmar disponibilidade e pagamento.
        </p>
      </div>
    </div>
  )
}
