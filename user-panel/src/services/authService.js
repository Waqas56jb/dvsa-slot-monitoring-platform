/**
 * Authentication service (mock).
 *
 * Future implementation: Supabase Auth on the client for sign-in/sign-up,
 * with the Node.js API validating the Supabase JWT on every request.
 *   login        → supabase.auth.signInWithPassword
 *   register     → supabase.auth.signUp + POST /users (profile)
 *   logout       → supabase.auth.signOut
 *   resetPassword→ supabase.auth.resetPasswordForEmail / updateUser
 */
import { getDb, persist, table, delay, clone, ServiceError } from './mockDb';
import { getSession, setSession, clearSession, requireUserId } from './session';
import { createId } from '@/utils/id';
import { DEMO_CREDENTIALS } from '@/config/app';
import { DEMO_USER_ID, defaultPreferences } from '@/data/users';

const users = table('users');

/** One-way hash so the mock never keeps plain-text passwords. */
async function hash(value) {
  const text = `slotpilot:${value}`;
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `fallback-${h}`;
}

async function ensureDemoCredentials() {
  const db = getDb();
  if (!db.credentials[DEMO_USER_ID]) {
    db.credentials[DEMO_USER_ID] = await hash(DEMO_CREDENTIALS.password);
    persist();
  }
}

const findByEmail = (email) =>
  users.all().find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

function startSession(user, remember) {
  const session = { userId: user.id, token: createId('tok'), issuedAt: new Date().toISOString() };
  setSession(session, remember);
  return session;
}

export const authService = {
  async login({ email, password, remember = true }) {
    await ensureDemoCredentials();
    await delay(500, 900);
    const user = findByEmail(email);
    if (!user || getDb().credentials[user.id] !== (await hash(password))) {
      throw new ServiceError('The email or password you entered is incorrect.', 'invalid_credentials');
    }
    startSession(user, remember);
    return clone(user);
  },

  async register({ firstName, lastName, email, phone, password }) {
    await delay(600, 1000);
    if (findByEmail(email)) {
      throw new ServiceError('An account with this email already exists.', 'email_taken', 'email');
    }
    const user = {
      id: createId('usr'),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      businessName: '',
      role: '',
      usageType: '',
      avatarUrl: '',
      plan: 'starter',
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    };
    const db = getDb();
    users.insert(user);
    db.credentials[user.id] = await hash(password);
    db.preferences[user.id] = structuredClone(defaultPreferences);
    db.preferences[user.id].monitoring.preferredCentreIds = [];
    db.authSessions[user.id] = [
      { id: createId('ses'), device: 'This browser', location: 'United Kingdom', current: true, lastActiveAt: new Date().toISOString() },
    ];
    persist();
    startSession(user, true);
    return clone(user);
  },

  async logout() {
    await delay(120, 220);
    clearSession();
  },

  /** Returns the signed-in user or null. */
  async getCurrentUser() {
    const session = getSession();
    if (!session?.userId) return null;
    const user = users.find(session.userId);
    if (!user) {
      clearSession();
      return null;
    }
    return clone(user);
  },

  async requestPasswordReset(email) {
    await delay(600, 900);
    // Always succeed so the UI doesn't reveal which emails are registered.
    return { sent: true, email };
  },

  async resetPassword({ email, password }) {
    await delay(600, 900);
    const user = findByEmail(email);
    if (user) {
      getDb().credentials[user.id] = await hash(password);
      persist();
    }
    return { reset: true };
  },

  async changePassword({ currentPassword, newPassword }) {
    await ensureDemoCredentials();
    await delay(500, 800);
    const userId = requireUserId();
    const db = getDb();
    if (db.credentials[userId] !== (await hash(currentPassword))) {
      throw new ServiceError('Your current password is incorrect.', 'invalid_password', 'currentPassword');
    }
    db.credentials[userId] = await hash(newPassword);
    persist();
    return { changed: true };
  },

  /** Google OAuth will be handled by Supabase once the backend is connected. */
  async signInWithGoogle() {
    await delay(300, 500);
    throw new ServiceError('Google sign-in will be available once the backend is connected.', 'not_configured');
  },
};
