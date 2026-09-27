import { passwordStrength } from '@/utils/validation';
import { cn } from '@/utils/cn';

const levels = [
  { label: 'Too weak', bar: 'bg-danger', text: 'text-danger-ink' },
  { label: 'Weak', bar: 'bg-danger', text: 'text-danger-ink' },
  { label: 'Fair', bar: 'bg-warning', text: 'text-warning-ink' },
  { label: 'Good', bar: 'bg-success', text: 'text-success-ink' },
  { label: 'Strong', bar: 'bg-success', text: 'text-success-ink' },
];

/** 4-segment password strength meter. Hidden until the user starts typing. */
export function PasswordStrength({ password = '', className }) {
  if (!password) {
    return <p className={cn('text-[13px] text-muted', className)}>Use 8+ characters with upper and lower case letters and a number.</p>;
  }
  const score = passwordStrength(password);
  const level = levels[score];
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1.5 rounded-full transition-colors duration-300', i < score ? level.bar : 'bg-surface-sunken')} />
        ))}
      </div>
      <span className={cn('w-16 text-right text-xs font-semibold', level.text)} aria-live="polite">
        <span className="sr-only">Password strength: </span>
        {level.label}
      </span>
    </div>
  );
}
