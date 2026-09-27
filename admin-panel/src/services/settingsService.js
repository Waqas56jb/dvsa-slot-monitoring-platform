import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap } from '@/lib/service'
import { delay, clone } from '@/lib/mock'
import { recordAdminAction } from '@/lib/mockAudit'

/**
 * Platform settings. Only non-secret, admin-editable values live here.
 * Provider credentials (SMS, email, payments) are configured server-side and
 * surfaced to the UI only as "configured / not configured".
 */
const settings = {
  general: { platformName: 'SlotPilot', supportEmail: 'support@slotpilot.io', timezone: 'Europe/London', currency: 'GBP' },
  monitoring: { defaultInterval: 90, maxActiveJobs: 5000, retentionDays: 90, maxCentresPerJob: 12, pauseOnRepeatedFailures: true },
  notifications: { emailEnabled: true, browserEnabled: true, smsEnabled: true, smsProviderConfigured: true, dailyAlertCap: 50, quietHoursStart: '22:00', quietHoursEnd: '06:30' },
  security: { sessionTimeout: 30, passwordMinLength: 12, requireTwoFactor: true, loginAttemptLimit: 5, lockoutMinutes: 15 },
  platform: { maintenanceMode: false, registrationEnabled: true, monitoringEnabled: true },
}

/** Server-managed values that the UI may display but never write. */
const READ_ONLY_KEYS = { notifications: ['smsProviderConfigured'] }

const mock = {
  async getSettings() { await delay(); return clone(settings) },
  async updateSettings(section, values) {
    await delay(500, 800)
    if (!settings[section]) throw new ApiError('Unknown settings section.', { status: 422 })
    const blocked = READ_ONLY_KEYS[section] || []
    const clean = {}
    for (const [k, v] of Object.entries(values)) {
      if (blocked.includes(k) || !(k in settings[section])) continue
      if (typeof settings[section][k] !== typeof v) throw new ApiError(`Invalid value for ${k}.`, { status: 422, details: { [k]: 'Invalid value.' } })
      clean[k] = v
    }
    const changes = {}
    for (const [k, v] of Object.entries(clean)) if (settings[section][k] !== v) changes[k] = [String(settings[section][k]), String(v)]
    Object.assign(settings[section], clean)
    if (Object.keys(changes).length) recordAdminAction({ action: 'Changed platform setting', resource: 'Settings', resourceId: section, changes, href: '/admin/settings' })
    return clone(settings[section])
  },
}

const api = {
  getSettings: () => apiClient.get('/api/admin/settings').then(unwrap),
  updateSettings: (section, values) => apiClient.patch('/api/admin/settings', { section, values }).then(unwrap),
}

export const settingsService = defineService(mock, api)
