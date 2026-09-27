import { MapPinned } from 'lucide-react';
import { CentrePicker } from '@/components/dashboard/CentrePicker';
import { StepHeader } from './OnboardingShell';

export function StepCentres({ form, learnerFirstName }) {
  return (
    <>
      <StepHeader
        icon={MapPinned}
        step="Step 3"
        title="Choose preferred test centres"
        description={`Pick every centre ${learnerFirstName || 'your learner'} could realistically travel to — more centres means more chances of a match.`}
      />
      <CentrePicker id="centreIds" value={form.values.centreIds} onChange={(ids) => form.setValue('centreIds', ids)} error={form.error('centreIds')} label="Test centres" listHeight="max-h-72" />
    </>
  );
}
