import { useEffect, useRef, useState } from 'react'
import { useRealtime } from '@/hooks/useUtils'

const HIGHLIGHT_MS = 8000

/**
 * Keeps a useListQuery list in step with a realtime channel.
 *  - live + first page + newest-first → silently refetch and flag the new ids
 *  - otherwise → count pending events; `showPending()` jumps back to the top
 * Refetching (rather than splicing rows in) keeps filters/search/paging correct.
 */
export function useLiveList(list, channel, { enabled = true, sortKey = 'timestamp' } = {}) {
  const [fresh, setFresh] = useState(() => new Set())
  const [pending, setPending] = useState(0)
  const timers = useRef([])
  const atTop = list.page === 1 && list.sort.key === sortKey && list.sort.order === 'desc'

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { if (enabled && atTop) setPending(0) }, [enabled, atTop])

  useRealtime(channel, (item) => {
    if (!enabled || !atTop) { setPending((n) => n + 1); return }
    list.reload({ silent: true })
    if (!item?.id) return
    setFresh((s) => new Set(s).add(item.id))
    timers.current.push(setTimeout(() => setFresh((s) => { const n = new Set(s); n.delete(item.id); return n }), HIGHLIGHT_MS))
  })

  const showPending = () => {
    setPending(0)
    if (list.page !== 1) list.setPage(1)
    else list.reload({ silent: true })
  }

  return { fresh, pending, showPending }
}
