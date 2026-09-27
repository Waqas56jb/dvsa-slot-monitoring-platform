import { useMemo, useState } from 'react';
import { UserPlus, Users, MapPin, CircleAlert, Check } from 'lucide-react';
import { SearchBar, Avatar, Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { LearnerStatusBadge } from '@/components/dashboard/StatusBadges';
import { formatDateRange } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

export function StepLearners({ learners, loading, error, onRetry, value, onChange, fieldError }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (learners || []).filter((l) => !q || l.fullName.toLowerCase().includes(q) || l.centres.some((c) => c.name.toLowerCase().includes(q))),
    [learners, q],
  );

  if (error) return <ErrorState title="Couldn’t load learners" error={error} onRetry={onRetry} />;
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (!learners?.length) {
    return (
      <EmptyState
        compact
        icon={Users}
        title="Add a learner first"
        description="Monitoring sessions watch centres and times for your learners. Add one to get started."
        action={
          <Button leftIcon={UserPlus} to={paths.newLearner}>
            Add Learner
          </Button>
        }
      />
    );
  }

  const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  const allSelected = filtered.length > 0 && filtered.every((l) => value.includes(l.id));
  const toggleAll = () =>
    onChange(allSelected ? value.filter((id) => !filtered.some((l) => l.id === id)) : [...new Set([...value, ...filtered.map((l) => l.id)])]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar id="learner-search" value={query} onChange={setQuery} placeholder="Search learners or centres" label="Search learners" className="flex-1" />
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums', value.length ? 'bg-brand-soft text-brand-ink' : 'bg-surface-sunken text-muted')} aria-live="polite">
            {value.length} selected
          </span>
          <Button variant="ghost" size="sm" onClick={toggleAll} disabled={!filtered.length}>
            {allSelected ? 'Clear' : 'Select all'}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong px-4 py-10 text-center text-sm text-muted">No learners match “{query}”.</p>
      ) : (
        <div role="group" aria-label="Learners" id="learnerIds" tabIndex={-1} className="grid gap-3 sm:grid-cols-2">
          {filtered.map((l) => {
            const selected = value.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => toggle(l.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-150',
                  selected ? 'border-brand bg-brand-soft/60 ring-4 ring-brand/10' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted/60',
                )}
              >
                <Avatar name={l.fullName} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-ink">{l.fullName}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                    <MapPin className="size-3 shrink-0" aria-hidden="true" />
                    {l.centres.length ? `${l.centres[0].name}${l.centres.length > 1 ? ` +${l.centres.length - 1}` : ''}` : 'No centres yet'}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{formatDateRange(l.dateFrom, l.dateTo)}</span>
                  <span className="mt-2 block">
                    <LearnerStatusBadge status={l.status} size="sm" />
                  </span>
                </span>
                <span
                  className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors', selected ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface')}
                  aria-hidden="true"
                >
                  {selected && <Check className="size-3" strokeWidth={3.5} />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {fieldError && (
        <p className="flex items-center gap-1.5 text-[13px] text-danger-ink" role="alert">
          <CircleAlert className="size-3.5" aria-hidden="true" />
          {fieldError}
        </p>
      )}
    </div>
  );
}
