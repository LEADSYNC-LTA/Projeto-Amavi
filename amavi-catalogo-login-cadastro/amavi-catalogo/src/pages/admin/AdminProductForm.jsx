import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { CATEGORIES, SIZES } from '../../config/store'
import { filesToDataUrls } from '../../utils/files'

const emptyForm = {
  name: '',
  description: '',
  category: CATEGORIES[0],
  price: '',
  stock: '',
  sizes: [],
  colors: '',
  isNew: true,
  images: [],
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { products, addProduct, editProduct, isLoading } = useProducts()

  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing && !isLoading) {
      const existing = products.find((p) => p.id === id)
      if (existing) {
        setForm({
          ...existing,
          price: String(existing.price),
          stock: String(existing.stock),
          colors: existing.colors?.join(', ') ?? '',
        })
      }
    }
  }, [isEditing, id, products, isLoading])

  function toggleSize(size) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }))
  }

  async function handleImageUpload(e) {
    const files = e.target.files
    if (!files?.length) return
    const dataUrls = await filesToDataUrls(files)
    setForm((f) => ({ ...f, images: [...f.images, ...dataUrls] }))
  }

  function removeImage(index) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Informe o nome do produto.')
    if (form.sizes.length === 0) return setError('Selecione ao menos um tamanho.')
    if (form.images.length === 0) return setError('Adicione ao menos uma foto do produto.')
    if (Number(form.price) <= 0) return setError('Informe um preço válido.')

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      sizes: form.sizes,
      colors: form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      isNew: form.isNew,
      images: form.images,
    }

    try {
      if (isEditing) {
        await editProduct(id, payload)
      } else {
        await addProduct(payload)
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Não foi possível salvar o produto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-2xl text-ink">
        {isEditing ? 'Editar produto' : 'Novo produto'}
      </h1>
      <p className="mb-8 text-sm text-ink-soft">
        Esses dados aparecem imediatamente na vitrine pública do catálogo.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Nome do produto
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            placeholder="Ex: Vestido Midi Floral"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Descrição
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="resize-none rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            placeholder="Tecido, caimento, ocasião de uso..."
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
            Categoria
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
              className="h-4 w-4 accent-ink"
            />
            Marcar como lançamento
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
            Preço (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              placeholder="0,00"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
            Estoque
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              placeholder="0"
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm text-ink-soft">Tamanhos disponíveis</span>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`rounded-sm border px-3 py-1.5 text-sm transition ${
                  form.sizes.includes(s)
                    ? 'border-ink bg-ink text-cream'
                    : 'border-taupe-dark text-ink-soft hover:border-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Cores (separadas por vírgula)
          <input
            value={form.colors}
            onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
            className="rounded-sm border border-taupe-dark bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            placeholder="Preto, Off White, Rosa"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm text-ink-soft">Fotos do produto</span>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-sm" />
          {form.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-20 w-16 rounded-sm object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-cream"
                    aria-label="Remover imagem"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-soft disabled:opacity-60"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-sm border border-ink/20 px-6 py-3 text-sm text-ink hover:border-ink"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
