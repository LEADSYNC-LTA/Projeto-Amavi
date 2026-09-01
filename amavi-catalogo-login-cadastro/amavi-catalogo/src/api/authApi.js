import { delay, readStorage, writeStorage } from './httpClient'

const SESSION_KEY = 'amavi:session'
const USERS_KEY = 'amavi:users'

const DEFAULT_ADMIN = {
  id: 'admin-default',
  name: 'Equipe Amavi',
  email: 'admin@amavi.com.br',
  password: 'amavi123',
  role: 'admin',
}

function getUsers() {
  const stored = readStorage(USERS_KEY, [])
  const hasDefaultAdmin = stored.some((user) => user.email === DEFAULT_ADMIN.email)
  return hasDefaultAdmin ? stored : [DEFAULT_ADMIN, ...stored]
}

export async function registerUser({ name, email, password, role = 'user' }) {
  await delay()
  const normalizedEmail = email.trim().toLowerCase()
  const users = getUsers()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.')
  }

  const newUser = {
    id: crypto.randomUUID?.() || String(Date.now()),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role === 'admin' ? 'admin' : 'user',
    createdAt: Date.now(),
  }

  const persistedUsers = users.filter((user) => user.id !== DEFAULT_ADMIN.id)
  writeStorage(USERS_KEY, [...persistedUsers, newUser])
  return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
}

export async function login(email, password) {
  await delay()
  const normalizedEmail = email.trim().toLowerCase()
  const user = getUsers().find(
    (item) => item.email === normalizedEmail && item.password === password,
  )

  if (!user) throw new Error('E-mail ou senha inválidos.')

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    loggedAt: Date.now(),
  }
  writeStorage(SESSION_KEY, session)
  return session
}

export async function logout() {
  await delay(100)
  localStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  return readStorage(SESSION_KEY, null)
}

// Compatibilidade com a estrutura anterior do projeto.
export const loginAdmin = login
export const logoutAdmin = logout
export const getAdminSession = getSession
