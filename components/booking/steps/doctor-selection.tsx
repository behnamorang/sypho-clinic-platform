/**
 * @file components/booking/steps/doctor-selection.tsx
 * @description Step 2: Doctor Selection.
 *
 * Fetches doctors for the clinic (optionally filtered by the selected service
 * specialty in a future enhancement) and renders them as profile cards.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PublicDoctorProfile, PublicServiceProfile } from '@/types/booking';

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface DoctorSelectionProps {
  clinicSlug:      string;
  selectedService: PublicServiceProfile;
  selectedDoctor:  PublicDoctorProfile | null;
  onSelect:        (doctor: PublicDoctorProfile) => void;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function getDoctorInitials(doctor: PublicDoctorProfile): string {
  return `${doctor.first_name.charAt(0)}${doctor.last_name.charAt(0)}`.toUpperCase();
}

function getDoctorDisplayName(doctor: PublicDoctorProfile): string {
  const prefix = doctor.title ? `${doctor.title} ` : '';
  return `${prefix}${doctor.first_name} ${doctor.last_name}`;
}

// Deterministic background color based on doctor name (for avatar fallback)
const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-accent-100 text-accent-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + code;
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? 'bg-brand-100 text-brand-700';
}

// ---------------------------------------------------------------------------
// SKELETON
// ---------------------------------------------------------------------------

function DoctorSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-surface-200 p-4 flex gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-surface-100 shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-surface-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-surface-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Step 2 of the booking wizard.
 * Displays available doctors for the selected service.
 */
export function DoctorSelection({
  clinicSlug,
  selectedService,
  selectedDoctor,
  onSelect,
}: DoctorSelectionProps) {
  const [doctors, setDoctors]       = useState<PublicDoctorProfile[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = `/api/booking/${encodeURIComponent(clinicSlug)}/doctors?service_id=${encodeURIComponent(selectedService.id)}`;
      const res  = await fetch(url);
      const json = await res.json() as { data: PublicDoctorProfile[] | null; error: { message: string } | null };

      if (!res.ok || json.error) {
        setErrorMsg(json.error?.message ?? 'Failed to load doctors.');
        return;
      }
      setDoctors(json.data ?? []);
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clinicSlug, selectedService.id]);

  useEffect(() => {
    void fetchDoctors();
  }, [fetchDoctors]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-surface-100 rounded w-1/3 animate-pulse" />
        <DoctorSkeleton />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-danger-600 font-medium">{errorMsg}</p>
        <button
          onClick={() => void fetchDoctors()}
          className="mt-3 text-sm text-brand-600 hover:text-brand-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-surface-500">
          No doctors are currently available for{' '}
          <span className="font-medium text-surface-700">{selectedService.name}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-surface-900">Choose a doctor</h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Select a doctor for your{' '}
          <span className="font-medium text-surface-700">{selectedService.name}</span> appointment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {doctors.map((doctor) => {
          const isSelected   = selectedDoctor?.id === doctor.id;
          const displayName  = getDoctorDisplayName(doctor);
          const initials     = getDoctorInitials(doctor);
          const avatarColor  = getAvatarColor(displayName);

          return (
            <button
              key={doctor.id}
              onClick={() => onSelect(doctor)}
              aria-pressed={isSelected}
              className={[
                'relative text-left rounded-xl border-2 p-4 flex items-center gap-3',
                'transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                  : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-brand-50/30',
              ].join(' ')}
            >
              {/* Avatar initials */}
              <span
                className={[
                  'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  isSelected ? 'bg-brand-600 text-white' : avatarColor,
                ].join(' ')}
                aria-hidden="true"
              >
                {initials}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 truncate">{displayName}</p>
                <p className="text-xs text-surface-500 mt-0.5 truncate">{doctor.specialty}</p>
                {doctor.sub_specialty && (
                  <p className="text-[11px] text-surface-400 truncate">{doctor.sub_specialty}</p>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center shrink-0"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
