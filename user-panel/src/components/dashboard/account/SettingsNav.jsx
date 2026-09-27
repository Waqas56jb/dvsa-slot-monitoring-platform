import { UserRound, BellRing, Radar, ShieldCheck, Palette } from 'lucide-react';
import { Tabs } from '@/components/ui';
import { cn } from '@/utils/cn';

export const SETTINGS_SECTIONS = [
  { value: 'account', label: 'Account', description: 'Plan, demo data and account', icon: UserRound },
  { value: 'notifications', label: 'Notifications', description: 'Browser, sound and email alerts', icon: BellRing },
  { value: 'monitoring', label: 'Monitoring', description: 'Defaults for new sessions', icon: Radar },
  { value: 'security', label: 'Security', description: 'Password and sessions', icon: ShieldCheck },
  { value: 'appearance', label: 'Appearance', description: 'Light, dark or system theme', icon: Palette },
];

/** Sticky left sub-nav on desktop, horizontal pills on mobile. */
export function SettingsNav({ value, onChange }) {
  return (
    <>
      <div className="lg:hidden">
        <Tabs
          variant="pills"
          label="Settings sections"
          tabs={SETTINGS_SECTIONS.map(({ value: v, label, icon }) => ({ value: v, label, icon }))}
          value={value}
          onChange={onChange}
        />
      </div>
      <nav aria-label="Settings sections" className="hidden lg:block">
        <ul className="sticky top-24 space-y-1">
          {SETTINGS_SECTIONS.map((s) => {
            const active = s.value === value;
            return (
              <li key={s.value}>
                <button
                  type="button"
                  onClick={() => onChange(s.value)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-surface shadow-soft ring-1 ring-line' : 'hover:bg-surface-muted',
                  )}
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', active ? 'bg-brand-soft text-brand-ink' : 'bg-surface-muted text-muted')}>
                    <s.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block text-sm font-semibold', active ? 'text-ink' : 'text-ink-soft')}>{s.label}</span>
                    <span className="block truncate text-xs text-muted">{s.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
