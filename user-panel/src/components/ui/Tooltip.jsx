import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/** Hover/focus tooltip. The trigger gets aria-describedby automatically. */
export function Tooltip({ content, children, side = 'top', className }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pos = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  }[side];

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={cn('pointer-events-none absolute z-50 w-max max-w-60 rounded-lg bg-night px-2.5 py-1.5 text-xs font-medium text-white shadow-float dark:bg-white dark:text-night', pos)}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
