import { CURRENCY, LOCALE, TIMEZONE } from '@/constants/config'

// All date/time formatting goes through here so timezone policy lives in one place.
const toDate = (v) => (v instanceof Date ? v : v ? new Date(v) : null)
const valid = (d) => d && !Number.isNaN(d.getTime())

// Month names are fixed ("Sep", not the ICU "Sept") so output is identical across browsers.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const partsFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: TIMEZONE })
const ukParts = (d) => Object.fromEntries(partsFmt.formatToParts(d).filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)]))
const dateFmt = { format: (d) => { const p = ukParts(d); return `${p.day} ${MONTHS[p.month - 1]} ${p.year}` } }
const shortDateFmt = { format: (d) => { const p = ukParts(d); return `${p.day} ${MONTHS[p.month - 1]}` } }
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIMEZONE })
const timeSecFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: TIMEZONE })
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', timeZone: TIMEZONE })

/** 27 Sep 2026 */
export const formatDate = (v) => { const d = toDate(v); return valid(d) ? dateFmt.format(d) : '—' }
/** 27 Sep */
export const formatShortDate = (v) => { const d = toDate(v); return valid(d) ? shortDateFmt.format(d) : '—' }
/** 19:42 */
export const formatTime = (v) => { const d = toDate(v); return valid(d) ? timeFmt.format(d) : '—' }
/** 19:42:31 */
export const formatTimeSeconds = (v) => { const d = toDate(v); return valid(d) ? timeSecFmt.format(d) : '—' }
/** 27 Sep 2026, 19:42 */
export const formatDateTime = (v) => { const d = toDate(v); return valid(d) ? `${dateFmt.format(d)}, ${timeFmt.format(d)}` : '—' }
/** Sat 27 Sep */
export const formatDayDate = (v) => { const d = toDate(v); return valid(d) ? `${weekdayFmt.format(d)} ${shortDateFmt.format(d)}` : '—' }

export function formatRelative(v, now = Date.now()) {
  const d = toDate(v)
  if (!valid(d)) return '—'
  const s = Math.round((now - d.getTime()) / 1000)
  const future = s < 0
  const a = Math.abs(s)
  let out
  if (a < 5) return 'just now'
  if (a < 60) out = `${a}s`
  else if (a < 3600) out = `${Math.floor(a / 60)}m`
  else if (a < 86400) out = `${Math.floor(a / 3600)}h`
  else if (a < 86400 * 30) out = `${Math.floor(a / 86400)}d`
  else return formatDate(d)
  return future ? `in ${out}` : `${out} ago`
}

const numFmt = new Intl.NumberFormat(LOCALE)
const compactFmt = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
export const formatNumber = (n) => (n == null || Number.isNaN(n) ? '—' : numFmt.format(n))
export const formatCompact = (n) => (n == null ? '—' : compactFmt.format(n))
export const formatPercent = (n, digits = 1) => (n == null ? '—' : `${Number(n).toFixed(digits)}%`)
export const formatDelta = (n, digits = 1) => (n == null ? '' : `${n > 0 ? '+' : ''}${Number(n).toFixed(digits)}%`)

export function formatCurrency(amount, currency = CURRENCY) {
  if (amount == null) return '—'
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function formatDuration(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return `${Math.round(ms)} ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)} s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'

/** Masks all but the last `visible` chars. */
export function maskValue(value, visible = 3) {
  if (!value) return '—'
  const s = String(value)
  if (s.length <= visible) return '•'.repeat(s.length)
  return '•'.repeat(Math.max(4, s.length - visible)) + s.slice(-visible)
}

export function maskEmail(email) {
  if (!email) return '—'
  const [u, d] = email.split('@')
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(2, u.length - 2))}@${d}`
}

export function maskPhone(phone) {
  if (!phone) return '—'
  const digits = phone.replace(/\s/g, '')
  return `${digits.slice(0, 3)} ••• ••• ${digits.slice(-3)}`
}

export const pluralize = (n, one, many = `${one}s`) => `${formatNumber(n)} ${n === 1 ? one : many}`
