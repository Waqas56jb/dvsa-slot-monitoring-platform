import { STORAGE_KEYS } from '@/constants/config'

/**
 * Session persistence. "Remember me" → localStorage, otherwise sessionStorage.
 * Only a token + public admin profile are stored — never passwords or secrets.
 */
function safe(fn, fallback = null) {
  try { return fn() } catch { return fallback }
}

export function readSession() {
  const raw = safe(() => localStorage.getItem(STORAGE_KEYS.session)) || safe(() => sessionStorage.getItem(STORAGE_KEYS.session))
  if (!raw) return null
  const s = safe(() => JSON.parse(raw))
  if (!s || (s.expiresAt && s.expiresAt < Date.now())) { clearSession(); return null }
  return s
}

export function writeSession(session, remember) {
  clearSession()
  const store = remember ? localStorage : sessionStorage
  safe(() => store.setItem(STORAGE_KEYS.session, JSON.stringify(session)))
}

export function touchSession(expiresAt) {
  const s = readSession()
  if (!s) return
  const remember = safe(() => !!localStorage.getItem(STORAGE_KEYS.session))
  writeSession({ ...s, expiresAt }, remember)
}

export function clearSession() {
  safe(() => localStorage.removeItem(STORAGE_KEYS.session))
  safe(() => sessionStorage.removeItem(STORAGE_KEYS.session))
}

export const sessionToken = () => readSession()?.token ?? null
export const sessionAdmin = () => readSession()?.admin ?? null
