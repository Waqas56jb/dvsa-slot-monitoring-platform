import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Radar } from 'lucide-react';
import { PageHeader, Tabs, SearchBar, Select, ErrorState, Button, StatusIndicator } from '@/components/ui';
import { SlotCard } from '@/components/dashboard/SlotCard';
import { SlotGridSkeleton, SlotsEmpty } from '@/components/dashboard/slots/SlotsParts';
import { slotService } from '@/services';
import { useMonitoring } from '@/context/MonitoringContext';
import { useToast } from '@/context/ToastContext';
import { useDebounce, useDocumentTitle, useResource } from '@/hooks';
import { paths } from '@/routes/paths';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'actioned', label: 'Actioned' },
  { value: 'expired', label: 'Expired' },
];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'closest', label: 'Closest date' },
  { value: 'centre', label: 'Centre (A–Z)' },
];

export default function SlotsPage() {
  useDocumentTitle('Available Matches');
  const toast = useToast();
  const { status } = useMonitoring();
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState('');
  const search = useDebounce(query, 300).trim();

  const { data, setData, loading, error, reload } = useResource(() => slotService.list({ status: tab, sort, search }), [tab, sort, search], {
    topics: ['slots'],
  });
  const { data: counts } = useResource(() => slotService.counts(), [], { topics: ['slots'] });

  const handleDismiss = async (slot) => {
    const previous = data;
    setData((list) => (list || []).filter((s) => s.id !== slot.id));
    try {
      await slotService.dismiss(slot.id);
      toast.success('Slot dismissed', {
        description: `${slot.centre?.name} · removed from your matches.`,
        duration: 6000,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await slotService.restore(slot.id);
              toast.info('Slot restored');
              reload({ silent: true });
            } catch (err) {
              toast.error('Could not restore slot', { description: err.message });
            }
          },
        },
      });
    } catch (err) {
      setData(previous);
      toast.error('Could not dismiss slot', { description: err.message });
    }
  };

  const handleActioned = (updated) => setData((list) => (list || []).map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));

  const tabs = TABS.map((t) => ({ ...t, count: counts?.[t.value] }));
  const slots = data || [];

  return (
    <>
      <PageHeader
        title="Available Matches"
        description="Driving test slots that match your learners’ centres, dates and times."
        badge={<StatusIndicator status={status} size="sm" className="rounded-full bg-surface px-3 py-1 ring-1 ring-line" />}
        actions={
          <Button variant="secondary" leftIcon={Radar} to={paths.monitoring}>
            Manage monitoring
          </Button>
        }
      />

      <div className="space-y-5">
        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Filter slots by status" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar id="slot-search" value={query} onChange={setQuery} placeholder="Search by centre or learner" label="Search slots" className="flex-1 sm:max-w-sm" />
          <Select
            id="slot-sort"
            label={<span className="sr-only">Sort slots</span>}
            icon={ArrowUpDown}
            size="sm"
            options={SORTS}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sm:ml-auto sm:w-52"
          />
        </div>

        <div role="tabpanel" aria-label={`${TABS.find((t) => t.value === tab)?.label} slots`}>
          {error && !data ? (
            <ErrorState title="Couldn’t load slots" error={error} onRetry={reload} />
          ) : loading && !data ? (
            <SlotGridSkeleton />
          ) : slots.length === 0 && !loading ? (
            <SlotsEmpty tab={tab} search={search} onClearSearch={() => setQuery('')} />
          ) : (
            <div className={`grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`} aria-busy={loading || undefined}>
              <AnimatePresence initial={false}>
                {slots.map((slot, i) => (
                  <SlotCard key={slot.id} slot={slot} index={i} onDismiss={handleDismiss} onActioned={handleActioned} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
