import { delay, readStorage, writeStorage } from './httpClient'
import { seedProducts } from '../data/seedProducts'

const STORAGE_KEY = 'amavi:products'

function loadAll() {
  return readStorage(STORAGE_KEY, seedProducts)
}

function saveAll(products) {
  writeStorage(STORAGE_KEY, products)
}

function generateId() {
  return `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// GET /produtos
export async function listProducts() {
  await delay()
  return loadAll()
}

// GET /produtos/:id
export async function getProduct(id) {
  await delay()
  const product = loadAll().find((p) => p.id === id)
  if (!product) throw new Error('Produto não encontrado')
  return product
}

// POST /produtos
export async function createProduct(data) {
  await delay()
  const products = loadAll()
  const newProduct = {
    id: generateId(),
    isNew: true,
    ...data,
  }
  products.unshift(newProduct)
  saveAll(products)
  return newProduct
}

// PUT /produtos/:id
export async function updateProduct(id, data) {
  await delay()
  const products = loadAll()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Produto não encontrado')
  products[index] = { ...products[index], ...data, id }
  saveAll(products)
  return products[index]
}

// DELETE /produtos/:id
export async function deleteProduct(id) {
  await delay()
  const products = loadAll().filter((p) => p.id !== id)
  saveAll(products)
  return { success: true }
}

// Restaura o catálogo para os produtos de demonstração originais
export async function resetToSeed() {
  await delay()
  saveAll(seedProducts)
  return seedProducts
}
