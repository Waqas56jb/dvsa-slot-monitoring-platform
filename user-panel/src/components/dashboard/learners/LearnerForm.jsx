import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/ui';
import { useForm } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { learnerService } from '@/services';
import { rules } from '@/utils/validation';
import { addDays, toISODate } from '@/utils/format';
import { PersonalSection, PreferencesSection } from './LearnerFormSections';
import { MonitoringSection, NotificationsSection, NotesSection } from './LearnerFormOptions';

export function buildInitialValues(learner) {
  if (!learner) {
    const now = new Date();
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredDate: toISODate(addDays(now, 14)),
      dateFrom: toISODate(addDays(now, 7)),
      dateTo: toISODate(addDays(now, 45)),
      timeFrom: '09:00',
      timeTo: '12:00',
      centreIds: [],
      excludeWeekends: false,
      monitoringEnabled: true,
      notifications: { browser: true, sound: true, email: false },
      notes: '',
    };
  }
  return {
    firstName: learner.firstName || '',
    lastName: learner.lastName || '',
    email: learner.email || '',
    phone: learner.phone || '',
    preferredDate: learner.preferredDate || '',
    dateFrom: learner.dateFrom || '',
    dateTo: learner.dateTo || '',
    timeFrom: learner.timeFrom || '',
    timeTo: learner.timeTo || '',
    centreIds: learner.centreIds || [],
    excludeWeekends: Boolean(learner.excludeWeekends),
    monitoringEnabled: Boolean(learner.isMonitoring),
    notifications: { browser: false, sound: false, email: false, ...learner.notifications },
    notes: learner.notes || '',
  };
}

const withinRange = (v, all) => {
  if (!v) return '';
  if (all.dateFrom && v < all.dateFrom) return 'Preferred date must be within your search range.';
  if (all.dateTo && v > all.dateTo) return 'Preferred date must be within your search range.';
  return '';
};

function buildSchema(isNew) {
  const notPast = isNew ? [rules.dateNotPast()] : [];
  return {
    firstName: [rules.required('First name'), rules.maxLength(60, 'First name')],
    lastName: [rules.required('Last name'), rules.maxLength(60, 'Last name')],
    email: [rules.required('Email'), rules.email()],
    phone: [rules.ukPhone()],
    preferredDate: [rules.required('Preferred test date'), ...notPast, withinRange],
    dateFrom: [rules.required('Start date'), ...notPast],
    dateTo: [rules.required('End date'), ...notPast, rules.dateAfter('dateFrom')],
    timeFrom: [rules.required('Earliest time')],
    timeTo: [rules.required('Latest time'), rules.timeAfter('timeFrom', 'Latest time must be after the earliest time.')],
    centreIds: [rules.minItems(1, 'Select at least one test centre.')],
  };
}

/** Create / edit learner form. Calls onSaved(learner) after a successful save. */
export function LearnerForm({ learner, onSaved, onCancel }) {
  const isNew = !learner;
  const toast = useToast();
  const [initial] = useState(() => buildInitialValues(learner));
  const form = useForm(initial, buildSchema(isNew));
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submit = form.handleSubmit(async (values) => {
    try {
      const saved = isNew ? await learnerService.create(values) : await learnerService.update(learner.id, values);
      toast.success(isNew ? 'Learner added' : 'Changes saved', {
        description: isNew
          ? `${saved.fullName} was added${values.monitoringEnabled ? ' and monitoring has started' : ''}.`
          : `${saved.fullName}'s details are up to date.`,
      });
      onSaved(saved);
    } catch (err) {
      if (err?.field) throw err;
      toast.error(isNew ? 'Could not add learner' : 'Could not save changes', { description: err?.message });
    }
  });

  const cancel = () => (form.isDirty ? setConfirmOpen(true) : onCancel());

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          <PersonalSection form={form} />
          <PreferencesSection form={form} isNew={isNew} />
          <NotesSection form={form} />
        </div>
        <div className="space-y-5 lg:space-y-6">
          <MonitoringSection form={form} isNew={isNew} />
          <NotificationsSection form={form} />
        </div>
      </div>

      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 border-t border-line bg-canvas/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:static md:mx-0 md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-sm text-muted md:block">{form.isDirty ? 'You have unsaved changes.' : isNew ? 'Fill in the details above to add a learner.' : 'No changes yet.'}</p>
          <div className="flex w-full gap-2 md:w-auto">
            <Button variant="secondary" onClick={cancel} disabled={form.submitting} className="flex-1 md:flex-none">
              Cancel
            </Button>
            <Button type="submit" leftIcon={Save} loading={form.submitting} className="flex-1 md:flex-none">
              Save Learner
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onCancel();
        }}
        tone="warning"
        title="Discard changes?"
        description="You have unsaved changes to this learner. If you leave now they will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
      />
    </form>
  );
}
