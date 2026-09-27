import { useCallback, useEffect, useRef, useState } from 'react'
import { realtime } from '@/lib/realtime'

export function useDisclosure(initial = false) {
  const [isOpen, setOpen] = useState(initial)
  return { isOpen, open: useCallback(() => setOpen(true), []), close: useCallback(() => setOpen(false), []), toggle: useCallback(() => setOpen((v) => !v), []), setOpen }
}

export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatches(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsMobile = () => !useMediaQuery('(min-width: 768px)')

export function useInterval(cb, ms) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (ms == null) return
    const t = setInterval(() => ref.current(), ms)
    return () => clearInterval(t)
  }, [ms])
}

/** Re-renders every `ms` so relative timestamps ("12s ago") stay fresh. */
export function useNow(ms = 15000) {
  const [now, setNow] = useState(Date.now())
  useInterval(() => setNow(Date.now()), ms)
  return now
}

/** Keyboard shortcut, e.g. useHotkey('mod+k', handler). `mod` = Ctrl or ⌘. */
export function useHotkey(combo, handler, { enabled = true } = {}) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    if (!enabled) return
    const parts = combo.toLowerCase().split('+')
    const key = parts.pop()
    const needMod = parts.includes('mod')
    const needShift = parts.includes('shift')
    const onKey = (e) => {
      if (e.key?.toLowerCase() !== key) return
      if (needMod !== (e.ctrlKey || e.metaKey)) return
      if (needShift !== e.shiftKey) return
      e.preventDefault()
      ref.current(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [combo, enabled])
}

export function useRealtime(channel, cb) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => realtime.subscribe(channel, (p) => ref.current(p)), [channel])
}

export function useClickOutside(refs, handler, enabled = true) {
  const cbRef = useRef(handler)
  cbRef.current = handler
  useEffect(() => {
    if (!enabled) return
    const list = Array.isArray(refs) ? refs : [refs]
    const on = (e) => {
      if (list.some((r) => r.current && r.current.contains(e.target))) return
      cbRef.current(e)
    }
    document.addEventListener('mousedown', on)
    document.addEventListener('touchstart', on)
    return () => { document.removeEventListener('mousedown', on); document.removeEventListener('touchstart', on) }
  }, [refs, enabled])
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v == null ? initial : JSON.parse(v) } catch { return initial }
  })
  const set = useCallback((v) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* storage unavailable */ }
      return next
    })
  }, [key])
  return [value, set]
}

export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} · SlotPilot Admin` : 'SlotPilot Admin'
    return () => { document.title = prev }
  }, [title])
}
