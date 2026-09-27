import { useState } from 'react';
import { History, SearchX } from 'lucide-react';
import { Button, PageHeader, Pagination, SkeletonRows, EmptyState, ErrorState } from '@/components/ui';
import { HistoryFilters, EMPTY_FILTERS } from '@/components/dashboard/history/HistoryFilters';
import { HistoryTable } from '@/components/dashboard/history/HistoryTable';
import { activityService, learnerService } from '@/services';
import { useDebounce, useDocumentTitle, useResource } from '@/hooks';
import { pluralise } from '@/utils/format';

const PAGE_SIZE = 10;

export default function HistoryPage() {
  useDocumentTitle('History');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300).trim();

  const { data: learnerOptions } = useResource(() => learnerService.options(), [], { topics: ['learners'], initialData: [] });

  const { data, loading, error, reload } = useResource(
    () => activityService.list({ ...filters, search: debounced, page, pageSize: PAGE_SIZE }),
    [debounced, filters, page],
    { topics: ['activity'] },
  );

  const changeFilters = (next) => {
    setFilters(next);
    setPage(1);
  };
  const changeSearch = (v) => {
    setSearch(v);
    setPage(1);
  };
  const activeCount = Object.values(filters).filter(Boolean).length + (debounced ? 1 : 0);
  const clearAll = () => {
    setSearch('');
    changeFilters(EMPTY_FILTERS);
  };

  const goTo = (p) => {
    setPage(p);
    document.getElementById('history-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let body;
  if (loading && !data) body = <SkeletonRows rows={8} />;
  else if (error) body = <ErrorState title="Couldn't load history" error={error} onRetry={reload} />;
  else if (!data.items.length)
    body = activeCount ? (
      <EmptyState
        icon={SearchX}
        title="No matching events"
        description="Try widening the date range or removing a filter."
        action={
          <Button variant="secondary" onClick={clearAll}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState icon={History} title="No history yet" description="Slot alerts, monitoring changes and learner updates will be recorded here." />
    );
  else
    body = (
      <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <HistoryTable rows={data.items} />
        <Pagination className="mt-5" page={data.page} pageCount={data.pageCount} total={data.total} pageSize={data.pageSize} onChange={goTo} />
      </div>
    );

  return (
    <>
      <PageHeader
        title="History"
        description={data ? `${pluralise(data.total, 'event')} recorded${activeCount ? ' matching your filters' : ''}.` : 'A complete log of slot alerts, monitoring and learner changes.'}
      />
      <HistoryFilters
        search={search}
        onSearch={changeSearch}
        filters={filters}
        onChange={changeFilters}
        learnerOptions={learnerOptions || []}
        activeCount={activeCount}
        onClear={clearAll}
      />
      <section id="history-results" aria-label="History records" aria-busy={loading || undefined} className="scroll-mt-24">
        {body}
      </section>
    </>
  );
}
