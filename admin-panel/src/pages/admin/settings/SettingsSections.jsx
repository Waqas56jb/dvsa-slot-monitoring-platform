import { AlertTriangle, ServerCog } from 'lucide-react'
import { FormField, Input, Select } from '@/components/forms/Fields'
import { Badge } from '@/components/common/StatusBadge'
import { SettingGroup, SettingRow, ToggleRow, Unit } from './SettingsForm'
import { CURRENCIES, INTERVALS, TIMEZONES } from './settingsConfig'

/**
 * Field layouts for each settings section. Each receives
 * { values, errors, set(key) → (valueOrEvent) => void, saved }.
 */

const NumberField = ({ p, value, onChange, unit, min, max }) => (
  <Input {...p} type="number" inputMode="numeric" min={min} max={max} step={1} value={value} onChange={onChange} suffix={unit && <Unit>{unit}</Unit>} className="tabular" />
)

export function GeneralSection({ values, errors, set }) {
  return (
    <>
      <SettingRow label="Platform name" description="Shown in emails, alerts and the customer app." error={errors.platformName} required>
        {(p) => <Input {...p} value={values.platformName} onChange={set('platformName')} maxLength={40} autoComplete="off" />}
      </SettingRow>
      <SettingRow label="Support email" description="Where customer replies and help requests are sent." error={errors.supportEmail} required>
        {(p) => <Input {...p} type="email" value={values.supportEmail} onChange={set('supportEmail')} autoComplete="off" />}
      </SettingRow>
      <SettingRow label="Default timezone" description="Used for test dates, quiet hours and reports." error={errors.timezone}>
        {(p) => <Select {...p} value={values.timezone} onChange={set('timezone')} options={TIMEZONES} />}
      </SettingRow>
      <SettingRow label="Default currency" description="Used for plan pricing and payment reports." error={errors.currency}>
        {(p) => <Select {...p} value={values.currency} onChange={set('currency')} options={CURRENCIES} />}
      </SettingRow>
    </>
  )
}

export function MonitoringSection({ values, errors, set }) {
  return (
    <>
      <SettingRow label="Default check interval" description="How often new jobs look for released slots. Shorter intervals increase load." error={errors.defaultInterval}>
        {(p) => <Select {...p} value={String(values.defaultInterval)} onChange={set('defaultInterval')} options={INTERVALS} />}
      </SettingRow>
      <SettingRow label="Maximum active jobs" description="Platform-wide cap on running monitoring jobs. New jobs queue once reached." error={errors.maxActiveJobs}>
        {(p) => <NumberField p={p} value={values.maxActiveJobs} onChange={set('maxActiveJobs')} unit="jobs" min={1} max={100000} />}
      </SettingRow>
      <SettingRow label="Data retention" description="How long slot and check history is kept before deletion." error={errors.retentionDays}>
        {(p) => <NumberField p={p} value={values.retentionDays} onChange={set('retentionDays')} unit="days" min={7} max={730} />}
      </SettingRow>
      <SettingRow label="Maximum centres per job" description="How many test centres a learner can watch in one job." error={errors.maxCentresPerJob}>
        {(p) => <NumberField p={p} value={values.maxCentresPerJob} onChange={set('maxCentresPerJob')} min={1} max={50} />}
      </SettingRow>
      <ToggleRow
        label="Pause on repeated failures"
        description="Automatically pause a job after consecutive failed checks and notify operations."
        checked={values.pauseOnRepeatedFailures}
        onChange={set('pauseOnRepeatedFailures')}
      />
    </>
  )
}

