/**
 * @file components/calendar/booking-modal.tsx
 * @description Tight modal form for creating a new appointment from a clicked time slot.
 *
 * Features:
 * - Patient search with client-side filtering (no extra roundtrip)
 * - Doctor selection
 * - Appointment type selection (auto-fills duration)
 * - Date/time pre-filled from the clicked slot
 * - Zod validation surfaced as field-level errors
 * - Calls `createAppointmentAction` Server Action
 *
 * @compliance GDPR — Form does NOT log or expose patient PII to console.
 *             Patients are pre-loaded from the server and filtered client-side.
 */

'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { createAppointmentAction }  from '@/app/(dashboard)/calendar/actions';
import { buildLocalISO }            from '@/lib/utils/date';
import type { CalendarPatient, CalendarDoctor, CalendarAppointmentType } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingModalProps {
  isOpen:            boolean;
  onClose:           () => void;
  /** Pre-filled from the clicked time slot. */
  initialDate:       Date;
  initialHour:       number;
  initialMinute:     number;
  patients:          CalendarPatient[];
  doctors:           CalendarDoctor[];
  appointmentTypes:  CalendarAppointmentType[];
  onCreated:         (appointmentId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Controlled modal component for booking a new appointment.
 * Must be rendered always (for animation purposes) and visibility controlled by `isOpen`.
 */
export function BookingModal({
  isOpen,
  onClose,
  initialDate,
  initialHour,
  initialMinute,
  patients,
  doctors,
  appointmentTypes,
  onCreated,
}: BookingModalProps) {
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ─────────────────────────────────────────────────────────
  const [patientSearch,  setPatientSearch]  = useState('');
  const [patientId,      setPatientId]      = useState('');
  const [doctorId,       setDoctorId]       = useState(doctors[0]?.id ?? '');
  const [typeId,         setTypeId]         = useState(appointmentTypes[0]?.id ?? '');
  const [date,           setDate]           = useState(
    `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`,
  );
  const [time,           setTime]           = useState(
    `${String(initialHour).padStart(2, '0')}:${String(initialMinute).padStart(2, '0')}`,
  );
  const [duration,       setDuration]       = useState(
    appointmentTypes[0]?.duration_minutes ?? 30,
  );
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [fieldError,     setFieldError]     = useState<Record<string, string>>({});
  const [globalError,    setGlobalError]    = useState<string | null>(null);

  // Sync duration when appointment type changes
  useEffect(() => {
    const selected = appointmentTypes.find((t) => t.id === typeId);
    if (selected) setDuration(selected.duration_minutes);
  }, [typeId, appointmentTypes]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
      // Reset errors on open
      setFieldError({});
      setGlobalError(null);
    }
  }, [isOpen]);

  // Update date/time when slot changes
  useEffect(() => {
    setDate(
      `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`,
    );
    setTime(
      `${String(initialHour).padStart(2, '0')}:${String(initialMinute).padStart(2, '0')}`,
    );
  }, [initialDate, initialHour, initialMinute]);

  // ── Filtered patient list ───────────────────────────────────────────────
  const filteredPatients = patientSearch.trim().length > 0
    ? patients.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(patientSearch.toLowerCase()),
      )
    : patients.slice(0, 50); // Show first 50 when no search query

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError({});
    setGlobalError(null);

    const newErrors: Record<string, string> = {};
    if (!patientId) newErrors['patient_id'] = 'Please select a patient.';
    if (!doctorId)  newErrors['doctor_id']  = 'Please select a doctor.';
    if (!date)      newErrors['date']        = 'Please select a date.';
    if (!time)      newErrors['time']        = 'Please select a time.';

    if (Object.keys(newErrors).length > 0) {
      setFieldError(newErrors);
      return;
    }

    const [year, month, day]   = date.split('-').map(Number) as [number, number, number];
    const [hour, minute]       = time.split(':').map(Number) as [number, number];
    const dateObj              = new Date(year, month - 1, day);
    const scheduledAt          = buildLocalISO(dateObj, hour, minute);

    startTransition(async () => {
      const result = await createAppointmentAction({
        patient_id:          patientId,
        doctor_id:           doctorId,
        appointment_type_id: typeId || undefined,
        scheduled_at:        scheduledAt,
        duration_minutes:    duration,
        chief_complaint:     chiefComplaint || undefined,
        booked_via:          'dashboard',
      });

      if (!result.ok) {
        if (result.field) {
          setFieldError({ [result.field]: result.error });
        } else {
          setGlobalError(result.error);
        }
        return;
      }

      onCreated(result.data.id);
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 id="booking-modal-title" className="text-base font-semibold text-surface-900">
            New Appointment
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
            aria-label="Close booking form"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <form id="booking-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {globalError && (
            <div role="alert" className="px-3 py-2 rounded-lg bg-danger-50 border border-danger-100 text-sm text-danger-700">
              {globalError}
            </div>
          )}

          {/* Patient search */}
          <div>
            <label htmlFor="patient-search" className="block text-xs font-medium text-surface-700 mb-1.5">
              Patient <span aria-hidden="true" className="text-danger-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="patient-search"
              type="search"
              placeholder="Search by name…"
              value={patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); setPatientId(''); }}
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-surface-400"
              aria-describedby={fieldError['patient_id'] ? 'patient-error' : undefined}
              aria-invalid={!!fieldError['patient_id']}
            />
            {/* Patient list */}
            {filteredPatients.length > 0 && (
              <div className="mt-1.5 max-h-36 overflow-y-auto rounded-lg border border-surface-200 bg-white shadow-card">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPatientId(p.id);
                      setPatientSearch(`${p.first_name} ${p.last_name}`);
                    }}
                    className={[
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      patientId === p.id
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'hover:bg-surface-50 text-surface-700',
                    ].join(' ')}
                  >
                    {p.first_name} {p.last_name}
                  </button>
                ))}
              </div>
            )}
            {filteredPatients.length === 0 && patientSearch.trim().length > 0 && (
              <p className="mt-1 text-xs text-surface-400">No patients found.</p>
            )}
            {fieldError['patient_id'] && (
              <p id="patient-error" role="alert" className="mt-1 text-xs text-danger-600">
                {fieldError['patient_id']}
              </p>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label htmlFor="doctor-select" className="block text-xs font-medium text-surface-700 mb-1.5">
              Doctor <span aria-hidden="true" className="text-danger-500">*</span>
            </label>
            <select
              id="doctor-select"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              aria-invalid={!!fieldError['doctor_id']}
            >
              <option value="">Select a doctor…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title ? `${d.title} ` : ''}{d.first_name} {d.last_name} — {d.specialty}
                </option>
              ))}
            </select>
            {fieldError['doctor_id'] && (
              <p role="alert" className="mt-1 text-xs text-danger-600">{fieldError['doctor_id']}</p>
            )}
          </div>

          {/* Appointment type */}
          {appointmentTypes.length > 0 && (
            <div>
              <label htmlFor="type-select" className="block text-xs font-medium text-surface-700 mb-1.5">
                Appointment Type
              </label>
              <select
                id="type-select"
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">None / Custom</option>
                {appointmentTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date and Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="appt-date" className="block text-xs font-medium text-surface-700 mb-1.5">
                Date <span aria-hidden="true" className="text-danger-500">*</span>
              </label>
              <input
                id="appt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                aria-invalid={!!fieldError['date']}
              />
              {fieldError['date'] && (
                <p role="alert" className="mt-1 text-xs text-danger-600">{fieldError['date']}</p>
              )}
            </div>
            <div>
              <label htmlFor="appt-time" className="block text-xs font-medium text-surface-700 mb-1.5">
                Time <span aria-hidden="true" className="text-danger-500">*</span>
              </label>
              <input
                id="appt-time"
                type="time"
                value={time}
                step="900"
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                aria-invalid={!!fieldError['time']}
              />
              {fieldError['time'] && (
                <p role="alert" className="mt-1 text-xs text-danger-600">{fieldError['time']}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="appt-duration" className="block text-xs font-medium text-surface-700 mb-1.5">
              Duration (minutes)
            </label>
            <input
              id="appt-duration"
              type="number"
              min={5}
              max={480}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Chief complaint */}
          <div>
            <label htmlFor="chief-complaint" className="block text-xs font-medium text-surface-700 mb-1.5">
              Chief Complaint <span className="text-surface-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="chief-complaint"
              rows={2}
              maxLength={500}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Brief reason for visit…"
              className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none placeholder:text-surface-400"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-surface-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="booking-modal-form"
            disabled={isPending || !patientId}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-busy={isPending}
          >
            {isPending && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
