import { STORE_CONFIG } from '../config/store'

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Monta a mensagem de pedido e retorna o link wa.me pronto para abrir.
// O cliente finaliza a compra sendo direcionado à conversa no WhatsApp da loja,
// já com a lista de itens, tamanhos, cores e o total preenchidos.
export function buildWhatsappCheckoutUrl(items, totalPrice) {
  const lines = [
    `Olá, ${STORE_CONFIG.name}! Quero fazer o seguinte pedido:`,
    '',
    ...items.map(
      (item) =>
        `• ${item.qty}x ${item.name} — Tam. ${item.size} / Cor: ${item.color} — ${formatCurrency(
          item.price * item.qty
        )}`
    ),
    '',
    `Total: ${formatCurrency(totalPrice)}`,
    '',
    'Podem me confirmar disponibilidade e forma de pagamento?',
  ]
  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${text}`
}

export function buildWhatsappProductInquiryUrl(product) {
  const text = encodeURIComponent(
    `Olá! Tenho interesse na peça "${product.name}" (${formatCurrency(product.price)}). Ainda está disponível?`
  )
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${text}`
}

export { formatCurrency }
