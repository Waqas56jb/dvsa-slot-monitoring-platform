/**
 * Helpers shared by mock data generators and mock service implementations.
 * Nothing here ships to production once VITE_USE_MOCKS=false.
 */
import { ApiError } from './apiClient'

/** Deterministic PRNG so mock data is stable between reloads. */
export function createRandom(seed = 1) {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min, max) => Math.floor(next() * (max - min + 1)) + min
  const pick = (arr) => arr[Math.floor(next() * arr.length)]
  /** weighted pick: [[value, weight], ...] */
  const weighted = (pairs) => {
    const total = pairs.reduce((a, [, w]) => a + w, 0)
    let r = next() * total
    for (const [v, w] of pairs) { if ((r -= w) <= 0) return v }
    return pairs[pairs.length - 1][0]
  }
  const sample = (arr, n) => {
    const copy = [...arr]
    const out = []
    while (out.length < n && copy.length) out.push(copy.splice(Math.floor(next() * copy.length), 1)[0])
    return out
  }
  const chance = (p) => next() < p
  return { next, int, pick, weighted, sample, chance }
}

// Anchor "now" once so relative mock timestamps line up across modules.
export const NOW = Date.now()
export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const ago = (ms) => new Date(NOW - ms).toISOString()
export const ahead = (ms) => new Date(NOW + ms).toISOString()

export const pad = (n, len = 4) => String(n).padStart(len, '0')

/** Simulated network latency. */
export function delay(min = 220, max = 520) {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)))
}

export const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)))

export function notFound(entity, id) {
  return new ApiError(`${entity} ${id} was not found.`, { status: 404, code: 'NOT_FOUND' })
}

/** Wraps a list result in the same `{ data, meta }` envelope apiClient returns. */
export const listResponse = ({ data, total, page, pageSize }) => ({ data: clone(data), meta: { total, page, pageSize } })
export const itemResponse = (data) => ({ data: clone(data), meta: {} })
