import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export const EASE = [0.16, 1, 0.3, 1];

/** Section intro used across the landing page. */
export function LandingHeading({ eyebrow, title, description, align = 'center', dark = false, className, id }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}
    >
      {eyebrow && (
        <p className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em]', dark ? 'bg-white/[0.07] text-[#a9b9ff] ring-1 ring-white/10' : 'bg-brand-soft text-brand-ink')}>
          <span className={cn('size-1.5 rounded-full', dark ? 'bg-[#7d98ff]' : 'bg-brand')} aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={cn('mt-5 text-balance font-display text-[2.1rem] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-5xl', dark ? 'text-white' : 'text-ink')}>
        {title}
      </h2>
      {description && <p className={cn('mt-5 text-pretty text-[17px] leading-relaxed sm:text-lg', dark ? 'text-white/60' : 'text-muted', align === 'center' && 'mx-auto max-w-2xl')}>{description}</p>}
    </motion.div>
  );
}

/**
 * Seamless infinite marquee. Children are rendered twice; the track moves -50%.
 * direction: 'left' | 'right' | 'up'
 */
export function Marquee({ children, direction = 'left', duration = 40, className, trackClassName, pauseOnHover = true }) {
  const anim = direction === 'up' ? 'animate-marquee-y' : direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee';
  const vertical = direction === 'up';
  return (
    <div className={cn('overflow-hidden', vertical ? 'mask-fade-y' : 'mask-fade-x', pauseOnHover && 'pause-on-hover', className)}>
      <div className={cn('flex', vertical ? 'w-full flex-col' : 'w-max', anim, trackClassName)} style={{ '--marquee-duration': `${duration}s` }}>
        <div className={cn('flex shrink-0', vertical ? 'flex-col' : '')}>{children}</div>
        <div className={cn('flex shrink-0', vertical ? 'flex-col' : '')} aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
