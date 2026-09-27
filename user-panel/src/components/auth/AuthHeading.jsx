import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/** Page heading used at the top of every auth form. */
export function AuthHeading({ eyebrow, title, description, icon: Icon, className }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn('mb-8', className)}
    >
      {Icon && (
        <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink ring-1 ring-brand/10">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>}
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">{title}</h1>
      {description && <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{description}</p>}
    </motion.header>
  );
}

/** Subtle fade-up wrapper for the form body. */
export function AuthBody({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** "Don't have an account? Create one" style footer line. */
export function AuthSwitch({ children, className }) {
  return <p className={cn('mt-8 text-center text-sm text-muted', className)}>{children}</p>;
}
