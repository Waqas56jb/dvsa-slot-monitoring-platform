import { useMemo, useState } from 'react'
import { ArrowLeft, SearchX } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/common/States'
import { Button } from '@/components/common/Button'

/**
 * Client-side pagination for related-record tables embedded in detail pages.
 * Returns props that can be spread straight into <DataTable />.
 */
export function useClientPage(rows = [], initialPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pages)
  const slice = useMemo(() => rows.slice((current - 1) * pageSize, current * pageSize), [rows, current, pageSize])
  const paged = total > initialPageSize
  return {
    rows: slice,
    ...(paged ? {
      total,
      page: current,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: (n) => { setPageSize(n); setPage(1) },
    } : {}),
  }
}

/** Newest-first copy of a list by a date field. */
export const byNewest = (rows = [], key) => [...rows].sort((a, b) => new Date(b[key]) - new Date(a[key]))

/** Error card for detail pages; distinguishes 404s from transient failures. */
export function DetailError({ error, entity, onRetry, backTo, backLabel }) {
  if (error?.status === 404) {
    return (
      <div className="card">
        <EmptyState
          icon={SearchX}
          title={`${entity} not found`}
          description={`This ${entity.toLowerCase()} may have been removed, or the link is incorrect.`}
          action={backTo && <Button variant="primary" icon={ArrowLeft} to={backTo}>{backLabel}</Button>}
        />
      </div>
    )
  }
  return (
    <div className="card">
      <ErrorState
        title={`Unable to load this ${entity.toLowerCase()}.`}
        message={error?.message || 'Please check your connection and try again.'}
        onRetry={onRetry}
        showBack
      />
    </div>
  )
}
