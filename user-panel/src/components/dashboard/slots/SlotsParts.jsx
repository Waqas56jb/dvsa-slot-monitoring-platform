import { SearchX, Radar } from 'lucide-react';
import { Skeleton, EmptyState, Button } from '@/components/ui';
import { paths } from '@/routes/paths';

export function SlotGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading slots">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-2 h-5 w-2/3" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <Skeleton className="mt-4 h-4 w-1/2" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

const TAB_HINTS = {
  all: "We'll show matching availability here when detected.",
  new: 'New matches appear here the moment monitoring detects them.',
  viewed: 'Slots you’ve opened but not acted on will show here.',
  actioned: 'Slots where you opened the official booking service will show here.',
  expired: 'Slots that are no longer available will show here.',
};

export function SlotsEmpty({ tab, search, onClearSearch }) {
  if (search) {
    return (
      <EmptyState
        compact
        icon={SearchX}
        title="No slots match your search"
        description={`Nothing found for “${search}”. Try a centre or learner name.`}
        action={
          <Button variant="secondary" size="sm" onClick={onClearSearch}>
            Clear search
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      icon={SearchX}
      title="No matching slots found"
      description={TAB_HINTS[tab] || TAB_HINTS.all}
      action={
        <Button variant="secondary" leftIcon={Radar} to={paths.monitoring}>
          Check monitoring
        </Button>
      }
    />
  );
}
