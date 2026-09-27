/**
 * Client-side auth session (who is signed in).
 * "Remember me" keeps the session in localStorage; otherwise sessionStorage.
 * With Supabase, this becomes a thin wrapper around supabase.auth.getSession().
 */
import { storage } from '@/utils/storage';
import { ServiceError } from './mockDb';

const KEY = 'auth';

export function getSession() {
  return storage.getSession(KEY) || storage.get(KEY);
}

export function setSession(session, remember) {
  clearSession();
  if (remember) storage.set(KEY, session);
  else storage.setSession(KEY, session);
}

export function clearSession() {
  storage.remove(KEY);
  storage.removeSession(KEY);
}

export const getAccessToken = () => getSession()?.token ?? null;

export function requireUserId() {
  const s = getSession();
  if (!s?.userId) throw new ServiceError('Your session has expired. Please sign in again.', 'unauthenticated');
  return s.userId;
}
