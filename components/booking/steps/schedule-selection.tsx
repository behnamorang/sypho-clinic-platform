/**
 * @file components/booking/steps/schedule-selection.tsx
 * @description Step 3: Schedule Selection — two-column calendar + time slots.
 *
 * Layout:
 *   Left  column: MiniCalendar — compact monthly calendar with availability dots.
 *   Right column: TimeSlots   — real-time available slot buttons for the selected day.
 *
 * When the user clicks a date, slots for that date are fetched from the API.
 * Already-booked slots, buffer times, and vacation windows are excluded by the API.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { MiniCalendar }                     from '@/components/booking/mini-calendar';
import { TimeSlots }                        from '@/components/booking/time-slots';
import type {
  PublicDoctorProfile,
  PublicServiceProfile,
  BookingTimeSlot,
  GeoContext,
}                                           from '@/types/booking';

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface ScheduleSelectionProps {
  clinicSlug:      string;
  selectedService: PublicServiceProfile;
  selectedDoctor:  PublicDoctorProfile;
  selectedDate:    string | null;
  selectedSlot:    string | null;
  geo:             GeoContext;
  onDateChange:    (date: string) => void;
  onSlotSelect:    (slot: BookingTimeSlot) => void;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Step 3 of the booking wizard.
 * Tight two-column layout: mini calendar on the left, live slot list on the right.
 */
export function ScheduleSelection({
  clinicSlug,
  selectedService,
  selectedDoctor,
  selectedDate,
  selectedSlot,
  geo,
  onDateChange,
  onSlotSelect,
}: ScheduleSelectionProps) {
  const [slots, setSlots]             = useState<BookingTimeSlot[]>([]);
  const [isSlotsLoading, setLoading]  = useState(false);
  const [slotsError, setSlotsError]   = useState<string | null>(null);

  const fetchSlots = useCallback(async (date: string) => {
    setLoading(true);
    setSlotsError(null);
    try {
      const params = new URLSearchParams({
        doctor_id:           selectedDoctor.id,
        appointment_type_id: selectedService.id,
        date,
      });
      const url  = `/api/booking/${encodeURIComponent(clinicSlug)}/slots?${params.toString()}`;
      const res  = await fetch(url);
      const json = await res.json() as { data: BookingTimeSlot[] | null; error: { message: string } | null };

      if (!res.ok || json.error) {
        setSlotsError(json.error?.message ?? 'Failed to load time slots.');
        setSlots([]);
        return;
      }
      setSlots(json.data ?? []);
    } catch {
      setSlotsError('Network error. Please try again.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [clinicSlug, selectedDoctor.id, selectedService.id]);

  // Fetch slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      void fetchSlots(selectedDate);
    } else {
      setSlots([]);
    }
  }, [selectedDate, fetchSlots]);

  function handleDateSelect(date: string) {
    onDateChange(date);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-surface-900">Choose a date & time</h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Pick a day, then select your preferred time slot.
        </p>
      </div>

      {/* Two-column layout: calendar + slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Mini calendar */}
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-4">
          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            availabilitySchedule={selectedDoctor.availability_schedule}
          />
        </div>

        {/* Right: Time slots */}
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 min-h-[280px]">
          {slotsError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-danger-600 font-medium">{slotsError}</p>
              {selectedDate && (
                <button
                  onClick={() => void fetchSlots(selectedDate)}
                  className="mt-2 text-xs text-brand-600 hover:text-brand-700 underline"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <TimeSlots
              slots={slots}
              selectedSlot={selectedSlot}
              onSlotSelect={onSlotSelect}
              isLoading={isSlotsLoading}
              selectedDate={selectedDate}
              dateFormat={geo.dateFormat}
            />
          )}
        </div>
      </div>

      {/* Selection summary */}
      {selectedDate && selectedSlot && (
        <div className="rounded-lg bg-success-50 border border-success-500/30 p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-success-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium text-success-700">
            Appointment selected: {selectedDate} at{' '}
            {slots.find((s) => s.starts_at === selectedSlot)?.label ?? selectedSlot}
          </p>
        </div>
      )}
    </div>
  );
}
