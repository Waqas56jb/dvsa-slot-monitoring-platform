export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SlotPilot'
export const APP_TAGLINE = 'Driving Test Monitoring, Built for Speed.'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
// Mock mode is on unless explicitly disabled AND an API base URL is configured.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false' || !API_BASE_URL

export const TIMEZONE = 'Europe/London'
export const LOCALE = 'en-GB'
export const CURRENCY = 'GBP'

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50]
export const SEARCH_DEBOUNCE_MS = 250

export const SESSION_TIMEOUT_MINUTES = 30
export const SESSION_WARNING_SECONDS = 60

export const STORAGE_KEYS = {
  session: 'slotpilot.admin.session',
  theme: 'slotpilot.theme',
  sidebar: 'slotpilot.sidebar.collapsed',
  dismissedBanner: 'slotpilot.banner.dismissed',
  mockDb: 'slotpilot.mock.overrides',
}
