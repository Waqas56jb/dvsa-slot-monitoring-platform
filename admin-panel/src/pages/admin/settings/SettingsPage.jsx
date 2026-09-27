import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton, SkeletonText } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/States'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { useAsync } from '@/hooks/useAsync'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { settingsService } from '@/services/settingsService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { cn } from '@/utils/cn'
import { SECTIONS } from './settingsConfig'
import { useSettingsForms } from './useSettingsForms'
import { SettingsForm } from './SettingsForm'
import { GeneralSection, MonitoringSection, NotificationsSection, PlatformSection, SecuritySection } from './SettingsSections'

const SECTION_COMPONENTS = {
  general: GeneralSection,
  monitoring: MonitoringSection,
  notifications: NotificationsSection,
  security: SecuritySection,
  platform: PlatformSection,
}

/** Consequences that need an explicit confirmation before a platform save. */
function platformRisks(prev, next) {
  const risks = []
  if (!prev.maintenanceMode && next.maintenanceMode) risks.push('Maintenance mode blocks every customer from signing in and hides the customer app until it is turned off.')
  if (prev.monitoringEnabled && !next.monitoringEnabled) risks.push('Turning off monitoring pauses every running job. No slot checks or alerts happen until it is turned back on.')
  if (prev.registrationEnabled && !next.registrationEnabled) risks.push('New customers won’t be able to create accounts.')
  return risks
}

export default function SettingsPage() {
  const can = usePermission()
  const readOnly = !can(P.SETTINGS_MANAGE)
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const [params, setParams] = useSearchParams()
  const { data, loading, error, reload } = useAsync(() => settingsService.getSettings(), [])
  const forms = useSettingsForms(data)

  const active = SECTIONS.some((s) => s.key === params.get('section')) ? params.get('section') : SECTIONS[0].key
  const select = (key) => setParams((prev) => { const n = new URLSearchParams(prev); n.set('section', key); return n }, { replace: true })

  const anyDirty = Object.values(forms.dirty).some(Boolean)
  useEffect(() => {
    if (!anyDirty) return
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [anyDirty])

  const submit = useCallback(async (section) => {
    const { ok, values } = forms.validate(section)
    if (!ok) { toast.error('Check the highlighted fields and try again.'); return }

    const risks = section === 'platform' ? platformRisks(forms.saved.platform, values) : []
    if (risks.length) {
      confirm({
        title: 'Apply platform changes?',
        description: 'These changes affect every customer immediately.',
        confirmLabel: 'Apply changes',
        tone: 'warning',
        children: (
          <ul className="space-y-2">
            {risks.map((r) => <li key={r} className="rounded-lg bg-warning-soft px-3 py-2 text-[13px] text-warning">{r}</li>)}
          </ul>
        ),
        onConfirm: async () => { await forms.commit(section, values); toast.success('Settings saved.') },
      })
      return
    }

    try {
      await forms.commit(section, values)
      toast.success('Settings saved.')
    } catch (err) {
      toast.error(err.message || 'Unable to save settings. Please try again.')
    }
  }, [forms, confirm, toast])

  const meta = SECTIONS.find((s) => s.key === active)
  const Section = SECTION_COMPONENTS[active]

  return (
    <>
      <PageHeader title="Settings" description="Platform-wide configuration. Every change is recorded in the audit log." />

      {readOnly && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-line bg-subtle px-4 py-3 text-sm text-ink-2" role="note">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
          <p>You have view-only access. Only Super Admins can change platform settings.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <nav aria-label="Settings sections" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto border-b border-line scrollbar-none lg:flex-col lg:overflow-visible lg:border-b-0">
            {SECTIONS.map((s) => {
              const on = s.key === active
              const Icon = s.icon
              return (
                <li key={s.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => select(s.key)}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'relative flex w-full items-center gap-2.5 px-3 text-sm font-medium whitespace-nowrap transition-colors',
                      'h-10 border-b-2 lg:h-9 lg:rounded-lg lg:border-b-0',
                      on ? 'border-brand-600 text-ink lg:bg-subtle' : 'border-transparent text-ink-3 hover:text-ink lg:hover:bg-subtle/60',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', on ? 'text-brand-600 dark:text-brand-300' : 'text-ink-4')} aria-hidden />
                    {s.label}
                    {forms.dirty[s.key] && <span className="h-1.5 w-1.5 rounded-full bg-warning-dot lg:ml-auto" title="Unsaved changes"><span className="sr-only">(unsaved changes)</span></span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="min-w-0">
          {error ? (
            <div className="card"><ErrorState message="Unable to load settings. Please try again." onRetry={reload} /></div>
          ) : loading || !forms.ready ? (
            <div className="card p-5 sm:p-6" aria-busy="true" aria-label="Loading settings">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-64" />
              <div className="mt-6 space-y-6">{[0, 1, 2, 3].map((i) => <SkeletonText key={i} lines={2} />)}</div>
            </div>
          ) : (
            <SettingsForm
              key={active}
              section={active}
              title={meta.label}
              description={meta.description}
              dirty={!!forms.dirty[active]}
              saving={forms.saving === active}
              readOnly={readOnly}
              onSubmit={() => submit(active)}
              onReset={() => forms.reset(active)}
            >
              <Section
                values={forms.draft[active]}
                saved={forms.saved[active]}
                errors={forms.errors[active] || {}}
                set={(key) => (v) => forms.setField(active, key, v?.target ? v.target.value : v)}
              />
            </SettingsForm>
          )}
        </div>
      </div>
      {confirmElement}
    </>
  )
}
