import { X, UserRound, MapPin, Tag } from 'lucide-react';
import { Button, Card, SearchBar, Select, DatePicker } from '@/components/ui';
import { centreService, activityTypes } from '@/services';

const TYPE_OPTIONS = Object.entries(activityTypes).map(([value, meta]) => ({ value, label: meta.label }));

export const EMPTY_FILTERS = { learnerId: '', centreId: '', type: '', dateFrom: '', dateTo: '' };

export function HistoryFilters({ search, onSearch, filters, onChange, learnerOptions = [], activeCount, onClear }) {
  const centreOptions = centreService.all().map((c) => ({ value: c.id, label: c.name }));
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <Card className="mb-6" padded={false}>
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:p-5">
        <SearchBar
          id="history-search"
          value={search}
          onChange={onSearch}
          placeholder="Search events, learners or centres"
          label="Search history"
          className="flex-1"
        />
        {activeCount > 0 && (
          <Button variant="ghost" leftIcon={X} onClick={onClear} className="shrink-0">
            Clear filters ({activeCount})
          </Button>
        )}
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
        <Select id="f-learner" label="Learner" icon={UserRound} value={filters.learnerId} onChange={set('learnerId')} options={learnerOptions} placeholder="All learners" />
        <Select id="f-centre" label="Centre" icon={MapPin} value={filters.centreId} onChange={set('centreId')} options={centreOptions} placeholder="All centres" />
        <Select id="f-type" label="Event type" icon={Tag} value={filters.type} onChange={set('type')} options={TYPE_OPTIONS} placeholder="All events" />
        <DatePicker id="f-from" label="From" disablePast={false} value={filters.dateFrom} max={filters.dateTo || undefined} onChange={set('dateFrom')} />
        <DatePicker id="f-to" label="To" disablePast={false} value={filters.dateTo} min={filters.dateFrom || undefined} onChange={set('dateTo')} />
      </div>
    </Card>
  );
}
