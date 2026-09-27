import { Palette, Sun, Moon, Laptop, Check } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services';
import { cn } from '@/utils/cn';

const OPTIONS = [
  { value: 'light', label: 'Light', description: 'Bright and clean', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: Moon },
  { value: 'system', label: 'System', description: 'Match your device', icon: Laptop },
];

/** Mini mock of the dashboard in a given palette (fixed light/dark palette on purpose). */
function Preview({ dark }) {
  return (
    <div className={cn('flex h-full w-full gap-1.5 p-2', dark ? 'bg-night' : 'bg-white')}>
      <div className={cn('w-1/4 rounded-md', dark ? 'bg-night-soft' : 'bg-white ring-1 ring-black/10')} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className={cn('h-2 w-1/2 rounded', dark ? 'bg-white/15' : 'bg-black/10')} />
        <div className={cn('flex-1 rounded-md p-1.5', dark ? 'bg-night-soft' : 'bg-white ring-1 ring-black/10')}>
          <div className="h-1.5 w-1/3 rounded bg-brand" />
          <div className={cn('mt-1 h-1.5 w-2/3 rounded', dark ? 'bg-white/10' : 'bg-black/[0.07]')} />
        </div>
      </div>
    </div>
  );
}

export function SettingsAppearance() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const toast = useToast();

  const choose = async (value) => {
    if (value === theme) return;
    setTheme(value);
    try {
      await userService.updatePreferences('appearance', { theme: value });
      toast.success('Theme updated', { description: value === 'system' ? 'SlotPilot will follow your device setting.' : `Switched to ${value} mode.` });
    } catch (err) {
      toast.error('Theme applied, but could not be saved to your account', { description: err.message });
    }
  };

  return (
    <Card as="section" aria-labelledby="set-appearance">
      <CardHeader icon={Palette} title={<span id="set-appearance">Appearance</span>} description={`Choose how SlotPilot looks. Currently showing ${resolvedTheme} mode.`} />
      <div role="radiogroup" aria-labelledby="set-appearance" className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const selected = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(o.value)}
              className={cn(
                'group overflow-hidden rounded-2xl border text-left transition-all',
                selected ? 'border-brand ring-4 ring-brand/10' : 'border-line hover:border-line-strong',
              )}
            >
              <div className="relative h-24 overflow-hidden border-b border-line">
                {o.value === 'system' ? (
                  <div className="flex h-full">
                    <div className="w-1/2 overflow-hidden"><div className="h-full w-[200%]"><Preview /></div></div>
                    <div className="w-1/2 overflow-hidden"><div className="-ml-[100%] h-full w-[200%]"><Preview dark /></div></div>
                  </div>
                ) : (
                  <Preview dark={o.value === 'dark'} />
                )}
                {selected && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-brand text-white shadow-soft">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 bg-surface px-3.5 py-3">
                <o.icon className={cn('size-4', selected ? 'text-brand' : 'text-muted')} aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{o.label}</span>
                  <span className="block text-xs text-muted">{o.description}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
