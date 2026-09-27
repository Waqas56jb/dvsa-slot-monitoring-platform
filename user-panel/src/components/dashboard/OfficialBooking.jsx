import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { slotService } from '@/services';
import { OFFICIAL_BOOKING_URLS } from '@/config/app';
import { cn } from '@/utils/cn';

/**
 * Opens the official GOV.UK booking service in a new tab and records the
 * slot as "actioned". SlotPilot never automates the booking itself.
 */
export function OpenBookingButton({ slot, label = 'Open Official Booking', size = 'md', variant = 'primary', fullWidth, className, onActioned }) {
  const toast = useToast();
  const handleClick = async () => {
    if (!slot) return;
    const updated = await slotService.markActioned(slot.id).catch(() => null);
    toast.info('Official booking opened in a new tab', {
      description: 'Complete the booking and confirmation yourself on the official service.',
    });
    if (updated) onActioned?.(updated);
  };
  return (
    <Button
      href={OFFICIAL_BOOKING_URLS.change}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      rightIcon={ExternalLink}
      className={className}
      aria-label={`${label} (opens the official GOV.UK service in a new tab)`}
    >
      {label}
    </Button>
  );
}

/** Reminder that the user stays in control of the final booking step. */
export function BookingControlNote({ className, compact }) {
  return (
    <p className={cn('flex items-start gap-2 text-[13px] leading-relaxed text-muted', className)}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
      {compact
        ? 'You complete the booking yourself on the official service.'
        : 'Availability may change quickly. Complete the relevant official booking process yourself — SlotPilot never books on your behalf.'}
    </p>
  );
}
