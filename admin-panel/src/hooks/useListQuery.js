import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from './useDebounce'
import { DEFAULT_PAGE_SIZE } from '@/constants/config'

/**
 * State + fetching for a server-paginated list page.
 *
 * Filters are kept in the URL (?status=Running&centre=ctr_001) so links such
 * as "Failed jobs" from the dashboard land pre-filtered and are shareable.
 *
 * fetcher({ search, filters, sort, order, page, pageSize }) → { data, total }
 *
 * `filterKeys` lists which URL params are filters. Array filters are stored
 * comma-separated.
 */
export function useListQuery(fetcher, { filterKeys = [], arrayKeys = [], defaultSort, defaultOrder = 'desc', pageSize: initialPageSize = DEFAULT_PAGE_SIZE, extraFilters } = {}) {
  const [params, setParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const search = useDebounce(searchInput)
  const [sort, setSortState] = useState({ key: defaultSort, order: defaultOrder })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [state, setState] = useState({ rows: [], total: 0, loading: true, error: null })
  const callId = useRef(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const filters = useMemo(() => {
    const f = {}
    for (const k of filterKeys) {
      const v = params.get(k)
      if (v == null || v === '') continue
      f[k] = arrayKeys.includes(k) ? v.split(',') : v
    }
    return f
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const setFilter = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0)
      if (empty) next.delete(key)
      else next.set(key, Array.isArray(value) ? value.join(',') : value)
      return next
    }, { replace: true })
    setPage(1)
  }, [setParams])

  /** Update several filters in one URL write (separate setFilter calls in one tick would overwrite each other). */
  const setFilters = useCallback((patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(patch)) {
        const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0)
        if (empty) next.delete(key)
        else next.set(key, Array.isArray(value) ? value.join(',') : value)
      }
      return next
    }, { replace: true })
    setPage(1)
  }, [setParams])

  // Follow external ?search= changes (e.g. clicking a link to the same page with a new search).
  // Only react when the URL diverges from what this hook itself last wrote (the debounced value).
  const urlSearch = params.get('search') || ''
  const writtenSearch = useRef(search)
  writtenSearch.current = search
  useEffect(() => {
    if (urlSearch !== writtenSearch.current) setSearchInput(urlSearch)
  }, [urlSearch])

  const resetFilters = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      filterKeys.forEach((k) => next.delete(k))
      next.delete('search')
      return next
    }, { replace: true })
    setSearchInput('')
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setParams])

  // keep ?search= in sync (debounced)
  useEffect(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (search) next.set('search', search)
      else next.delete('search')
      return next.toString() === prev.toString() ? prev : next
    }, { replace: true })
    setPage(1)
  }, [search, setParams])

  const setSort = useCallback((key) => {
    setSortState((s) => (s.key === key ? { key, order: s.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' }))
    setPage(1)
  }, [])

  // extraFilters: plain serialisable values (e.g. a tab) — compared by value to avoid refetch loops.
  const extraKey = JSON.stringify(extraFilters || {})
  const query = useMemo(
    () => ({ search, filters: { ...filters, ...JSON.parse(extraKey) }, sort: sort.key, order: sort.order, page, pageSize }),
    [search, filters, extraKey, sort, page, pageSize],
  )

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++callId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetcherRef.current(query)
      if (id === callId.current) setState({ rows: res.data, total: res.total, loading: false, error: null })
    } catch (error) {
      if (id === callId.current) setState((s) => ({ ...s, loading: false, error }))
    }
  }, [query])

  useEffect(() => { load() }, [load])

  const activeFilterCount = Object.keys(filters).length + (search ? 1 : 0)

  return {
    ...state,
    query,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    setFilters,
    resetFilters,
    activeFilterCount,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize: (n) => { setPageSize(n); setPage(1) },
    reload: load,
    /** Optimistically patch a row in place (after a mutation). */
    patchRow: (id, patch) => setState((s) => ({ ...s, rows: s.rows.map((r) => (r.id === id ? { ...r, ...(typeof patch === 'function' ? patch(r) : patch) } : r)) })),
  }
}
