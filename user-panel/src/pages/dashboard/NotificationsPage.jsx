import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Trash2, BellOff, Settings2 } from 'lucide-react';
import { Button, PageHeader, Tabs, SkeletonRows, EmptyState, ErrorState, ConfirmDialog, Badge } from '@/components/ui';
import { NotificationList } from '@/components/dashboard/notifications/NotificationList';
import { notificationService } from '@/services';
import { useDocumentTitle, useResource } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { pluralise } from '@/utils/format';
import { paths } from '@/routes/paths';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'slot', label: 'Slots' },
  { value: 'system', label: 'System' },
  { value: 'learner', label: 'Learners' },
];

const EMPTY = {
  all: { title: "You're all caught up", description: 'New slot alerts, monitoring updates and learner changes will appear here.' },
  slot: { title: 'No slot alerts', description: 'When a matching slot is found you will see it here straight away.' },
  system: { title: 'No system updates', description: 'Monitoring starts, pauses and other system events will appear here.' },
  learner: { title: 'No learner updates', description: 'Changes to your learners will be listed here.' },
};

export default function NotificationsPage() {
  useDocumentTitle('Notifications');
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const { data, setData, loading, error, reload } = useResource(() => notificationService.list(), [], { topics: ['notifications'] });
  const all = useMemo(() => data || [], [data]);

  const tabs = TABS.map((t) => {
    const items = t.value === 'all' ? all : all.filter((n) => n.type === t.value);
    return { ...t, count: data ? items.length : undefined, items };
  });
  const current = tabs.find((t) => t.value === tab);
  const items = current.items;
  const unreadInTab = items.filter((n) => !n.read).length;
  const tabLabel = tab === 'all' ? '' : ` ${current.label.toLowerCase()}`;

  const patchLocal = (id, patch) => setData((list) => (list || []).map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const toggleRead = async (n) => {
    patchLocal(n.id, { read: !n.read });
    try {
      await notificationService.markRead(n.id, !n.read);
      toast.success(n.read ? 'Marked as unread' : 'Marked as read');
    } catch (err) {
      patchLocal(n.id, { read: n.read });
      toast.error('Could not update notification', { description: err.message });
    }
  };

  const open = async (n) => {
    if (!n.read) {
      patchLocal(n.id, { read: true });
      notificationService.markRead(n.id, true).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const remove = async (n) => {
    setData((list) => (list || []).filter((x) => x.id !== n.id));
    try {
      await notificationService.remove(n.id);
      toast.success('Notification deleted');
    } catch (err) {
      reload({ silent: true });
      toast.error('Could not delete notification', { description: err.message });
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      const count = await notificationService.markAllRead(tab);
      setData((list) => (list || []).map((n) => (tab === 'all' || n.type === tab ? { ...n, read: true } : n)));
      toast.success(count ? `${pluralise(count, 'notification')} marked as read` : 'Everything is already read');
    } catch (err) {
      toast.error('Could not mark notifications as read', { description: err.message });
    } finally {
      setMarkingAll(false);
    }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await notificationService.removeAll(tab);
      setData((list) => (list || []).filter((n) => !(tab === 'all' || n.type === tab)));
      toast.success('Notifications cleared', { description: `${pluralise(items.length, 'notification')} removed.` });
      setConfirmClear(false);
    } catch (err) {
      toast.error('Could not clear notifications', { description: err.message });
    } finally {
      setClearing(false);
    }
  };

  const totalUnread = all.filter((n) => !n.read).length;

  let body;
  if (loading) body = <SkeletonRows rows={6} />;
  else if (error) body = <ErrorState title="Couldn't load notifications" error={error} onRetry={reload} />;
  else if (!items.length)
    body = (
      <EmptyState
        icon={BellOff}
        title={EMPTY[tab].title}
        description={EMPTY[tab].description}
        action={
          <Button variant="secondary" leftIcon={Settings2} to={paths.settings}>
            Notification settings
          </Button>
        }
      />
    );
  else body = <NotificationList items={items} onOpen={open} onToggleRead={toggleRead} onDelete={remove} />;

  return (
    <>
      <PageHeader
        title="Notifications"
        badge={totalUnread > 0 ? <Badge tone="brand">{totalUnread} unread</Badge> : null}
        description="Slot alerts, monitoring updates and learner changes in one place."
        actions={
          <>
            <Button variant="secondary" leftIcon={CheckCheck} onClick={markAll} loading={markingAll} disabled={!unreadInTab} className="flex-1 sm:flex-none">
              Mark all as read
            </Button>
            <Button variant="danger-ghost" leftIcon={Trash2} onClick={() => setConfirmClear(true)} disabled={!items.length} className="flex-1 sm:flex-none">
              Clear all
            </Button>
          </>
        }
      />

      <Tabs tabs={tabs.map(({ value, label, count }) => ({ value, label, count }))} value={tab} onChange={setTab} label="Notification types" className="mb-6" />

      <div role="tabpanel" aria-label={current.label}>
        {body}
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
        loading={clearing}
        title={`Clear all${tabLabel} notifications?`}
        description={`This permanently removes ${pluralise(items.length, 'notification')}${tab === 'all' ? '' : ` in ${current.label}`}. Slots and learners are not affected.`}
        confirmLabel="Clear all"
      />
    </>
  );
}
