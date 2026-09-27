import { NavLink } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { mobileNav } from '@/config/navigation';
import { cn } from '@/utils/cn';

/** Bottom navigation for phones. "More" opens the full drawer. */
export function MobileTabBar({ counts = {}, onMore }) {
  const cls = (active) =>
    cn('relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors', active ? 'text-brand' : 'text-muted');
  return (
    <nav aria-label="Primary" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md md:hidden">
      <ul className="flex">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const count = item.badgeKey ? counts[item.badgeKey] : 0;
          return (
            <li key={item.to} className="flex flex-1">
              <NavLink to={item.to} end={item.end} className={({ isActive }) => cls(isActive)}>
                <span className="relative">
                  <Icon className="size-5" aria-hidden="true" />
                  {count > 0 && (
                    <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] font-bold leading-4 text-white">{count}</span>
                  )}
                </span>
                {item.label}
              </NavLink>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onMore} className={cls(false)} aria-label="More navigation">
            <MoreHorizontal className="size-5" aria-hidden="true" />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
