import { API_BASE_URL } from '@/constants/config'

/**
 * Thin fetch wrapper for the future Node/Express admin API.
 *
 * - Base URL comes from VITE_API_BASE_URL (never hardcoded).
 * - Bearer token is supplied by the auth layer via setAuthTokenProvider().
 * - All responses are normalised to `{ data, meta }`; all failures throw ApiError.
 *
 * No secrets live here. Service-role keys and provider credentials belong on the server.
 */

const DEFAULT_TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

let tokenProvider = () => null
let unauthorizedHandler = () => {}

export function setAuthTokenProvider(fn) { tokenProvider = fn }
export function setUnauthorizedHandler(fn) { unauthorizedHandler = fn }

function buildUrl(path, params) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v == null || v === '') continue
      if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item))
      else url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

function normalise(body) {
  if (body && typeof body === 'object' && 'data' in body) return { data: body.data, meta: body.meta ?? {} }
  return { data: body, meta: {} }
}

async function request(method, path, { params, body, timeout = DEFAULT_TIMEOUT_MS, headers = {}, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeout)
  if (signal) signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })

  const token = tokenProvider()
  const init = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    signal: controller.signal,
    credentials: 'include',
  }

  let res
  try {
    res = await fetch(buildUrl(path, params), init)
  } catch (err) {
    clearTimeout(timer)
    if (err?.name === 'TimeoutError' || controller.signal.reason?.name === 'TimeoutError') {
      throw new ApiError('The request timed out. Please try again.', { code: 'TIMEOUT' })
    }
    if (err?.name === 'AbortError') throw new ApiError('Request cancelled.', { code: 'ABORTED' })
    throw new ApiError('Network error — check your connection and try again.', { code: 'NETWORK' })
  }
  clearTimeout(timer)

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = res.status === 204 ? null : isJson ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    if (res.status === 401) unauthorizedHandler()
    const message = (payload && (payload.error?.message || payload.message)) || `Request failed (${res.status})`
    throw new ApiError(message, { status: res.status, code: payload?.error?.code || `HTTP_${res.status}`, details: payload?.error?.details })
  }
  return normalise(payload)
}

export const apiClient = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
}
