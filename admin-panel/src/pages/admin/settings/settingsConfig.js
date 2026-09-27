import { Bell, Gauge, Power, Settings2, ShieldCheck } from 'lucide-react'

export const SECTIONS = [
  { key: 'general', label: 'General', icon: Settings2, description: 'Platform identity and regional defaults.' },
  { key: 'monitoring', label: 'Monitoring', icon: Gauge, description: 'Defaults and limits for slot monitoring jobs.' },
  { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert channels, volume limits and quiet hours.' },
  { key: 'security', label: 'Security', icon: ShieldCheck, description: 'Admin sessions, passwords and sign-in protection.' },
  { key: 'platform', label: 'Platform', icon: Power, description: 'Platform-wide switches. Changes take effect immediately.' },
]

/** Values the server manages; shown in the UI but never sent back. */
export const READ_ONLY_KEYS = { notifications: ['smsProviderConfigured'] }

export const TIMEZONES = [
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Europe/Dublin (GMT/IST)' },
  { value: 'UTC', label: 'UTC' },
]
export const CURRENCIES = [
  { value: 'GBP', label: 'GBP — Pound sterling (£)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'USD', label: 'USD — US dollar ($)' },
]
export const INTERVALS = [60, 90, 120, 180].map((s) => ({ value: String(s), label: `Every ${s} seconds` }))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const intIn = (v, min, max) => Number.isInteger(v) && v >= min && v <= max
const rangeMsg = (min, max, unit = '') => `Enter a whole number between ${min} and ${max}${unit}.`

/** Validators receive coerced values and return { field: message }. */
export const VALIDATORS = {
  general: (v) => {
    const e = {}
    const name = String(v.platformName || '').trim()
    if (name.length < 2 || name.length > 40) e.platformName = 'Use between 2 and 40 characters.'
    if (!EMAIL_RE.test(String(v.supportEmail || '').trim())) e.supportEmail = 'Enter a valid email address.'
    if (!TIMEZONES.some((t) => t.value === v.timezone)) e.timezone = 'Choose a timezone.'
    if (!CURRENCIES.some((c) => c.value === v.currency)) e.currency = 'Choose a currency.'
    return e
  },
  monitoring: (v) => {
    const e = {}
    if (![60, 90, 120, 180].includes(v.defaultInterval)) e.defaultInterval = 'Choose a check interval.'
    if (!intIn(v.maxActiveJobs, 1, 100000)) e.maxActiveJobs = rangeMsg(1, '100,000')
    if (!intIn(v.retentionDays, 7, 730)) e.retentionDays = rangeMsg(7, 730, ' days')
    if (!intIn(v.maxCentresPerJob, 1, 50)) e.maxCentresPerJob = rangeMsg(1, 50)
    return e
  },
  notifications: (v) => {
    const e = {}
    if (!v.emailEnabled && !v.browserEnabled && !v.smsEnabled) e.channels = 'Keep at least one alert channel enabled.'
    if (!intIn(v.dailyAlertCap, 1, 500)) e.dailyAlertCap = rangeMsg(1, 500)
    if (!TIME_RE.test(v.quietHoursStart || '')) e.quietHoursStart = 'Enter a time, e.g. 22:00.'
    if (!TIME_RE.test(v.quietHoursEnd || '')) e.quietHoursEnd = 'Enter a time, e.g. 06:30.'
    if (!e.quietHoursStart && !e.quietHoursEnd && v.quietHoursStart === v.quietHoursEnd) e.quietHoursEnd = 'End time must differ from start time.'
    return e
  },
  security: (v) => {
    const e = {}
    if (!intIn(v.sessionTimeout, 5, 480)) e.sessionTimeout = rangeMsg(5, 480, ' minutes')
    if (!intIn(v.passwordMinLength, 8, 128)) e.passwordMinLength = rangeMsg(8, 128, ' characters')
    if (!intIn(v.loginAttemptLimit, 3, 20)) e.loginAttemptLimit = rangeMsg(3, 20)
    if (!intIn(v.lockoutMinutes, 1, 1440)) e.lockoutMinutes = rangeMsg(1, 1440, ' minutes')
    return e
  },
  platform: () => ({}),
}