export function NotificationsSection({ values, errors, set, saved }) {
  const smsConfigured = !!saved.smsProviderConfigured
  return (
    <>
      <SettingGroup legend="Alert channels" description="Channels available to customers for slot alerts." error={errors.channels}>
        <ToggleRow label="Email alerts" description="Sent from the platform’s verified sending domain." checked={values.emailEnabled} onChange={set('emailEnabled')} />
        <ToggleRow label="Browser alerts" description="Push notifications in the customer web app." checked={values.browserEnabled} onChange={set('browserEnabled')} />
        <ToggleRow
          label="SMS alerts"
          description="Text messages for Premium plans. Charged per message by the provider."
          checked={values.smsEnabled}
          onChange={set('smsEnabled')}
          extra={values.smsEnabled && !smsConfigured && (
            <p className="flex items-center gap-1.5 text-xs text-warning"><AlertTriangle className="h-3.5 w-3.5" aria-hidden />SMS won’t send until a provider is configured on the server.</p>
          )}
        />
      </SettingGroup>

      <div className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,280px)] sm:items-start sm:gap-8">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">SMS provider</p>
          <p className="mt-0.5 text-[13px] text-ink-3">Credentials are stored in server environment variables and are never shown or edited here.</p>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-line bg-subtle/60 px-3 py-2.5">
          <ServerCog className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">Status</span>
          <Badge tone={smsConfigured ? 'success' : 'warning'} dot>{smsConfigured ? 'Configured on server' : 'Not configured'}</Badge>
        </div>
      </div>

      <SettingRow label="Daily alert cap" description="Maximum alerts a single customer can receive per day across all channels." error={errors.dailyAlertCap}>
        {(p) => <NumberField p={p} value={values.dailyAlertCap} onChange={set('dailyAlertCap')} unit="/day" min={1} max={500} />}
      </SettingRow>

      <SettingGroup legend="Quiet hours" description="Email and SMS alerts are held until quiet hours end. Times use the platform timezone.">
        <div className="grid gap-4 pt-3 sm:grid-cols-2">
          <TimeField label="Starts" value={values.quietHoursStart} onChange={set('quietHoursStart')} error={errors.quietHoursStart} />
          <TimeField label="Ends" value={values.quietHoursEnd} onChange={set('quietHoursEnd')} error={errors.quietHoursEnd} />
        </div>
      </SettingGroup>
    </>
  )
}

function TimeField({ label, value, onChange, error }) {
  return (
    <FormField label={label} error={error}>
      {(p) => <Input {...p} type="time" value={value} onChange={onChange} className="tabular" />}
    </FormField>
  )
}

export function SecuritySection({ values, errors, set }) {
  const weak = Number(values.passwordMinLength) < 12
  return (
    <>
      <SettingRow label="Admin session timeout" description="Signs admins out after this much inactivity." error={errors.sessionTimeout}>
        {(p) => <NumberField p={p} value={values.sessionTimeout} onChange={set('sessionTimeout')} unit="min" min={5} max={480} />}
      </SettingRow>
      <SettingRow label="Minimum password length" description={weak && !errors.passwordMinLength ? 'We recommend at least 12 characters.' : 'Applies to admins and customers at their next password change.'} error={errors.passwordMinLength}>
        {(p) => <NumberField p={p} value={values.passwordMinLength} onChange={set('passwordMinLength')} unit="chars" min={8} max={128} />}
      </SettingRow>
      <ToggleRow label="Require two-factor authentication" description="Admins must set up 2FA before they can access the admin panel." checked={values.requireTwoFactor} onChange={set('requireTwoFactor')} />
      <SettingRow label="Failed sign-in limit" description="Consecutive failed attempts before an account is locked." error={errors.loginAttemptLimit}>
        {(p) => <NumberField p={p} value={values.loginAttemptLimit} onChange={set('loginAttemptLimit')} unit="tries" min={3} max={20} />}
      </SettingRow>
      <SettingRow label="Lockout duration" description="How long a locked account stays locked." error={errors.lockoutMinutes}>
        {(p) => <NumberField p={p} value={values.lockoutMinutes} onChange={set('lockoutMinutes')} unit="min" min={1} max={1440} />}
      </SettingRow>
    </>
  )
}

export function PlatformSection({ values, set, saved }) {
  return (
    <>
      <ToggleRow
        label="Maintenance mode"
        description="Shows a maintenance page to customers and blocks sign-in. Admins keep access."
        checked={values.maintenanceMode}
        onChange={set('maintenanceMode')}
        extra={saved.maintenanceMode && <Badge tone="warning" dot pulse>Maintenance mode is on</Badge>}
      />
      <ToggleRow label="New registrations" description="Allow new customers to create accounts." checked={values.registrationEnabled} onChange={set('registrationEnabled')} />
      <ToggleRow
        label="Slot monitoring"
        description="When off, every monitoring job pauses and no slot checks run."
        checked={values.monitoringEnabled}
        onChange={set('monitoringEnabled')}
        extra={!saved.monitoringEnabled && <Badge tone="danger" dot>Monitoring is paused platform-wide</Badge>}
      />
    </>
  )
}
