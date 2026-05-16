/**
 * @file components/booking/time-slots.tsx
 * @description Time slot grid for the booking schedule step.
 *
 * Displays available slots fetched from the slots API as a scrollable
 * grid of selectable time buttons. Shows a skeleton loader while fetching,
 * and appropriate empty/error states.
 */

'use client';

import type { BookingTimeSlot } from '@/types/booking';

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface TimeSlotsProps {
  slots:         BookingTimeSlot[];
  selectedSlot:  string | null;
  onSlotSelect:  (slot: BookingTimeSlot) => void;
  isLoading:     boolean;
  selectedDate:  string | null;
  dateFormat:    'DD/MM/YYYY' | 'MM/DD/YYYY';
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatDisplayDate(dateStr: string, format: 'DD/MM/YYYY' | 'MM/DD/YYYY'): string {
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthName = monthNames[parseInt(month, 10) - 1] ?? month;

  if (format === 'MM/DD/YYYY') {
    return `${monthName} ${parseInt(day, 10)}, ${year}`;
  }
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

// ---------------------------------------------------------------------------
// SKELETON LOADER
// ---------------------------------------------------------------------------

function SlotSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-lg bg-surface-100 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Scrollable list of available time slots for a selected date.
 * Right column of the Schedule Selection step (Step 3).
 */
export function TimeSlots({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
  selectedDate,
  dateFormat,
}: TimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-surface-600">Select a date</p>
        <p className="text-xs text-surface-400 mt-1">Available times will appear here</p>
      </div>
    );
  }

  const formattedDate = formatDisplayDate(selectedDate, dateFormat);

  return (
    <div className="flex flex-col h-full">
      {/* Date heading */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
          Available times
        </p>
        <p className="text-sm font-semibold text-surface-800 mt-0.5">{formattedDate}</p>
      </div>

      {isLoading ? (
        <SlotSkeleton />
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-600">No availability</p>
          <p className="text-xs text-surface-400 mt-1">
            No slots available on this date.
            <br />Please select another day.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-3 gap-2 overflow-y-auto max-h-72 pr-1"
          role="listbox"
          aria-label="Available appointment times"
        >
          {slots.map((slot) => {
            const isSelected = slot.starts_at === selectedSlot;
            return (
              <button
                key={slot.starts_at}
                onClick={() => onSlotSelect(slot)}
                role="option"
                aria-selected={isSelected}
                aria-label={`${slot.label} appointment slot`}
                className={[
                  'py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                    : 'bg-surface-50 text-surface-700 border border-surface-200',
                  !isSelected && 'hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200',
                ].join(' ')}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
