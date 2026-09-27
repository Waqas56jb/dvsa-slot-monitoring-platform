import { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * Accessible menu rendered in a portal (never clipped by tables/cards).
 *
 * <DropdownMenu trigger={<Button>Open</Button>} align="end" items={[
 *   { label: 'View', icon: Eye, to: '/x' },
 *   { label: 'Suspend', icon: Ban, onSelect: fn, danger: true, disabled: false, hidden: false },
 *   { type: 'separator' }, { type: 'label', label: 'Section' },
 * ]} />
 *
 * Or pass `children` (render fn receiving { close }) for custom panel content.
 */
export function DropdownMenu({ trigger, items, children, align = 'end', width = 208, className, onOpenChange, panelClassName }) {
  const [open, setOpenState] = useState(false)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const navigate = useNavigate()
  const menuId = useId()

  const setOpen = useCallback((v) => { setOpenState(v); onOpenChange?.(v) }, [onOpenChange])
  const close = useCallback(() => { setOpen(false); triggerRef.current?.focus() }, [setOpen])

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const w = typeof width === 'number' ? width : r.width
    const vw = window.innerWidth
    let left = align === 'end' ? r.right - w : r.left
    left = Math.max(8, Math.min(left, vw - w - 8))
    const panelH = panelRef.current?.offsetHeight || 240
    const below = r.bottom + 6
    const top = below + panelH > window.innerHeight - 8 && r.top - panelH - 6 > 8 ? r.top - panelH - 6 : below
    setPos({ top, left, width: w })
  }, [align, width])

  useLayoutEffect(() => { if (open) place() }, [open, place])
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    const onScroll = () => place()
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, true)
    // focus first item
    requestAnimationFrame(() => panelRef.current?.querySelector('[role=menuitem]:not([disabled])')?.focus())
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, close, place, setOpen])

  const onMenuKey = (e) => {
    const els = [...(panelRef.current?.querySelectorAll('[role=menuitem]:not([disabled])') || [])]
    const i = els.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length]?.focus() }
    if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus() }
    if (e.key === 'Home') { e.preventDefault(); els[0]?.focus() }
    if (e.key === 'End') { e.preventDefault(); els[els.length - 1]?.focus() }
    if (e.key === 'Tab') setOpen(false)
  }

  const triggerEl = cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e) => { e.stopPropagation(); trigger.props.onClick?.(e); setOpen(!open) },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
  })

  return (
    <>
      {triggerEl}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              id={menuId}
              role={items ? 'menu' : 'dialog'}
              onKeyDown={items ? onMenuKey : undefined}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: pos?.width ?? width }}
              className={cn('z-[70] overflow-hidden rounded-xl border border-line bg-surface shadow-pop', items && 'p-1', panelClassName, className)}
            >
              {items ? <MenuItems items={items} close={() => setOpen(false)} navigate={navigate} /> : typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

function MenuItems({ items, close, navigate }) {
  return items.filter((i) => i && !i.hidden).map((item, idx) => {
    if (item.type === 'separator') return <div key={`sep-${idx}`} className="my-1 h-px bg-line" role="separator" />
    if (item.type === 'label') return <div key={`lbl-${idx}`} className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-ink-4 uppercase">{item.label}</div>
    const Icon = item.icon
    return (
      <button
        key={item.label}
        type="button"
        role="menuitem"
        disabled={item.disabled}
        title={item.disabledReason}
        onClick={() => {
          close()
          if (item.to) navigate(item.to)
          item.onSelect?.()
        }}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-45',
          item.danger ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft' : 'text-ink-2 hover:bg-subtle hover:text-ink focus:bg-subtle focus:text-ink',
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />}
        <span className="flex-1 truncate">{item.label}</span>
        {item.shortcut && <kbd className="text-[11px] text-ink-4">{item.shortcut}</kbd>}
      </button>
    )
  })
}
