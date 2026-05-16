/**
 * @file components/booking/booking-confirmation.tsx
 * @description Booking success state — shown after a confirmed appointment.
 *
 * Displays a premium success animation with appointment summary and next steps.
 */

'use client';

import type {
  BookingConfirmationResult,
  PublicClinicProfile,
  PublicServiceProfile,
  PublicDoctorProfile,
}                               from '@/types/booking';

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface BookingConfirmationProps {
  clinic:         PublicClinicProfile;
  service:        PublicServiceProfile;
  doctor:         PublicDoctorProfile;
  scheduledAt:    string;  // ISO 8601
  confirmation:   BookingConfirmationResult;
  dateFormat:     'DD/MM/YYYY' | 'MM/DD/YYYY';
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatAppointmentDateTime(
  isoString: string,
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY',
): { date: string; time: string } {
  const dt = new Date(isoString);

  const year  = dt.getUTCFullYear();
  const month = dt.getUTCMonth() + 1;
  const day   = dt.getUTCDate();
  const hours   = dt.getUTCHours();
  const minutes = dt.getUTCMinutes();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[month - 1] ?? String(month);

  const dateStr = dateFormat === 'MM/DD/YYYY'
    ? `${monthName} ${day}, ${year}`
    : `${day} ${monthName} ${year}`;

  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return { date: dateStr, time: timeStr };
}

function getDoctorDisplayName(doctor: PublicDoctorProfile): string {
  const prefix = doctor.title ? `${doctor.title} ` : '';
  return `${prefix}${doctor.first_name} ${doctor.last_name}`;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Terminal success state of the booking wizard.
 * Shown after a successful appointment confirmation.
 */
export function BookingConfirmation({
  clinic,
  service,
  doctor,
  scheduledAt,
  confirmation,
  dateFormat,
}: BookingConfirmationProps) {
  const { date, time } = formatAppointmentDateTime(scheduledAt, dateFormat);
  const doctorName     = getDoctorDisplayName(doctor);

  return (
    <div className="flex flex-col items-center text-center py-4 space-y-6 animate-fade-in">
      {/* Success icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success-500 to-accent-500 flex items-center justify-center shadow-lg shadow-success-200">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {/* Animated ring */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full ring-4 ring-success-200 animate-ping opacity-30"
          style={{ animationDuration: '2s', animationIterationCount: '2' }}
        />
      </div>

      {/* Confirmation message */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Appointment Confirmed!</h2>
        <p className="text-sm text-surface-500 mt-1.5">
          Your booking has been received. We&apos;ll send a confirmation to your email shortly.
        </p>
      </div>

      {/* Appointment summary card */}
      <div className="w-full max-w-sm bg-surface-50 rounded-2xl border border-surface-200 p-5 text-left space-y-4">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
          Appointment Summary
        </p>

        <div className="space-y-3">
          {/* Clinic */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-medium">Clinic</p>
              <p className="text-sm font-semibold text-surface-800">{clinic.name}</p>
              <p className="text-xs text-surface-500">{clinic.address_line1}, {clinic.city}</p>
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-medium">Doctor</p>
              <p className="text-sm font-semibold text-surface-800">{doctorName}</p>
              <p className="text-xs text-surface-500">{doctor.specialty}</p>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${service.color}20` }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: service.color }} />
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-medium">Service</p>
              <p className="text-sm font-semibold text-surface-800">{service.name}</p>
              <p className="text-xs text-surface-500">{service.duration_minutes} min</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-medium">Date & Time</p>
              <p className="text-sm font-semibold text-surface-800">{date}</p>
              <p className="text-xs text-surface-500">{time}</p>
            </div>
          </div>
        </div>

        {/* Reference number */}
        <div className="pt-3 border-t border-surface-200">
          <p className="text-[11px] text-surface-400">Reference number</p>
          <p className="text-xs font-mono font-semibold text-surface-600 mt-0.5">
            {confirmation.appointment_id.split('-')[0]?.toUpperCase()}
          </p>
        </div>
      </div>

      {/* GDPR reminder */}
      <div className="text-[11px] text-surface-400 max-w-xs leading-relaxed">
        Your data is processed under GDPR Article 9(2)(h) — healthcare provision.
        You may request access, correction, or deletion of your data at any time
        by contacting {clinic.name}.
      </div>
    </div>
  );
}
