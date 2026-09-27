import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MapPin, X } from 'lucide-react';
import { SearchBar, FilterChips } from '@/components/ui';
import { centreService, getCentreSync } from '@/services';
import { useDebounce } from '@/hooks';
import { cn } from '@/utils/cn';

/**
 * Searchable multi-select for test centres with region filter, selected
 * tags and a count. `value` is an array of centre ids.
 */
export function CentrePicker({ value = [], onChange, max, error, id = 'centres', label = 'Test centres', listHeight = 'max-h-80' }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const q = useDebounce(query, 150).trim().toLowerCase();

  const all = centreService.all();
  const regions = centreService.regions();
  const filtered = useMemo(
    () =>
      all.filter(
        (c) =>
          (!region || c.region === region) &&
          (!q || c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q) || c.postcode.toLowerCase().startsWith(q)),
      ),
    [all, region, q],
  );

  const toggle = (cid) => {
    if (value.includes(cid)) onChange(value.filter((v) => v !== cid));
    else if (!max || value.length < max) onChange([...value, cid]);
  };

  const limitReached = max && value.length >= max;

  return (
    <div className="flex flex-col gap-3" id={id} tabIndex={-1}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink" id={`${id}-label`}>
          {label}
        </p>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums', value.length ? 'bg-brand-soft text-brand-ink' : 'bg-surface-sunken text-muted')} aria-live="polite">
          {value.length} selected{max ? ` / ${max}` : ''}
        </span>
      </div>

      <SearchBar id={`${id}-search`} value={query} onChange={setQuery} placeholder="Search by centre, area or postcode" label="Search test centres" />
      <FilterChips
        label="Filter by region"
        value={region}
        onChange={setRegion}
        options={[{ value: '', label: 'All regions' }, ...regions.map((r) => ({ value: r, label: r }))]}
      />

      <AnimatePresence initial={false}>
        {value.length > 0 && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-1.5" aria-label="Selected centres">
            {value.map((cid) => {
              const c = getCentreSync(cid);
              if (!c) return null;
              return (
                <motion.li key={cid} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink pl-3 pr-1 text-xs font-medium text-surface">
                    <MapPin className="size-3" aria-hidden="true" />
                    {c.name}
                    <button type="button" onClick={() => toggle(cid)} className="flex size-6 items-center justify-center rounded-full hover:bg-surface/20" aria-label={`Remove ${c.name}`}>
                      <X className="size-3" />
                    </button>
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-invalid={error ? true : undefined}
        className={cn('scrollbar-thin overflow-y-auto rounded-2xl border bg-surface p-1.5', listHeight, error ? 'border-danger/60' : 'border-line')}
      >
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">No centres match “{query}”.</p>
        ) : (
          <ul className="grid gap-1 sm:grid-cols-2">
            {filtered.map((c) => {
              const selected = value.includes(c.id);
              const disabled = !selected && limitReached;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => toggle(c.id)}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                      selected ? 'bg-brand-soft/70' : 'hover:bg-surface-muted',
                      disabled && 'cursor-not-allowed opacity-45',
                    )}
                  >
                    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors', selected ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface')}>
                      {selected && <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{c.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {c.area} · {c.postcode}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error ? (
        <p className="text-[13px] text-danger-ink" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-[13px] text-muted">Sample centre data for this demo. Live centre availability will come from the SlotPilot backend.</p>
      )}
    </div>
  );
}
