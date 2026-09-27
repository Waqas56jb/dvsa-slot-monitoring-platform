/**
 * HTTP client for the future Node.js / Express API.
 *
 * Not used while `USE_MOCK_API` is true. When the backend is ready, services
 * replace their mock implementations with calls such as:
 *
 *   const learners = await api.get('/learners', { search });
 *
 * Only the user's short-lived access token is sent — never secrets.
 */
import { env } from '@/config/app';
import { getAccessToken } from './session';

async function request(method, path, { body, query, signal } = {}) {
  const url = new URL(path.replace(/^\//, ''), env.apiBaseUrl.replace(/\/?$/, '/'));
  if (query) {
    Object.entries(query).forEach(([k, v]) => v !== undefined && v !== '' && url.searchParams.set(k, v));
  }
  const token = getAccessToken();
  const res = await fetch(url, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, query, opts) => request('GET', path, { query, ...opts }),
  post: (path, body, opts) => request('POST', path, { body, ...opts }),
  patch: (path, body, opts) => request('PATCH', path, { body, ...opts }),
  put: (path, body, opts) => request('PUT', path, { body, ...opts }),
  delete: (path, opts) => request('DELETE', path, opts),
};
