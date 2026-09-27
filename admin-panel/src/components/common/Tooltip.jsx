import { cloneElement, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

/**
 * Portal tooltip so it is never clipped by overflow containers.
 * <Tooltip content="Explain" side="top|right|bottom"><button/></Tooltip>
 */
export function Tooltip({ content, side = 'top', children, disabled = false, delay = 250, className }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const ref = useRef(null)
  const timer = useRef()
  const id = useId()

  const show = () => { if (disabled || !content) return; clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(true), delay) }
  const hide = () => { clearTimeout(timer.current); setOpen(false) }

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const p = side === 'right' ? { top: r.top + r.height / 2, left: r.right + 8 } : side === 'bottom' ? { top: r.bottom + 8, left: r.left + r.width / 2 } : { top: r.top - 8, left: r.left + r.width / 2 }
    setPos(p)
  }, [open, side])

  const child = cloneElement(children, {
    ref,
    onMouseEnter: (e) => { show(); children.props.onMouseEnter?.(e) },
    onMouseLeave: (e) => { hide(); children.props.onMouseLeave?.(e) },
    onFocus: (e) => { show(); children.props.onFocus?.(e) },
    onBlur: (e) => { hide(); children.props.onBlur?.(e) },
    'aria-describedby': open ? id : undefined,
  })

  const transform = side === 'right' ? 'translate(0,-50%)' : side === 'bottom' ? 'translate(-50%,0)' : 'translate(-50%,-100%)'
  return (
    <>
      {child}
      {open && pos && createPortal(
        <div
          id={id}
          role="tooltip"
          className={cn('pointer-events-none fixed z-[80] max-w-xs rounded-md bg-[#0b1220] px-2.5 py-1.5 text-xs leading-snug font-medium text-white shadow-pop dark:bg-[#26324a]', className)}
          style={{ top: pos.top, left: pos.left, transform }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  )
}
