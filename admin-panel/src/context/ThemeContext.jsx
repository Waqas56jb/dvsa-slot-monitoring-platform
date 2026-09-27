import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/constants/config'

/** theme: 'light' | 'dark' | 'system'. The resolved class is applied to <html>. */
const ThemeContext = createContext(null)

const read = () => { try { return localStorage.getItem(STORAGE_KEYS.theme) || 'system' } catch { return 'system' } }
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(read)
  const [resolved, setResolved] = useState(() => (read() === 'system' ? (systemDark() ? 'dark' : 'light') : read()))

  useEffect(() => {
    const apply = () => {
      const r = theme === 'system' ? (systemDark() ? 'dark' : 'light') : theme
      setResolved(r)
      document.documentElement.classList.toggle('dark', r === 'dark')
    }
    apply()
    try { localStorage.setItem(STORAGE_KEYS.theme, theme) } catch { /* ignore */ }
    if (theme !== 'system') return
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    m.addEventListener('change', apply)
    return () => m.removeEventListener('change', apply)
  }, [theme])

  const value = useMemo(() => ({ theme, resolved, setTheme, toggle: () => setTheme(resolved === 'dark' ? 'light' : 'dark') }), [theme, resolved])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
