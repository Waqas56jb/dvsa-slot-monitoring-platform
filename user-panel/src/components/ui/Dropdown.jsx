import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@/hooks';

/**
 * Menu button with keyboard support (↑/↓/Home/End/Escape).
 *
 * <Dropdown trigger={(props) => <IconButton {...props} icon={MoreHorizontal} label="Actions" />}
 *   items={[{ label: 'Edit', icon: Pencil, onClick }, { label: 'Delete', danger: true, onClick }, { divider: true }]} />
 */
export function Dropdown({ trigger, items, align = 'right', width = 'w-56', header, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector('[role="menuitem"]');
    first?.focus();
  }, [open]);

  const onMenuKey = (e) => {
    const nodes = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    const idx = nodes.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nodes[(idx + 1) % nodes.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nodes[(idx - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      nodes[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      nodes[nodes.length - 1]?.focus();
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      if (e.key === 'Escape') ref.current?.querySelector('[aria-haspopup]')?.focus();
    }
  };

  const itemClass = (item) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors min-h-10',
      item.danger ? 'text-danger-ink hover:bg-danger-soft focus:bg-danger-soft' : 'text-ink-soft hover:bg-surface-muted hover:text-ink focus:bg-surface-muted focus:text-ink',
      item.disabled && 'pointer-events-none opacity-50',
    );

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      {trigger({
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        onClick: (e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        },
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={cn(
              'absolute top-full z-50 mt-2 origin-top rounded-2xl border border-line bg-surface p-1.5 shadow-float',
              align === 'right' ? 'right-0' : 'left-0',
              width,
            )}
          >
            {header && <div className="border-b border-line px-2.5 pb-2.5 pt-1.5 mb-1.5">{header}</div>}
            {items.filter(Boolean).map((item, i) => {
              if (item.divider) return <div key={`d${i}`} className="my-1.5 h-px bg-line" role="separator" />;
              const Icon = item.icon;
              const inner = (
                <>
                  {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="text-xs text-subtle">{item.hint}</span>}
                </>
              );
              if (item.to) {
                return (
                  <Link key={item.label} to={item.to} role="menuitem" tabIndex={-1} className={itemClass(item)} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                );
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={itemClass(item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {inner}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
