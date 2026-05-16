/**
 * @file components/booking/mini-calendar.tsx
 * @description Compact, elegant calendar widget for the booking schedule step.
 *
 * Features:
 * - Monthly view with previous/next navigation.
 * - Marks days with doctor availability (based on weekly schedule).
 * - Disables past dates and unavailable weekdays.
 * - Highlights the selected date with a filled circle.
 * - Today is subtly outlined for orientation.
 * - Accessible: keyboard navigation, aria-labels, role="grid".
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { getAvailableWeekdays }           from '@/lib/booking/slots';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_NAMES = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
] as const;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface MiniCalendarProps {
  /** Currently selected date in YYYY-MM-DD format. */
  selectedDate:          string | null;
  /** Callback when a date is selected. */
  onDateSelect:          (date: string) => void;
  /** Doctor's availability_schedule JSON for pre-marking available weekdays. */
  availabilitySchedule:  Record<string, unknown>;
  /** Minimum selectable date in YYYY-MM-DD (defaults to today). */
  minDate?:              string | undefined;
  /** Maximum selectable date in YYYY-MM-DD (defaults to 90 days from today). */
  maxDate?:              string | undefined;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function toDateString(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDateString(date: string): { year: number; month: number; day: number } {
  const parts = date.split('-');
  return {
    year:  parseInt(parts[0] ?? '2024', 10),
    month: parseInt(parts[1] ?? '1', 10) - 1,
    day:   parseInt(parts[2] ?? '1', 10),
  };
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Compact monthly calendar widget for date selection.
 * Left column of the Schedule Selection step (Step 3).
 */
export function MiniCalendar({
  selectedDate,
  onDateSelect,
  availabilitySchedule,
  minDate,
  maxDate,
}: MiniCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    return toDateString(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const effectiveMinDate = minDate ?? today;
  const effectiveMaxDate = maxDate ?? (() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return toDateString(d.getFullYear(), d.getMonth(), d.getDate());
  })();

  // Current month/year being viewed
  const initial = selectedDate ?? today;
  const initialParsed = parseDateString(initial);

  const [viewYear, setViewYear]   = useState(initialParsed.year);
  const [viewMonth, setViewMonth] = useState(initialParsed.month);

  // Compute weekdays that have availability
  const availableWeekdays = useMemo(
    () => getAvailableWeekdays(availabilitySchedule),
    [availabilitySchedule]
  );

  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  // Build grid of days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Convert Sunday=0 to Monday=0 for EU week start
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: Array<{ date: string | null; day: number | null }> = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, day: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: toDateString(viewYear, viewMonth, d),
        day:  d,
      });
    }

    // Trailing empty cells to complete the last row
    while (days.length % 7 !== 0) {
      days.push({ date: null, day: null });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Can navigate to prev month?
  const canGoPrev = useMemo(() => {
    const minParsed = parseDateString(effectiveMinDate);
    return viewYear > minParsed.year || (viewYear === minParsed.year && viewMonth > minParsed.month);
  }, [viewYear, viewMonth, effectiveMinDate]);

  // Can navigate to next month?
  const canGoNext = useMemo(() => {
    const maxParsed = parseDateString(effectiveMaxDate);
    return viewYear < maxParsed.year || (viewYear === maxParsed.year && viewMonth < maxParsed.month);
  }, [viewYear, viewMonth, effectiveMaxDate]);

  function isDateSelectable(dateStr: string): boolean {
    if (dateStr < effectiveMinDate || dateStr > effectiveMaxDate) return false;
    const d = new Date(dateStr + 'T00:00:00Z');
    const dayName = DAY_NAMES[d.getUTCDay()];
    if (!dayName) return false;
    return availableWeekdays.has(dayName);
  }

  function hasAvailability(dateStr: string): boolean {
    const d = new Date(dateStr + 'T00:00:00Z');
    const dayName = DAY_NAMES[d.getUTCDay()];
    if (!dayName) return false;
    return availableWeekdays.has(dayName);
  }

  return (
    <div className="select-none">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className={[
            'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
            canGoPrev
              ? 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              : 'text-surface-300 cursor-not-allowed',
          ].join(' ')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-surface-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          aria-label="Next month"
          className={[
            'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
            canGoNext
              ? 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              : 'text-surface-300 cursor-not-allowed',
          ].join(' ')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1" role="row">
        {DAY_HEADERS.map((h) => (
          <div key={h} className="text-center text-[10px] font-semibold text-surface-400 py-1 uppercase tracking-wide">
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-0.5" role="grid" aria-label="Calendar">
        {calendarDays.map((cell, idx) => {
          if (!cell.date || cell.day === null) {
            return <div key={`empty-${idx}`} aria-hidden="true" />;
          }

          const isSelected   = cell.date === selectedDate;
          const isToday      = cell.date === today;
          const selectable   = isDateSelectable(cell.date);
          const hasSlots     = hasAvailability(cell.date);

          return (
            <div key={cell.date} role="gridcell" aria-selected={isSelected}>
              <button
                onClick={() => selectable && onDateSelect(cell.date!)}
                disabled={!selectable}
                aria-label={`${cell.day} ${MONTH_NAMES[viewMonth]}${isSelected ? ' (selected)' : ''}${isToday ? ' (today)' : ''}`}
                aria-disabled={!selectable}
                className={[
                  'w-full aspect-square rounded-lg text-sm font-medium',
                  'flex flex-col items-center justify-center gap-[2px]',
                  'transition-all duration-150 relative',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                    : isToday
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300'
                      : selectable
                        ? 'text-surface-800 hover:bg-brand-50 hover:text-brand-700'
                        : 'text-surface-300 cursor-not-allowed',
                ].join(' ')}
              >
                <span className="text-[13px] leading-none">{cell.day}</span>

                {/* Availability dot */}
                {hasSlots && !isSelected && (
                  <span
                    aria-hidden="true"
                    className={[
                      'w-1 h-1 rounded-full',
                      selectable ? 'bg-accent-500' : 'bg-surface-300',
                    ].join(' ')}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-surface-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-brand-600 inline-block" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
