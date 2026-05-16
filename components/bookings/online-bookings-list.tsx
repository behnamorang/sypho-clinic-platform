/**
 * @file components/bookings/online-bookings-list.tsx
 * @description Interactive list of online bookings for clinic staff.
 *
 * Features:
 * - Status filter tabs (All / Pending / Confirmed / Cancelled)
 * - Per-row actions: Confirm / Cancel (for permitted roles)
 * - Inline confirmation dialogs using native dialog element
 * - Optimistic UI updates via Server Action calls
 * - Accessible: ARIA live region for action feedback
 *
 * @compliance GDPR — Patient PII displayed to authenticated clinic staff only.
 *             Data access enforced by RLS policies on the server.
 */

'use client';

import { useState, useCallback, useTransition } from 'react';
import Link                                      from 'next/link';
import { confirmBooking, cancelBooking }         from '@/app/(dashboard)/bookings/actions';
import type {
  BookingStatusFilter,
  OnlineBookingRow,
}                                               from '@/app/(dashboard)/bookings/page';
import type { UserRole }                        from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const MANAGEMENT_ROLES: UserRole[] = ['clinic_owner', 'clinic_admin', 'receptionist'];

const STATUS_TABS: { key: BookingStatusFilter; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-700'  },
  confirmed: { label: 'Confirmed', bg: 'bg-success-50', text: 'text-success-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-danger-50',  text: 'text-danger-700' },
  completed: { label: 'Completed', bg: 'bg-surface-100', text: 'text-surface-600' },
  no_show:   { label: 'No Show',   bg: 'bg-surface-100', text: 'text-surface-600' },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatDateTime(isoString: string): { date: string; time: string } {
  const dt = new Date(isoString);
  const date = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

function getDoctorName(row: OnlineBookingRow): string {
  const prefix = row.doctor_title ? `${row.doctor_title} ` : '';
  return `${prefix}${row.doctor_first_name} ${row.doctor_last_name}`;
}

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface OnlineBookingsListProps {
  bookings:      OnlineBookingRow[];
  statusFilter:  BookingStatusFilter;
  statusCounts:  Record<string, number>;
  userRole:      UserRole;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Client component rendering the online bookings table with action controls.
 */
export function OnlineBookingsList({
  bookings,
  statusFilter,
  statusCounts,
  userRole,
}: OnlineBookingsListProps) {
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelTarget, setCancelTarget]       = useState<string | null>(null);
  const [cancelReason, setCancelReason]       = useState('');
  const [isPending, startTransition]          = useTransition();

  const canManage = MANAGEMENT_ROLES.includes(userRole);

  const totalOnline = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  function getTabCount(key: BookingStatusFilter): number {
    if (key === 'all') return totalOnline;
    return statusCounts[key] ?? 0;
  }

  const handleConfirm = useCallback((appointmentId: string) => {
    startTransition(async () => {
      const result = await confirmBooking(appointmentId);
      setFeedbackMsg({
        type: result.ok ? 'success' : 'error',
        text: result.message,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    });
  }, []);

  const handleCancelSubmit = useCallback(() => {
    if (!cancelTarget) return;
    const id     = cancelTarget;
    const reason = cancelReason;
    setCancelTarget(null);
    setCancelReason('');
    startTransition(async () => {
      const result = await cancelBooking(id, reason);
      setFeedbackMsg({
        type: result.ok ? 'success' : 'error',
        text: result.message,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    });
  }, [cancelTarget, cancelReason]);

  return (
    <div>
      {/* Status filter tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count   = getTabCount(tab.key);
          const isActive = statusFilter === tab.key;

          return (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/dashboard/bookings' : `/dashboard/bookings?status=${tab.key}`}
              className={[
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300 hover:text-brand-700',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {count > 0 && (
                <span className={[
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold',
                  isActive ? 'bg-white/30 text-white' : 'bg-surface-100 text-surface-600',
                ].join(' ')}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'mb-4 rounded-lg p-3 flex items-center gap-2 text-sm font-medium',
            feedbackMsg.type === 'success'
              ? 'bg-success-50 text-success-700 border border-success-500/30'
              : 'bg-danger-50 text-danger-700 border border-danger-200',
          ].join(' ')}
        >
          {feedbackMsg.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {feedbackMsg.text}
        </div>
      )}

      {/* Empty state */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-600">
            {statusFilter === 'all'
              ? 'No online bookings yet'
              : `No ${statusFilter} bookings`}
          </p>
          <p className="text-xs text-surface-400 mt-1 max-w-xs mx-auto">
            {statusFilter === 'all'
              ? 'Bookings made through your public portal will appear here.'
              : `There are currently no ${statusFilter} online bookings.`}
          </p>
        </div>
      ) : (
        /* Bookings table */
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" role="table" aria-label="Online bookings">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th scope="col" className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-5 py-3">Patient</th>
                  <th scope="col" className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-4 py-3">Doctor</th>
                  <th scope="col" className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-4 py-3">Service</th>
                  <th scope="col" className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-4 py-3">Date & Time</th>
                  <th scope="col" className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-4 py-3">Status</th>
                  {canManage && (
                    <th scope="col" className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wide px-5 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {bookings.map((booking) => {
                  const { date, time } = formatDateTime(booking.scheduled_at);
                  const statusConf = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG['pending']!;
                  const doctorName = getDoctorName(booking);
                  const isPendingRow   = booking.status === 'pending';
                  const isCancellable = booking.status === 'pending' || booking.status === 'confirmed';

                  return (
                    <tr key={booking.id} className="hover:bg-surface-50/50 transition-colors">
                      {/* Patient */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-surface-900">
                          {booking.patient_first_name} {booking.patient_last_name}
                        </p>
                        {booking.patient_email && (
                          <p className="text-xs text-surface-400 truncate max-w-[160px]">{booking.patient_email}</p>
                        )}
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-surface-700">{doctorName}</p>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {booking.service_color && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: booking.service_color }}
                              aria-hidden="true"
                            />
                          )}
                          <span className="text-sm text-surface-700 truncate max-w-[120px]">
                            {booking.service_name ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-surface-800">{time}</p>
                        <p className="text-xs text-surface-400">{date}</p>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Actions */}
                      {canManage && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPendingRow && (
                              <button
                                onClick={() => handleConfirm(booking.id)}
                                disabled={isPending}
                                className="text-xs font-semibold text-success-700 bg-success-50 hover:bg-success-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                aria-label={`Confirm booking for ${booking.patient_first_name} ${booking.patient_last_name}`}
                              >
                                Confirm
                              </button>
                            )}
                            {isCancellable && (
                              <button
                                onClick={() => { setCancelTarget(booking.id); setCancelReason(''); }}
                                disabled={isPending}
                                className="text-xs font-semibold text-danger-600 bg-danger-50 hover:bg-danger-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                aria-label={`Cancel booking for ${booking.patient_first_name} ${booking.patient_last_name}`}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-surface-100">
            {bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.scheduled_at);
              const statusConf = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG['pending']!;
              const isPendingRow = booking.status === 'pending';
              const isCancellable = booking.status === 'pending' || booking.status === 'confirmed';

              return (
                <div key={booking.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-surface-900">
                        {booking.patient_first_name} {booking.patient_last_name}
                      </p>
                      {booking.patient_email && (
                        <p className="text-xs text-surface-400">{booking.patient_email}</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text}`}>
                      {statusConf.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-surface-600">
                    <div>
                      <p className="text-surface-400 font-medium mb-0.5">Doctor</p>
                      <p>{getDoctorName(booking)}</p>
                    </div>
                    <div>
                      <p className="text-surface-400 font-medium mb-0.5">Service</p>
                      <p>{booking.service_name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-surface-400 font-medium mb-0.5">Date</p>
                      <p>{date}</p>
                    </div>
                    <div>
                      <p className="text-surface-400 font-medium mb-0.5">Time</p>
                      <p>{time}</p>
                    </div>
                  </div>
                  {canManage && (isPendingRow || isCancellable) && (
                    <div className="flex gap-2 pt-1">
                      {isPendingRow && (
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          disabled={isPending}
                          className="flex-1 text-xs font-semibold text-success-700 bg-success-50 hover:bg-success-100 px-3 py-2 rounded-lg"
                        >
                          Confirm
                        </button>
                      )}
                      {isCancellable && (
                        <button
                          onClick={() => { setCancelTarget(booking.id); setCancelReason(''); }}
                          disabled={isPending}
                          className="flex-1 text-xs font-semibold text-danger-600 bg-danger-50 hover:bg-danger-100 px-3 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      {cancelTarget !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
        >
          <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-md p-6">
            <h2 id="cancel-dialog-title" className="text-base font-bold text-surface-900 mb-1">
              Cancel Appointment
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              Are you sure you want to cancel this appointment?
              The patient will be informed.
            </p>

            <div className="mb-4">
              <label
                htmlFor="cancel-reason"
                className="block text-xs font-semibold text-surface-700 mb-1.5"
              >
                Cancellation reason
                <span className="ml-1 text-surface-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="cancel-reason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Doctor unavailable, clinic closed…"
                className="w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-danger-600 hover:bg-danger-700 transition-colors disabled:opacity-60"
              >
                {isPending ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
