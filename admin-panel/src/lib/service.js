import { USE_MOCKS } from '@/constants/config'

/**
 * Every service exports the same method names for both implementations.
 * Components import the service and never know which one is active.
 *
 * Return conventions (shared by mock + API):
 *   list methods  → { data: Row[], total, page, pageSize }
 *   get methods   → Entity (with related records embedded)
 *   mutations     → updated Entity
 */
export function defineService(mockImpl, apiImpl) {
  return USE_MOCKS ? mockImpl : apiImpl
}

/** Converts apiClient's `{ data, meta }` envelope to the list convention. */
export const unwrapList = ({ data, meta }) => ({ data, total: meta?.total ?? data.length, page: meta?.page ?? 1, pageSize: meta?.pageSize ?? data.length })
export const unwrap = ({ data }) => data

/** Serialises the UI's list query into API query params. */
export function toParams({ search, filters = {}, sort, order, page, pageSize } = {}) {
  const params = { search, sort, order, page, pageSize }
  for (const [k, v] of Object.entries(filters)) if (typeof v !== 'function') params[k] = v
  return params
}
