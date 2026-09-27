import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async loader and tracks { data, error, loading }.
 * Stale responses from earlier calls are ignored.
 */
export function useAsync(loader, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, loading: immediate })
  const callId = useRef(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++callId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await loaderRef.current()
      if (id === callId.current) setState({ data, error: null, loading: false })
      return data
    } catch (error) {
      if (id === callId.current) setState((s) => ({ ...s, error, loading: false }))
      return undefined
    }
  }, [])

  useEffect(() => {
    if (immediate) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), [])

  return { ...state, reload: run, setData }
}
