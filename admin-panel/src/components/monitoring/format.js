/** Monitoring-specific display helpers. */

/** 90 → "Every 90s", 120 → "Every 2m", 300 → "Every 5m" */
export function formatFrequency(seconds) {
  if (!seconds) return '—'
  if (seconds < 120 || seconds % 60) return `Every ${seconds}s`
  return `Every ${seconds / 60}m`
}

export const FREQUENCY_OPTIONS = [60, 90, 120, 180, 300].map((s) => ({ value: String(s), label: formatFrequency(s) }))

/** Countdown text for a job's next scheduled check. */
export function formatCountdown(target, now = Date.now()) {
  if (!target) return '—'
  const s = Math.round((new Date(target).getTime() - now) / 1000)
  if (s <= 0) return 'Due now'
  if (s < 60) return `in ${s}s`
  const m = Math.floor(s / 60)
  return `in ${m}m ${String(s % 60).padStart(2, '0')}s`
}

/** Inclusive day count between two YYYY-MM-DD dates. */
export function daysBetween(from, to) {
  if (!from || !to) return null
  return Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000) + 1
}

/** Minutes between two HH:MM strings. */
export function minutesBetween(from, to) {
  if (!from || !to) return null
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  return th * 60 + tm - (fh * 60 + fm)
}
