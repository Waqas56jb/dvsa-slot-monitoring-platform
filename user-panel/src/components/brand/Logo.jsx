import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { APP_NAME } from '@/config/app';

/** Abstract road-to-pin mark: a curving route ending at a location dot. */
export function LogoMark({ className, inverted = false }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className={inverted ? 'fill-white' : 'fill-night dark:fill-white'} />
      <path d="M8.5 22.5c3.2-9.4 11.2-2.6 14.4-12.3" fill="none" stroke="#5B7CFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M8.5 22.5c3.2-9.4 11.2-2.6 14.4-12.3" fill="none" className={inverted ? 'stroke-night/25' : 'stroke-white/35 dark:stroke-night/25'} strokeWidth="1" strokeDasharray="1.5 2.5" strokeLinecap="round" />
      <circle cx="22.9" cy="10.2" r="3.1" fill="#34D399" />
      <circle cx="22.9" cy="10.2" r="1.2" className={inverted ? 'fill-white' : 'fill-night dark:fill-white'} />
    </svg>
  );
}

export function Logo({ to = '/', className, inverted = false, compact = false }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5 rounded-lg', className)} aria-label={`${APP_NAME} home`}>
      <LogoMark inverted={inverted} className="transition-transform duration-300 group-hover:-rotate-6" />
      {!compact && (
        <span className={cn('font-display text-[19px] font-bold tracking-tight', inverted ? 'text-white' : 'text-ink')}>
          Slot<span className="text-brand">Pilot</span>
        </span>
      )}
    </Link>
  );
}
