import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { formatCurrency } from '../../utils/whatsapp'

export default function AdminDashboard() {
  const { products, isLoading, removeProduct } = useProducts()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  async function confirmDelete(id) {
    await removeProduct(id)
    setPendingDeleteId(null)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Produtos</h1>
          <p className="text-sm text-ink-soft">{products.length} peças cadastradas na vitrine.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <Link
            to="/admin/produtos/novo"
            className="whitespace-nowrap rounded-sm bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-soft"
          >
            + Novo produto
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-ink-soft">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">Nenhum produto encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-taupe-dark">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-taupe-dark bg-taupe-light text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">Peça</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-taupe-dark/60 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={product.images?.[0]}
                      alt=""
                      className="h-12 w-10 rounded-sm object-cover"
                    />
                    <span className="font-medium text-ink">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{product.category}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock <= 0
                          ? 'text-red-700'
                          : product.stock <= 3
                          ? 'text-amber-700'
                          : 'text-ink-soft'
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/admin/produtos/${product.id}/editar`}
                        className="text-ink-soft underline underline-offset-2 hover:text-ink"
                      >
                        Editar
                      </Link>
                      {pendingDeleteId === product.id ? (
                        <span className="flex items-center gap-2">
                          <button
                            onClick={() => confirmDelete(product.id)}
                            className="text-red-700 underline underline-offset-2"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="text-ink-soft underline underline-offset-2"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setPendingDeleteId(product.id)}
                          className="text-ink-soft underline underline-offset-2 hover:text-red-700"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
