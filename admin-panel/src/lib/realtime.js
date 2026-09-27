/**
 * Minimal pub/sub used for "live" UI. In mock mode the RealtimeContext pumps
 * simulated events through here; later the same channel names can be fed by
 * Supabase Realtime subscriptions or a server-sent-events stream.
 *
 * Channels: 'activity', 'slot', 'notification', 'heartbeat', 'stats', 'audit', 'system'
 */
const listeners = new Map()

export const realtime = {
  subscribe(channel, cb) {
    if (!listeners.has(channel)) listeners.set(channel, new Set())
    listeners.get(channel).add(cb)
    return () => listeners.get(channel)?.delete(cb)
  },
  publish(channel, payload) {
    listeners.get(channel)?.forEach((cb) => {
      try { cb(payload) } catch (e) { console.error(`[realtime:${channel}]`, e) }
    })
  },
}
