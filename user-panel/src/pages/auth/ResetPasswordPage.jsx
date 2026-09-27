import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Alert, Button, Input, SuccessState } from '@/components/ui';
import { AuthBody, AuthHeading } from '@/components/auth/AuthHeading';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useForm } from '@/hooks';
import { rules } from '@/utils/validation';
import { paths } from '@/routes/paths';

const schema = {
  email: [rules.required('Email'), rules.email()],
  password: [rules.required('New password'), rules.strongPassword()],
  confirmPassword: [rules.required('Please confirm your new password'), rules.matches('password', 'Passwords do not match.')],
};

export default function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [params] = useSearchParams();
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState('');
  const form = useForm({ email: params.get('email') || '', password: '', confirmPassword: '' }, schema);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError('');
    try {
      await resetPassword({ email: values.email.trim(), password: values.password });
      setDone(true);
      toast.success('Password updated');
    } catch (err) {
      if (err?.field) throw err;
      setFormError(err?.message || 'We could not reset your password. Please try again.');
    }
  });

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <SuccessState
          title="Your password has been reset"
          description="You can now sign in with your new password. For your security, other devices may need to sign in again."
          action={
            <Button to={paths.login} size="lg" rightIcon={ArrowRight}>
              Sign in
            </Button>
          }
        />
      </motion.div>
    );
  }

  return (
    <>
      <AuthHeading icon={ShieldCheck} title="Choose a new password" description="Make it at least 8 characters with upper and lower case letters and a number." />
      <AuthBody>
        {formError && (
          <Alert tone="danger" onDismiss={() => setFormError('')} className="mb-6">
            {formError}
          </Alert>
        )}
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input {...form.field('email')} type="email" label="Email" icon={Mail} autoComplete="email" required />
          <div className="space-y-2.5">
            <Input {...form.field('password')} type="password" label="New password" icon={Lock} autoComplete="new-password" required />
            <PasswordStrength password={form.values.password} />
          </div>
          <Input {...form.field('confirmPassword')} type="password" label="Confirm new password" icon={Lock} autoComplete="new-password" required />
          <Button type="submit" size="lg" fullWidth loading={form.submitting}>
            {form.submitting ? 'Updating password…' : 'Reset password'}
          </Button>
        </form>
        <div className="mt-8 flex justify-center">
          <Link to={paths.login} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </AuthBody>
    </>
  );
}
