/**
 * @file components/calendar/appointment-modal.tsx
 * @description Appointment detail and status-management modal.
 *
 * Allows clinic staff to:
 * - View full appointment details
 * - Update appointment status (confirm, check-in, complete, cancel, etc.)
 * - Cancel with a reason
 * - See patient and doctor info at a glance
 *
 * All status mutations go through the `updateAppointmentStatusAction` Server Action.
 *
 * @compliance GDPR — Clinical notes are displayed but NOT exported or logged here.
 */

'use client';

import { useState, useTransition } from 'react';
import { updateAppointmentStatusAction } from '@/app/(dashboard)/calendar/actions';
import { formatTime, formatDuration }    from '@/lib/utils/date';
import type { AppointmentWithRelations } from '@/types/calendar';
import type { AppointmentStatus }        from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Status transition map — defines valid next statuses per current status
// ---------------------------------------------------------------------------

const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending:     ['confirmed', 'cancelled', 'no_show'],
  confirmed:   ['checked_in', 'cancelled', 'no_show', 'rescheduled'],
  checked_in:  ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
  no_show:     [],
  rescheduled: ['confirmed', 'cancelled'],
};

// Status labels and button styles
const STATUS_ACTION_LABELS: Partial<Record<AppointmentStatus, { label: string; style: string }>> = {
  confirmed:   { label: 'Confirm',   style: 'bg-brand-600 text-white hover:bg-brand-700' },
  checked_in:  { label: 'Check In',  style: 'bg-accent-600 text-white hover:bg-accent-700' },
  in_progress: { label: 'Start',     style: 'bg-violet-600 text-white hover:bg-violet-700' },
  completed:   { label: 'Complete',  style: 'bg-success-600 text-white hover:bg-success-700' },
  cancelled:   { label: 'Cancel',    style: 'bg-danger-600 text-white hover:bg-danger-700' },
  no_show:     { label: 'No Show',   style: 'bg-surface-600 text-white hover:bg-surface-700' },
  rescheduled: { label: 'Reschedule',style: 'bg-sky-600 text-white hover:bg-sky-700' },
};

// Status display badge styles
const STATUS_BADGE_STYLES: Record<AppointmentStatus, string> = {
  pending:     'bg-amber-100 text-amber-800',
  confirmed:   'bg-brand-100 text-brand-800',
  checked_in:  'bg-accent-100 text-accent-800',
  in_progress: 'bg-violet-100 text-violet-800',
  completed:   'bg-green-100 text-green-800',
  cancelled:   'bg-danger-100 text-danger-700',
  no_show:     'bg-surface-200 text-surface-600',
  rescheduled: 'bg-sky-100 text-sky-800',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppointmentModalProps {
  isOpen:             boolean;
  onClose:            () => void;
  appointment:        AppointmentWithRelations | null;
  onStatusUpdated:    (id: string, status: AppointmentStatus, cancellationReason?: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Modal to view appointment details and perform status transitions.
 */
export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  onStatusUpdated,
}: AppointmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelForm,  setShowCancelForm]  = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const transitions = STATUS_TRANSITIONS[appointment.status] ?? [];
  const formattedDate = new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
  const doctorLabel = [appointment.doctor.title, appointment.doctor.first_name, appointment.doctor.last_name]
    .filter(Boolean)
    .join(' ');

  // ── Status update handler ─────────────────────────────────────────────
  const handleStatusUpdate = (newStatus: AppointmentStatus) => {
    if (newStatus === 'cancelled') {
      setShowCancelForm(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointment_id: appointment.id,
        status:         newStatus,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onStatusUpdated(appointment.id, newStatus);
      onClose();
    });
  };

  const handleCancelSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointment_id:      appointment.id,
        status:              'cancelled',
        cancellation_reason: cancellationReason || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onStatusUpdated(appointment.id, 'cancelled', cancellationReason || undefined);
      onClose();
    });
  };

  const statusLabel = appointment.status.replace(/_/g, ' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appt-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-sm flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <h2 id="appt-modal-title" className="text-base font-semibold text-surface-900">
              Appointment
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE_STYLES[appointment.status]}`}>
              {statusLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
            aria-label="Close appointment details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {error && (
            <div role="alert" className="px-3 py-2 rounded-lg bg-danger-50 border border-danger-100 text-sm text-danger-700">
              {error}
            </div>
          )}

          {/* Patient row */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-brand-700">
                {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-surface-900 text-sm">
                {appointment.patient.first_name} {appointment.patient.last_name}
              </p>
              <p className="text-xs text-surface-500">Patient</p>
            </div>
          </div>

          {/* Details grid */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-surface-500">Doctor</dt>
              <dd className="font-medium text-surface-800 mt-0.5">{doctorLabel}</dd>
            </div>
            {appointment.appointment_type && (
              <div>
                <dt className="text-xs text-surface-500">Type</dt>
                <dd className="font-medium text-surface-800 mt-0.5 flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: appointment.appointment_type.color }}
                    aria-hidden="true"
                  />
                  {appointment.appointment_type.name}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-surface-500">Date</dt>
              <dd className="font-medium text-surface-800 mt-0.5">{formattedDate}</dd>
            </div>
            <div>
              <dt className="text-xs text-surface-500">Time</dt>
              <dd className="font-medium text-surface-800 mt-0.5">
                {formatTime(appointment.scheduled_at)}
                {' · '}
                <span className="text-surface-500">{formatDuration(appointment.duration_minutes)}</span>
              </dd>
            </div>
          </dl>

          {/* Chief complaint */}
          {appointment.chief_complaint && (
            <div className="bg-surface-50 rounded-lg px-3 py-2.5">
              <p className="text-xs text-surface-500 mb-1">Chief Complaint</p>
              <p className="text-sm text-surface-700">{appointment.chief_complaint}</p>
            </div>
          )}

          {/* Cancellation reason (if already cancelled) */}
          {appointment.status === 'cancelled' && appointment.cancellation_reason && (
            <div className="bg-danger-50 rounded-lg px-3 py-2.5">
              <p className="text-xs text-danger-600 mb-1">Cancellation Reason</p>
              <p className="text-sm text-danger-700">{appointment.cancellation_reason}</p>
            </div>
          )}

          {/* Cancel form */}
          {showCancelForm && (
            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <label htmlFor="cancel-reason" className="block text-xs font-medium text-surface-700">
                Cancellation Reason <span className="text-surface-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="cancel-reason"
                rows={2}
                maxLength={500}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for cancellation…"
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-danger-500 resize-none placeholder:text-surface-400"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 border border-surface-200 hover:bg-surface-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  aria-busy={isPending}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-danger-600 text-white hover:bg-danger-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isPending && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Confirm Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Status action buttons */}
        {!showCancelForm && transitions.length > 0 && (
          <div className="px-5 pb-4 pt-2 border-t border-surface-100 space-y-2">
            <p className="text-xs text-surface-500 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {transitions.map((nextStatus) => {
                const action = STATUS_ACTION_LABELS[nextStatus];
                if (!action) return null;
                return (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={isPending}
                    aria-busy={isPending}
                    className={[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50',
                      action.style,
                    ].join(' ')}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Close button when no transitions */}
        {!showCancelForm && transitions.length === 0 && (
          <div className="px-5 pb-4 pt-2 border-t border-surface-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-surface-700 border border-surface-200 hover:bg-surface-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
