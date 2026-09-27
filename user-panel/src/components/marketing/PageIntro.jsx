import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { RoutePattern } from './RoutePattern';
import { EASE } from './Reveal';
import { Eyebrow } from './SectionHeading';

/** Hero-style intro for marketing sub-pages (renders the page's h1). */
export function PageIntro({ eyebrow, title, description, children, align = 'center', className, compact }) {
  const centered = align === 'center';
  return (
    <section className={cn('relative overflow-hidden border-b border-line', compact ? 'pb-14 pt-14 sm:pt-16' : 'pb-16 pt-16 sm:pb-20 sm:pt-24', className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(55%_70%_at_50%_0%,color-mix(in_srgb,var(--sp-brand)_10%,transparent),transparent_70%)]"
        aria-hidden="true"
      />
      <RoutePattern className="opacity-80" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className={cn('container-page relative', centered && 'text-center')}
      >
        <div className={cn('max-w-3xl', centered && 'mx-auto')}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.06] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-5 text-pretty text-lg leading-relaxed text-muted sm:text-xl">{description}</p>}
          {children && <div className={cn('mt-8 flex flex-col gap-3 sm:flex-row', centered && 'sm:justify-center')}>{children}</div>}
        </div>
      </motion.div>
    </section>
  );
}
