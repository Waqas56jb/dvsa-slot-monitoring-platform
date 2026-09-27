/**
 * Generic list query applied by mock services — mirrors the query params the
 * real API will accept: ?search=&sort=&order=&page=&pageSize=&<filter>=
 */
export function applyListQuery(items, { search, searchFields = [], filters = {}, sort, order = 'desc', page = 1, pageSize = 10 } = {}) {
  let rows = items
  if (search) {
    const q = search.trim().toLowerCase()
    rows = rows.filter((r) => searchFields.some((f) => String(get(r, f) ?? '').toLowerCase().includes(q)))
  }
  for (const [key, val] of Object.entries(filters)) {
    if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) continue
    if (typeof val === 'function') { rows = rows.filter(val); continue }
    const set = (Array.isArray(val) ? val : [val]).map((v) => String(v).toLowerCase())
    rows = rows.filter((r) => {
      const v = get(r, key)
      if (Array.isArray(v)) return v.some((x) => set.includes(String(x).toLowerCase()))
      return set.includes(String(v).toLowerCase())
    })
  }
  if (sort) {
    const dir = order === 'asc' ? 1 : -1
    rows = [...rows].sort((a, b) => {
      const av = get(a, sort), bv = get(b, sort)
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv), 'en-GB', { numeric: true }) * dir
    })
  }
  const total = rows.length
  const start = (page - 1) * pageSize
  return { data: rows.slice(start, start + pageSize), total, page, pageSize, all: rows }
}

export function get(obj, path) {
  if (!path) return undefined
  return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
}

/** Predicate helper for "within last N days" filters. */
export const withinDays = (days) => (days ? (dateValue) => Date.now() - new Date(dateValue).getTime() <= days * 86400000 : () => true)
