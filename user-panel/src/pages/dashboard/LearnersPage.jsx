import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Users, SearchX } from 'lucide-react';
import { Button, PageHeader, SearchBar, FilterChips, SkeletonRows, EmptyState, ErrorState, Pagination } from '@/components/ui';
import { LearnersTable } from '@/components/dashboard/learners/LearnersTable';
import { useLearnerActions } from '@/components/dashboard/learners/useLearnerActions';
import { learnerService } from '@/services';
import { useDebounce, useDocumentTitle, usePagination, useResource } from '@/hooks';
import { pluralise } from '@/utils/format';
import { paths } from '@/routes/paths';

const PAGE_SIZE = 8;
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'slot_found', label: 'Slot Found' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'inactive', label: 'Inactive' },
];

export default function LearnersPage() {
  useDocumentTitle('Learners');
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') || '';
  const [search, setSearch] = useState(urlQuery);
  const [status, setStatus] = useState('all');
  const debounced = useDebounce(search, 300);

  // The global topbar search navigates here with ?q= — keep the box in sync.
  useEffect(() => {
    setSearch((s) => (s.trim() === urlQuery ? s : urlQuery));
  }, [urlQuery]);

  // Reflect the debounced search back into the URL (shareable, back-button friendly).
  useEffect(() => {
    const q = debounced.trim();
    if (q === urlQuery) return;
    const next = new URLSearchParams(params);
    if (q) next.set('q', q);
    else next.delete('q');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, loading, error, reload } = useResource(() => learnerService.list({ search: debounced }), [debounced], {
    topics: ['learners', 'slots', 'monitoring'],
  });
  const learners = useMemo(() => data || [], [data]);

  const counts = useMemo(() => {
    const c = { all: learners.length };
    FILTERS.slice(1).forEach((f) => {
      c[f.value] = learners.filter((l) => l.status === f.value).length;
    });
    return c;
  }, [learners]);

  const filtered = useMemo(() => (status === 'all' ? learners : learners.filter((l) => l.status === status)), [learners, status]);
  const { page, setPage, pageCount, pageItems, total } = usePagination(filtered, PAGE_SIZE);

  useEffect(() => setPage(1), [status, debounced, setPage]);

  const { toggleMonitoring, requestDelete, dialog } = useLearnerActions({ onDeleted: () => reload({ silent: true }) });

  const hasFilters = Boolean(debounced.trim()) || status !== 'all';
  const clearFilters = () => {
    setSearch('');
    setStatus('all');
  };

  let content;
  if (loading && !data) content = <SkeletonRows rows={6} />;
  else if (error) content = <ErrorState title="Couldn't load learners" error={error} onRetry={reload} />;
  else if (filtered.length === 0 && !hasFilters)
    content = (
      <EmptyState
        icon={Users}
        title="No learners yet"
        description="Add your first learner to start monitoring."
        action={
          <Button to={paths.newLearner} leftIcon={Plus}>
            Add Learner
          </Button>
        }
      />
    );
  else if (filtered.length === 0)
    content = (
      <EmptyState
        icon={SearchX}
        title="No learners match your filters"
        description={debounced.trim() ? `Nothing found for “${debounced.trim()}”. Try a different name, email or centre.` : 'No learners have this status right now.'}
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    );
  else
    content = (
      <>
        <LearnersTable learners={pageItems} onToggleMonitoring={toggleMonitoring} onDelete={requestDelete} />
        <Pagination className="mt-5" page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={PAGE_SIZE} />
      </>
    );

  return (
    <>
      <PageHeader
        title="Learners"
        description={data ? `${pluralise(counts.all, 'learner')} · ${pluralise(counts.monitoring, 'actively monitored', 'actively monitored')}` : 'Manage learners and their driving-test preferences.'}
        actions={
          <Button to={paths.newLearner} leftIcon={Plus}>
            Add Learner
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          id="learner-search"
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or centre"
          label="Search learners"
          className="w-full lg:max-w-sm"
        />
        <FilterChips
          label="Filter learners by status"
          value={status}
          onChange={setStatus}
          options={FILTERS.map((f) => ({ ...f, count: data ? counts[f.value] : undefined }))}
        />
      </div>

      <section aria-label="Learner list" aria-busy={loading || undefined}>
        {content}
      </section>
      {dialog}
    </>
  );
}
