/**
 * Profile, preferences, onboarding and account sessions.
 * Future: GET/PATCH /me · GET/PATCH /me/preferences · POST /me/onboarding
 *         GET /me/sessions · DELETE /me/sessions/:id
 */
import { getDb, persist, table, delay, clone, resetOwnerData, ServiceError } from './mockDb';
import { requireUserId } from './session';
import { publish } from './realtime';
import { learnerService } from './learnerService';
import { monitoringService } from './monitoringService';
import { defaultPreferences } from '@/data/users';

const users = table('users');
const PROFILE_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'businessName', 'role', 'avatarUrl', 'usageType'];
const MAX_AVATAR_BYTES = 1024 * 1024;

export const userService = {
  async getProfile() {
    await delay(120, 260);
    return clone(users.find(requireUserId()));
  },

  async updateProfile(data) {
    await delay(450, 750);
    const userId = requireUserId();
    if (data.email) {
      const taken = users.all().some((u) => u.id !== userId && u.email.toLowerCase() === data.email.trim().toLowerCase());
      if (taken) throw new ServiceError('Another account already uses this email.', 'email_taken', 'email');
    }
    const patch = {};
    PROFILE_FIELDS.forEach((k) => {
      if (data[k] !== undefined) patch[k] = typeof data[k] === 'string' ? data[k].trim() : data[k];
    });
    const updated = users.update(userId, patch);
    publish('user', updated);
    return clone(updated);
  },

  /** Reads an image file into a data URL (mock). The backend will store it in object storage. */
  async readAvatar(file) {
    if (!file?.type?.startsWith('image/')) throw new ServiceError('Choose an image file (JPG, PNG or WebP).', 'invalid_file');
    if (file.size > MAX_AVATAR_BYTES) throw new ServiceError('Images must be 1 MB or smaller.', 'file_too_large');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new ServiceError('That image could not be read.', 'invalid_file'));
      reader.readAsDataURL(file);
    });
  },

  async getPreferences() {
    await delay(100, 220);
    const userId = requireUserId();
    return clone(getDb().preferences[userId] || defaultPreferences);
  },

  /** section: 'notifications' | 'monitoring' | 'appearance' */
  async updatePreferences(section, patch) {
    await delay(200, 400);
    const userId = requireUserId();
    const db = getDb();
    const current = db.preferences[userId] || structuredClone(defaultPreferences);
    db.preferences[userId] = { ...current, [section]: { ...current[section], ...patch } };
    persist();
    publish('user', { preferences: true });
    return clone(db.preferences[userId]);
  },

  /** Synchronous read for the live alert engine. */
  getPreferencesSync() {
    try {
      return clone(getDb().preferences[requireUserId()] || defaultPreferences);
    } catch {
      return clone(defaultPreferences);
    }
  },

  /**
   * data: { usageType, businessName, learner: {...}, centreIds, dateFrom, dateTo, timeFrom, timeTo, notifications, startMonitoring }
   */
  async completeOnboarding(data) {
    await delay(400, 700);
    const userId = requireUserId();
    users.update(userId, { usageType: data.usageType, businessName: data.businessName || '', onboardingComplete: true });
    const db = getDb();
    db.preferences[userId] = {
      ...(db.preferences[userId] || structuredClone(defaultPreferences)),
      notifications: { ...defaultPreferences.notifications, ...data.notifications },
      monitoring: { ...defaultPreferences.monitoring, preferredCentreIds: data.centreIds },
    };
    persist();

    let learner = null;
    if (data.learner) {
      learner = await learnerService.create({
        ...data.learner,
        centreIds: data.centreIds,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        preferredDate: data.dateFrom,
        timeFrom: data.timeFrom,
        timeTo: data.timeTo,
        notifications: { browser: data.notifications.browser, sound: data.notifications.sound, email: data.notifications.email },
      });
      if (data.startMonitoring) {
        await monitoringService.createSession({
          learnerIds: [learner.id],
          notify: data.notifications,
          start: true,
        });
      }
    }
    const user = users.find(userId);
    publish('user', user);
    return { user: clone(user), learner };
  },

  async listSessions() {
    await delay(150, 300);
    return clone(getDb().authSessions[requireUserId()] || []);
  },

  async revokeSession(id) {
    await delay(250, 450);
    const userId = requireUserId();
    const db = getDb();
    db.authSessions[userId] = (db.authSessions[userId] || []).filter((s) => s.id !== id || s.current);
    persist();
    return clone(db.authSessions[userId]);
  },

  async resetDemoData() {
    await delay(400, 700);
    resetOwnerData(requireUserId());
    ['learners', 'slots', 'notifications', 'monitoring', 'activity', 'user'].forEach((t) => publish(t));
    return true;
  },
};
