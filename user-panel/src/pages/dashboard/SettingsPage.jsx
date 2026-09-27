import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader, SkeletonCard, ErrorState } from '@/components/ui';
import { SettingsNav, SETTINGS_SECTIONS } from '@/components/dashboard/account/SettingsNav';
import { SettingsAccount } from '@/components/dashboard/account/SettingsAccount';
import { SettingsNotifications } from '@/components/dashboard/account/SettingsNotifications';
import { SettingsMonitoring } from '@/components/dashboard/account/SettingsMonitoring';
import { ChangePasswordCard } from '@/components/dashboard/account/ChangePasswordCard';
import { ActiveSessionsCard } from '@/components/dashboard/account/ActiveSessionsCard';
import { SettingsAppearance } from '@/components/dashboard/account/SettingsAppearance';
import { userService } from '@/services';
import { useDocumentTitle, useResource } from '@/hooks';

const VALID = SETTINGS_SECTIONS.map((s) => s.value);

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const section = VALID.includes(params.get('section')) ? params.get('section') : 'account';
  const meta = SETTINGS_SECTIONS.find((s) => s.value === section);
  useDocumentTitle(`${meta.label} settings`);

  const { data: prefs, setData, loading, error, reload } = useResource(() => userService.getPreferences(), []);

  const go = (value) => setParams(value === 'account' ? {} : { section: value }, { replace: true });

  const needsPrefs = section === 'notifications' || section === 'monitoring';
  let content;
  if (needsPrefs && loading) content = <SkeletonCard lines={5} />;
  else if (needsPrefs && (error || !prefs)) content = <ErrorState title="Couldn't load your preferences" error={error} onRetry={reload} />;
  else if (section === 'account') content = <SettingsAccount onReset={() => reload({ silent: true })} />;
  else if (section === 'notifications') content = <SettingsNotifications prefs={prefs.notifications} onSaved={setData} />;
  else if (section === 'monitoring') content = <SettingsMonitoring prefs={prefs.monitoring} onSaved={setData} />;
  else if (section === 'security')
    content = (
      <div className="space-y-5 lg:space-y-6">
        <ChangePasswordCard />
        <ActiveSessionsCard />
      </div>
    );
  else content = <SettingsAppearance />;

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, alerts, monitoring defaults and security." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <SettingsNav value={section} onChange={go} />
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              role="region"
              aria-label={`${meta.label} settings`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
