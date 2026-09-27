import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone } from 'lucide-react';
import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { AuthBody, AuthHeading, AuthSwitch } from '@/components/auth/AuthHeading';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Divider } from '@/components/auth/Divider';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useForm } from '@/hooks';
import { rules } from '@/utils/validation';
import { paths } from '@/routes/paths';

const schema = {
  firstName: [rules.required('First name')],
  lastName: [rules.required('Last name')],
  email: [rules.required('Email'), rules.email()],
  phone: [rules.required('Phone number'), rules.ukPhone()],
  password: [rules.required('Password'), rules.strongPassword()],
  confirmPassword: [rules.required('Please confirm your password'), rules.matches('password', 'Passwords do not match.')],
  terms: [rules.checked('Please agree to the Terms and Privacy Policy to continue.')],
};

const initial = { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false };

const linkCls = 'font-medium text-brand hover:text-brand-hover hover:underline underline-offset-4';

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const form = useForm(initial, schema);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError('');
    try {
      const user = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast.success('Account created', { description: `Welcome to SlotPilot, ${user.firstName}. Let’s set up your first learner.` });
      navigate(paths.onboarding, { replace: true });
    } catch (err) {
      if (err?.field) throw err; // mapped onto the field by useForm
      setFormError(err?.message || 'We could not create your account. Please try again.');
    }
  });

  return (
    <>
      <AuthHeading eyebrow="Create your account" title="Start monitoring smarter." description="Set up your workspace in a couple of minutes. You always complete bookings yourself on GOV.UK." />
      <AuthBody>
        {formError && (
          <Alert tone="danger" onDismiss={() => setFormError('')} className="mb-6">
            {formError}
          </Alert>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input {...form.field('firstName')} label="First name" autoComplete="given-name" required />
            <Input {...form.field('lastName')} label="Last name" autoComplete="family-name" required />
          </div>
          <Input {...form.field('email')} type="email" label="Email" icon={Mail} autoComplete="email" placeholder="you@example.co.uk" required />
          <Input {...form.field('phone')} type="tel" label="Phone" icon={Phone} autoComplete="tel" placeholder="07700 900123" hint="UK mobile or landline." required />
          <div className="space-y-2.5">
            <Input {...form.field('password')} type="password" label="Password" icon={Lock} autoComplete="new-password" required />
            <PasswordStrength password={form.values.password} />
          </div>
          <Input {...form.field('confirmPassword')} type="password" label="Confirm password" icon={Lock} autoComplete="new-password" required />

          <Checkbox
            id="terms"
            name="terms"
            checked={form.values.terms}
            onChange={(e) => form.setValue('terms', e.target.checked)}
            error={form.error('terms')}
            label={
              <>
                I agree to the{' '}
                <Link to={paths.terms} className={linkCls}>
                  Terms
                </Link>{' '}
                and{' '}
                <Link to={paths.privacy} className={linkCls}>
                  Privacy Policy
                </Link>
                .
              </>
            }
          />

          <Button type="submit" size="lg" fullWidth loading={form.submitting}>
            {form.submitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <Divider />
        <GoogleButton label="Sign up with Google" />

        <AuthSwitch>
          Already have an account?{' '}
          <Link to={paths.login} className="font-semibold text-brand hover:text-brand-hover hover:underline underline-offset-4">
            Sign in
          </Link>
        </AuthSwitch>
      </AuthBody>
    </>
  );
}
