/**
 * Minimal pub/sub channel used to push data changes to the UI.
 * Today it is fed by the mock services; later it can be backed by
 * Supabase Realtime or a WebSocket from the Node.js API without the
 * components changing.
 *
 * Topics: 'learners' | 'slots' | 'notifications' | 'monitoring' | 'activity' | 'user'
 */
const listeners = new Map();

export function subscribe(topics, fn) {
  const list = Array.isArray(topics) ? topics : [topics];
  list.forEach((t) => {
    if (!listeners.has(t)) listeners.set(t, new Set());
    listeners.get(t).add(fn);
  });
  return () => list.forEach((t) => listeners.get(t)?.delete(fn));
}

export function publish(topic, payload) {
  listeners.get(topic)?.forEach((fn) => {
    try {
      fn(payload, topic);
    } catch {
      /* a failing listener must not break others */
    }
  });
}
