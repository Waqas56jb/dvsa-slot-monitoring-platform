/**
 * Every status string used in the product maps to exactly one tone.
 * StatusBadge reads from here so colours stay consistent everywhere.
 */
const map = {
  // success
  active: 'success', running: 'success', paid: 'success', delivered: 'success', online: 'success',
  completed: 'success', operational: 'success', resolved: 'success', booked: 'success', success: 'success',
  verified: 'success', read: 'success', enabled: 'success',
  // warning
  pending: 'warning', paused: 'warning', waiting: 'warning', degraded: 'warning', queued: 'warning',
  'in progress': 'warning', in_progress: 'warning', past_due: 'warning', high: 'warning', idle: 'warning',
  // danger
  failed: 'danger', suspended: 'danger', disabled: 'danger', down: 'danger', offline: 'danger',
  urgent: 'danger', unavailable: 'danger', denied: 'danger', blocked: 'danger',
  // info / brand
  new: 'brand', matched: 'info', alerted: 'info', sent: 'info', open: 'info', trialing: 'info', invited: 'info',
  // neutral
  viewed: 'neutral', normal: 'neutral', refunded: 'neutral', expired: 'neutral', cancelled: 'neutral',
  closed: 'neutral', inactive: 'neutral', low: 'neutral', unverified: 'neutral',
}

export function toneFor(status) {
  if (!status) return 'neutral'
  return map[String(status).toLowerCase()] || 'neutral'
}

export const USER_STATUSES = ['Active', 'Pending', 'Suspended', 'Disabled']
export const MONITORING_STATUSES = ['Running', 'Paused', 'Completed', 'Expired', 'Failed', 'Cancelled']
export const SLOT_STATUSES = ['New', 'Matched', 'Alerted', 'Viewed', 'Expired', 'Booked', 'Unavailable']
export const ALERT_STATUSES = ['Queued', 'Sent', 'Delivered', 'Failed', 'Read']
export const NOTIFICATION_CHANNELS = ['Browser', 'Email', 'SMS', 'Webhook']
export const SUBSCRIPTION_PLANS = ['Basic', 'Standard', 'Premium']
export const SUBSCRIPTION_STATUSES = ['Active', 'Trialing', 'Past_due', 'Cancelled', 'Expired']
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded']
export const TICKET_STATUSES = ['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed']
export const TICKET_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent']
export const TICKET_CATEGORIES = ['Monitoring', 'Alerts', 'Billing', 'Account', 'Technical', 'Other']
export const SERVICE_STATUSES = ['Operational', 'Degraded', 'Down']
export const CENTRE_STATUSES = ['Active', 'Inactive']
export const REGIONS = ['London', 'South East', 'South West', 'East of England', 'West Midlands', 'East Midlands', 'North West', 'North East', 'Yorkshire', 'Scotland', 'Wales']
export const ACTIVITY_CATEGORIES = ['User', 'Monitoring', 'Slot', 'Notification', 'Payment', 'System', 'Admin']

export const statusLabel = (s) => (s ? String(s).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '—')
