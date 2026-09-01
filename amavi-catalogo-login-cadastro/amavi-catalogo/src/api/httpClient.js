// ---------------------------------------------------------------------------
// httpClient
// ---------------------------------------------------------------------------
// Este arquivo é o ÚNICO lugar que deveria mudar quando o back-end real
// (PHP/Python + MySQL/MongoDB, conforme o projeto de extensão) estiver no ar.
//
// Hoje ele simula requisições HTTP usando localStorage como "banco de dados".
// Quando a API real existir, basta trocar o corpo de cada função por um
// fetch(`${BASE_URL}/...`) de verdade — as telas (páginas/componentes) não
// precisam ser alteradas, pois todas conversam com o app através das funções
// exportadas em `src/api/productsApi.js` e `src/api/authApi.js`.
//
// Exemplo de como ficaria futuramente:
//
//   export async function request(path, options = {}) {
//     const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
//       headers: { 'Content-Type': 'application/json', ...options.headers },
//       ...options,
//     })
//     if (!res.ok) throw new Error(`Erro ${res.status}`)
//     return res.json()
//   }
// ---------------------------------------------------------------------------

const LATENCY_MS = 250

export function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error(`Falha ao ler "${key}" do armazenamento local`, err)
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Falha ao gravar "${key}" no armazenamento local`, err)
  }
}
