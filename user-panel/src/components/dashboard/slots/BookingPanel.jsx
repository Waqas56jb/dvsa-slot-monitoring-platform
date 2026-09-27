import { X, CircleCheck, Clock4, EyeOff, Zap } from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { OpenBookingButton, BookingControlNote } from '@/components/dashboard/OfficialBooking';
import { formatRelative } from '@/utils/format';

/** Sticky call-to-action panel: open the official booking service or dismiss. */
export function BookingPanel({ slot, onActioned, onDismiss }) {
  const expired = slot.status === 'expired';
  const dismissed = slot.status === 'dismissed';
  const closed = expired || dismissed;

  return (
    <section aria-labelledby="booking-panel-title" className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      {!closed && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand/70 to-success" aria-hidden="true" />}
      <div className="flex items-center gap-2 text-sm font-medium text-brand-ink">
        <Zap className="size-4" aria-hidden="true" />
        {closed ? 'No longer bookable' : 'Act quickly'}
      </div>
      <h2 id="booking-panel-title" className="mt-2 text-xl font-semibold text-ink">
        {closed ? 'This slot is closed' : 'Ready to book this slot?'}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {closed
          ? 'You can still review the details, but booking is unavailable for this match.'
          : 'Open the official GOV.UK service in a new tab, sign in and complete the booking yourself.'}
      </p>

      {expired && (
        <Alert tone="neutral" icon={Clock4} className="mt-4">
          This slot has expired — availability changed since it was detected.
        </Alert>
      )}
      {dismissed && (
        <Alert tone="neutral" icon={EyeOff} className="mt-4">
          You dismissed this slot, so booking is disabled.
        </Alert>
      )}
      {slot.status === 'actioned' && (
        <Alert tone="success" icon={CircleCheck} className="mt-4">
          You opened the official booking service {slot.actionedAt ? formatRelative(slot.actionedAt) : 'for this slot'}. Open it again if needed.
        </Alert>
      )}

      <div className="mt-5 space-y-2">
        {closed ? (
          <Button size="lg" fullWidth disabled aria-disabled="true">
            Open Official Booking
          </Button>
        ) : (
          <OpenBookingButton slot={slot} size="lg" fullWidth onActioned={onActioned} />
        )}
        {!dismissed && (
          <Button variant="ghost" fullWidth leftIcon={X} onClick={onDismiss}>
            Dismiss Slot
          </Button>
        )}
      </div>

      <BookingControlNote className="mt-5 border-t border-line pt-4" />
    </section>
  );
}
