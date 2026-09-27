import { cn } from '@/utils/cn';
import { Reveal } from './Reveal';

/** Small uppercase label above section titles. */
export function Eyebrow({ children, className, onDark }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]',
        onDark ? 'text-[#a9b9ff]' : 'text-brand',
        className,
      )}
    >
      <span className={cn('h-px w-5', onDark ? 'bg-[#a9b9ff]/60' : 'bg-brand/50')} aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * Consistent section heading: eyebrow, h2, supporting copy.
 * `as` lets sub-pages promote the title to h1.
 */
export function SectionHeading({ eyebrow, title, description, align = 'center', onDark, as: Tag = 'h2', className, children }) {
  const centered = align === 'center';
  return (
    <Reveal className={cn('max-w-2xl', centered && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
      <Tag
        className={cn(
          'mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[44px]',
          onDark ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </Tag>
      {description && (
        <p className={cn('mt-4 text-pretty text-base leading-relaxed sm:text-lg', onDark ? 'text-white/70' : 'text-muted')}>{description}</p>
      )}
      {children}
    </Reveal>
  );
}

/** Standard marketing section wrapper with the shared vertical rhythm. */
export function Section({ id, className, children, tone = 'canvas', ...rest }) {
  const tones = {
    canvas: 'bg-canvas',
    surface: 'bg-surface border-y border-line',
    night: 'bg-night text-white',
  };
  return (
    <section id={id} className={cn('relative scroll-mt-20 overflow-hidden py-20 lg:py-28', tones[tone], className)} {...rest}>
      {children}
    </section>
  );
}
