/**
 * Local mock database backed by localStorage.
 *
 * This file is the ONLY place that knows about mock persistence. When the
 * Node.js API is connected, each service swaps its mock calls for `api.*`
 * calls and this module can be deleted.
 */
import { storage } from '@/utils/storage';
import { buildSeedUsers, buildSeedSessions, defaultPreferences, DEMO_USER_ID } from '@/data/users';
import { buildSeedLearners } from '@/data/learners';
import { buildSeedSlots } from '@/data/slots';
import { buildSeedNotifications } from '@/data/notifications';
import { buildSeedMonitoringSessions } from '@/data/monitoringSessions';
import { buildSeedActivity } from '@/data/activityLogs';

const DB_KEY = 'db.v1';

let db = null;

function seed() {
  const now = Date.now();
  return {
    seededAt: new Date(now).toISOString(),
    users: buildSeedUsers(now),
    credentials: {},
    preferences: { [DEMO_USER_ID]: structuredClone(defaultPreferences) },
    authSessions: { [DEMO_USER_ID]: buildSeedSessions() },
    learners: buildSeedLearners(now),
    slots: buildSeedSlots(now),
    notifications: buildSeedNotifications(now),
    monitoringSessions: buildSeedMonitoringSessions(now),
    activity: buildSeedActivity(now),
  };
}

export function getDb() {
  if (!db) {
    db = storage.get(DB_KEY) || seed();
    persist();
  }
  return db;
}

export function persist() {
  storage.set(DB_KEY, db);
}

/** Re-seeds the demo data for one owner, keeping accounts and credentials. */
export function resetOwnerData(ownerId) {
  const fresh = seed();
  const d = getDb();
  for (const col of ['learners', 'slots', 'notifications', 'monitoringSessions', 'activity']) {
    const others = d[col].filter((r) => r.ownerId !== ownerId);
    const seeded = ownerId === DEMO_USER_ID ? fresh[col] : [];
    d[col] = [...seeded, ...others];
  }
  d.preferences[ownerId] = structuredClone(defaultPreferences);
  persist();
}

/** Generic owner-scoped collection helpers. */
export function table(name) {
  return {
    all(ownerId) {
      const rows = getDb()[name];
      return ownerId ? rows.filter((r) => r.ownerId === ownerId) : rows;
    },
    find(id) {
      return getDb()[name].find((r) => r.id === id) || null;
    },
    insert(record) {
      getDb()[name].unshift(record);
      persist();
      return record;
    },
    update(id, patch) {
      const rows = getDb()[name];
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      rows[idx] = { ...rows[idx], ...patch };
      persist();
      return rows[idx];
    },
    updateWhere(predicate, patchFn) {
      const rows = getDb()[name];
      let count = 0;
      rows.forEach((r, i) => {
        if (predicate(r)) {
          rows[i] = { ...r, ...patchFn(r) };
          count++;
        }
      });
      if (count) persist();
      return count;
    },
    remove(id) {
      const d = getDb();
      const before = d[name].length;
      d[name] = d[name].filter((r) => r.id !== id);
      persist();
      return d[name].length !== before;
    },
    removeWhere(predicate) {
      const d = getDb();
      d[name] = d[name].filter((r) => !predicate(r));
      persist();
    },
  };
}

/** Simulated network latency so loading states are visible and realistic. */
export function delay(min = 160, max = 420) {
  const ms = Math.round(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deep copy before returning so callers can't mutate the store. */
export const clone = (v) => (v == null ? v : structuredClone(v));

export class ServiceError extends Error {
  constructor(message, code = 'error', field) {
    super(message);
    this.code = code;
    this.field = field;
  }
}
