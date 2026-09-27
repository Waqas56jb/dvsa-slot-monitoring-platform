/**
 * In-app notification centre.
 * Future: GET /notifications?type=  ·  PATCH /notifications/:id  ·  POST /notifications/read-all
 * plus a realtime channel for new notifications.
 */
import { delay, clone, ServiceError } from './mockDb';
import { notificationsTable } from './selectors';
import { requireUserId } from './session';
import { publish } from './realtime';
import { createId } from '@/utils/id';

const sortNewest = (a, b) => b.createdAt.localeCompare(a.createdAt);

/** Internal: create a notification. Used by other services. */
export function pushNotification(ownerId, { type, event, title, message, link = null, meta = {} }) {
  const n = { id: createId('ntf'), ownerId, type, event, title, message, link, meta, read: false, createdAt: new Date().toISOString() };
  notificationsTable.insert(n);
  publish('notifications', n);
  return n;
}

export const notificationService = {
  /** type: 'all' | 'slot' | 'system' | 'learner' */
  async list({ type = 'all', unreadOnly = false } = {}) {
    await delay(160, 360);
    const ownerId = requireUserId();
    return clone(
      notificationsTable
        .all(ownerId)
        .filter((n) => (type === 'all' || n.type === type) && (!unreadOnly || !n.read))
        .sort(sortNewest),
    );
  },

  async latest(limit = 5) {
    await delay(80, 160);
    const ownerId = requireUserId();
    return clone(notificationsTable.all(ownerId).sort(sortNewest).slice(0, limit));
  },

  async unreadCount() {
    const ownerId = requireUserId();
    return notificationsTable.all(ownerId).filter((n) => !n.read).length;
  },

  async markRead(id, read = true) {
    await delay(60, 140);
    const n = notificationsTable.update(id, { read });
    if (!n) throw new ServiceError('Notification not found.', 'not_found');
    publish('notifications', n);
    return clone(n);
  },

  async markAllRead(type = 'all') {
    await delay(150, 300);
    const ownerId = requireUserId();
    const count = notificationsTable.updateWhere(
      (n) => n.ownerId === ownerId && !n.read && (type === 'all' || n.type === type),
      () => ({ read: true }),
    );
    publish('notifications', { bulk: true });
    return count;
  },

  async remove(id) {
    await delay(100, 220);
    notificationsTable.remove(id);
    publish('notifications', { removed: id });
    return true;
  },

  async removeAll(type = 'all') {
    await delay(150, 300);
    const ownerId = requireUserId();
    notificationsTable.removeWhere((n) => n.ownerId === ownerId && (type === 'all' || n.type === type));
    publish('notifications', { bulk: true });
  },
};
