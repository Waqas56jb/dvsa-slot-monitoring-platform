/** Badge tone per plan (consistent across subscription + payment pages). */
export const PLAN_TONE = { Premium: 'brand', Standard: 'info', Basic: 'neutral' }

/** Cancelled / expired subscriptions accept no further admin actions. */
export const isEnded = (s) => ['Cancelled', 'Expired'].includes(s?.status)
