import { useState } from 'react';
import { UserRound, Building2, Mail, Phone, Save, RotateCcw } from 'lucide-react';
import { Button, Card, CardHeader, Input } from '@/components/ui';
import { useForm } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services';
import { rules } from '@/utils/validation';
import { AvatarUpload } from './AvatarUpload';

const pickProfile = (p) => ({
  firstName: p.firstName || '',
  lastName: p.lastName || '',
  email: p.email || '',
  phone: p.phone || '',
  businessName: p.businessName || '',
  role: p.role || '',
  avatarUrl: p.avatarUrl || '',
});

const schema = {
  firstName: [rules.required('First name'), rules.maxLength(60, 'First name')],
  lastName: [rules.required('Last name'), rules.maxLength(60, 'Last name')],
  email: [rules.required('Email'), rules.email()],
  phone: [rules.ukPhone()],
  businessName: [rules.maxLength(80, 'Business name')],
  role: [rules.maxLength(60, 'Role')],
};

export function ProfileForm({ profile }) {
  const toast = useToast();
  const [initial, setInitial] = useState(() => pickProfile(profile));
  const form = useForm(initial, schema);
  const fullName = `${form.values.firstName} ${form.values.lastName}`.trim();

  const submit = form.handleSubmit(async (values) => {
    try {
      const saved = pickProfile(await userService.updateProfile(values));
      setInitial(saved);
      form.reset(saved);
      toast.success('Profile updated', { description: 'Your changes have been saved.' });
    } catch (err) {
      if (err?.field) {
        toast.error('Please check the highlighted field', { description: err.message });
        throw err;
      }
      toast.error('Could not save your profile', { description: err?.message });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5 lg:space-y-6">
      <Card as="section" aria-labelledby="profile-personal">
        <CardHeader icon={UserRound} title={<span id="profile-personal">Personal information</span>} description="How you appear across SlotPilot." />
        <AvatarUpload name={fullName} value={form.values.avatarUrl} onChange={(v) => form.setValue('avatarUrl', v)} />
        <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <Input {...form.field('firstName')} label="First name" autoComplete="given-name" required />
          <Input {...form.field('lastName')} label="Last name" autoComplete="family-name" required />
          <Input {...form.field('email')} type="email" label="Email" icon={Mail} autoComplete="email" required hint="Used to sign in and for email alerts." />
          <Input {...form.field('phone')} type="tel" label="Phone" icon={Phone} autoComplete="tel" optional />
        </div>
      </Card>

      <Card as="section" aria-labelledby="profile-business">
        <CardHeader icon={Building2} title={<span id="profile-business">Business information</span>} description="Optional — helps personalise your workspace." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.field('businessName')} label="Business name" autoComplete="organization" optional placeholder="e.g. Malik Driving School" />
          <Input {...form.field('role')} label="Role" autoComplete="organization-title" optional placeholder="e.g. Lead Instructor" />
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {form.isDirty && (
          <Button variant="ghost" leftIcon={RotateCcw} onClick={() => form.reset(initial)} disabled={form.submitting}>
            Discard changes
          </Button>
        )}
        <Button type="submit" leftIcon={Save} loading={form.submitting} disabled={!form.isDirty}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
