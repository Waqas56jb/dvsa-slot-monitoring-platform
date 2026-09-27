import { Link } from 'react-router-dom';
import { Avatar, Table } from '@/components/ui';
import { LearnerStatusBadge } from '@/components/dashboard/StatusBadges';
import { LearnerActions, LearnerCard } from '@/components/dashboard/LearnerCard';
import { formatDate, formatRelative } from '@/utils/format';
import { paths } from '@/routes/paths';

// Let action menus escape the table's rounded clip; keep the header corners rounded.
const TABLE_CLASS =
  'overflow-visible! [&_thead_tr]:bg-transparent [&_th]:bg-surface-muted/60 [&_th:first-child]:rounded-tl-3xl [&_th:last-child]:rounded-tr-3xl';

export function LearnersTable({ learners, onToggleMonitoring, onDelete }) {
  const columns = [
    {
      key: 'learner',
      header: 'Learner',
      render: (l) => (
        <div className="flex min-w-0 max-w-[18rem] items-center gap-3">
          <Avatar name={l.fullName} size="md" />
          <div className="min-w-0">
            <Link to={paths.learner(l.id)} className="block truncate font-semibold text-ink hover:text-brand">
              {l.fullName}
            </Link>
            <p className="truncate text-[13px] text-muted">{l.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'centre',
      header: 'Test Centre',
      render: (l) =>
        l.centres.length ? (
          <span className="flex items-center gap-2">
            <span className="truncate text-ink">{l.centres[0].name}</span>
            {l.centres.length > 1 && (
              <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-semibold text-muted" title={l.centres.slice(1).map((c) => c.name).join(', ')}>
                +{l.centres.length - 1}
              </span>
            )}
          </span>
        ) : (
          <span className="text-subtle">None selected</span>
        ),
    },
    {
      key: 'date',
      header: 'Preferred Date',
      className: 'hidden lg:table-cell',
      headerClassName: 'hidden lg:table-cell',
      render: (l) => <span className="whitespace-nowrap tabular-nums">{formatDate(l.preferredDate)}</span>,
    },
    { key: 'status', header: 'Monitoring', render: (l) => <LearnerStatusBadge status={l.status} /> },
    {
      key: 'alert',
      header: 'Last Alert',
      className: 'hidden xl:table-cell',
      headerClassName: 'hidden xl:table-cell',
      render: (l) => <span className="whitespace-nowrap text-muted">{formatRelative(l.lastAlertAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-16',
      render: (l) => <LearnerActions learner={l} onToggleMonitoring={onToggleMonitoring} onDelete={onDelete} />,
    },
  ];

  return (
    <Table
      caption="Learners"
      columns={columns}
      rows={learners}
      className={TABLE_CLASS}
      mobile={(l) => <LearnerCard learner={l} onToggleMonitoring={onToggleMonitoring} onDelete={onDelete} index={learners.indexOf(l)} />}
    />
  );
}
