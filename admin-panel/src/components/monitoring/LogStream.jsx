import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDownToLine, Download, Eraser, Pause, Play, TerminalSquare } from 'lucide-react'
import { monitoringService } from '@/services/monitoringService'
import { downloadText, exportStamp } from '@/utils/csv'
import { formatTimeSeconds } from '@/utils/format'
import { cn } from '@/utils/cn'

const MAX_LINES = 500

/*
 * The panel is intentionally dark in both themes (terminal convention), so it
 * sits on the always-dark `nav` tokens. Level colours are the dark-theme
 * status values so they keep contrast on that surface in light mode too.
 */
const LEVELS = {
  info: { label: 'INFO', cls: 'text-brand-300' },
  success: { label: 'OK', cls: 'text-[#4cd39b]' },
  warn: { label: 'WARN', cls: 'text-[#f5bd4f]' },
  error: { label: 'ERROR', cls: 'text-[#ff7a84]' },
  debug: { label: 'DEBUG', cls: 'text-nav-ink-2' },
}

const toText = (l) => `${formatTimeSeconds(l.ts)}  ${(LEVELS[l.level]?.label || l.level).padEnd(5)}  ${l.message}`
const cap = (arr) => (arr.length > MAX_LINES ? arr.slice(arr.length - MAX_LINES) : arr)

/**
 * Live monitoring activity for one job. Purely a viewer of backend-provided
 * log lines ({ id, ts, level, message }) via monitoringService.subscribeToLogs.
 *
 * Props: jobId, live (job is running → shows LIVE), id (anchor for "View logs"), className, height
 */
export function LogStream({ jobId, live = true, id, className, height = 'h-80' }) {
  const [lines, setLines] = useState([])
  const [paused, setPaused] = useState(false)
  const [pending, setPending] = useState(0)
  const [autoScroll, setAutoScroll] = useState(true)
  const buffer = useRef([])
  const pausedRef = useRef(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    setLines([])
    buffer.current = []
    setPending(0)
    const unsubscribe = monitoringService.subscribeToLogs(jobId, (line) => {
      if (pausedRef.current) {
        buffer.current = cap([...buffer.current, line])
        setPending(buffer.current.length)
        return
      }
      setLines((prev) => cap([...prev, line]))
    })
    return () => unsubscribe?.()
  }, [jobId])

  // Keep the newest line in view while auto-scroll is on.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && autoScroll) el.scrollTop = el.scrollHeight
  }, [lines, autoScroll])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24
    if (!atBottom && autoScroll) setAutoScroll(false)
    else if (atBottom && !autoScroll) setAutoScroll(true)
  }

  const togglePause = useCallback(() => {
    const next = !pausedRef.current
    pausedRef.current = next
    setPaused(next)
    if (!next && buffer.current.length) {
      const flushed = buffer.current
      buffer.current = []
      setPending(0)
      setLines((prev) => cap([...prev, ...flushed]))
    }
  }, [])

  const clear = () => {
    setLines([])
    buffer.current = []
    setPending(0)
  }

  const download = () => {
    const all = [...lines, ...buffer.current]
    const header = `# SlotPilot monitoring log · ${jobId} · exported ${new Date().toISOString()}\n`
    downloadText(`slotpilot-${jobId}-log-${exportStamp()}.log`, header + all.map(toText).join('\n') + '\n')
  }

  const streaming = live && !paused
  const state = paused ? 'Paused' : live ? 'Live' : 'Idle'

  return (
    <section
      id={id}
      tabIndex={-1}
      aria-label="Live monitoring activity"
      className={cn('min-w-0 scroll-mt-24 overflow-hidden rounded-card border border-nav-line bg-nav shadow-card focus:outline-2 focus:outline-offset-2 focus:outline-brand-500', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-nav-line bg-nav-2 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <TerminalSquare className="h-4 w-4 shrink-0 text-nav-ink-2" aria-hidden />
          <h2 className="truncate text-[13px] font-semibold text-white">Live monitoring activity</h2>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-px text-[10.5px] font-semibold tracking-wider uppercase ring-1 ring-inset',
              streaming ? 'bg-[#4cd39b]/10 text-[#4cd39b] ring-[#4cd39b]/25' : paused ? 'bg-[#f5bd4f]/10 text-[#f5bd4f] ring-[#f5bd4f]/25' : 'bg-white/5 text-nav-ink-2 ring-white/10',
            )}
            aria-live="polite"
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              {streaming && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4cd39b] opacity-60" />}
              <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', streaming ? 'bg-[#4cd39b]' : paused ? 'bg-[#f5bd4f]' : 'bg-nav-ink-2')} />
            </span>
            {state}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <TermButton icon={ArrowDownToLine} pressed={autoScroll} onClick={() => setAutoScroll((v) => !v)} label="Auto-scroll" />
          <TermButton icon={paused ? Play : Pause} onClick={togglePause} label={paused ? 'Resume' : 'Pause'} />
          <TermButton icon={Eraser} onClick={clear} label="Clear" disabled={!lines.length && !pending} />
          <TermButton icon={Download} onClick={download} label="Download" disabled={!lines.length && !pending} />
        </div>
      </header>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          role="log"
          aria-live={paused ? 'off' : 'polite'}
          aria-relevant="additions"
          aria-label={`Log output for ${jobId}`}
          tabIndex={0}
          style={{ scrollbarColor: 'var(--color-nav-line) transparent' }}
          className={cn('overflow-y-auto overscroll-contain px-3 py-2.5 font-mono text-[12.5px] leading-[1.7] focus:outline-none sm:px-4', height)}
        >
          {lines.length === 0 ? (
            <p className="flex h-full items-center justify-center text-center text-nav-ink-2">
              {paused ? 'Stream paused.' : live ? 'Waiting for activity…' : 'No activity yet. This job is not currently running.'}
            </p>
          ) : (
            lines.map((l) => {
              const lv = LEVELS[l.level] || LEVELS.debug
              return (
                <div key={l.id} className="flex min-w-0 gap-3 rounded px-1 -mx-1 hover:bg-white/[0.03]">
                  <time dateTime={l.ts} className="shrink-0 text-nav-ink-2 tabular">{formatTimeSeconds(l.ts)}</time>
                  <span className={cn('w-[5ch] shrink-0 font-medium', lv.cls)}>{lv.label}</span>
                  <span className={cn('min-w-0 break-words', l.level === 'debug' ? 'text-nav-ink-2' : 'text-nav-ink', l.level === 'error' && 'text-[#ffb3b8]')}>{l.message}</span>
                </div>
              )
            })
          )}
        </div>

        {paused && pending > 0 && (
          <button
            type="button"
            onClick={togglePause}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white shadow-pop hover:bg-brand-700"
          >
            {pending} new line{pending === 1 ? '' : 's'} · Resume
          </button>
        )}
        {!paused && !autoScroll && lines.length > 0 && (
          <button
            type="button"
            onClick={() => setAutoScroll(true)}
            className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-nav-2 px-2.5 py-1 text-xs font-medium text-nav-ink ring-1 ring-nav-line hover:text-white"
          >
            <ArrowDownToLine className="h-3 w-3" aria-hidden /> Jump to latest
          </button>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-nav-line px-3 py-1.5 text-[11px] text-nav-ink-2 sm:px-4">
        <span className="tabular">{lines.length} / {MAX_LINES} lines</span>
        <span className="truncate">Showing backend-reported check activity</span>
      </footer>
    </section>
  )
}

function TermButton({ icon: Icon, label, onClick, pressed, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-400',
        pressed ? 'bg-white/10 text-white' : 'text-nav-ink hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </button>
  )
}
