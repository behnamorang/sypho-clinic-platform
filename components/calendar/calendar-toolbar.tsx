/**
 * @file components/calendar/calendar-toolbar.tsx
 * @description Top toolbar for the interactive calendar — view switcher and date navigation.
 *
 * Controls:
 * - Previous / Next period navigation (day, week, or month depending on active view)
 * - "Today" button to jump back to the current date
 * - Day / Week / Month view toggle
 * - Current period label (e.g., "May 2026" or "Mon 12 – Sun 18 May 2026")
 */

'use client';

import { formatMonthYear } from '@/lib/utils/date';
import type { CalendarView } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarToolbarProps {
  view:         CalendarView;
  currentDate:  Date;
  onViewChange: (view: CalendarView) => void;
  onNavigate:   (direction: 'prev' | 'next' | 'today') => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generates a human-readable period label depending on the current view. */
function periodLabel(view: CalendarView, date: Date): string {
  if (view === 'month') {
    return formatMonthYear(date);
  }

  if (view === 'week') {
    // Show "Mon DD – Sun DD MMM YYYY"
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const monLabel = monday.toLocaleDateString('en-US', options);
    const sunLabel = sunday.toLocaleDateString('en-US', { ...options, year: 'numeric' });
    return `${monLabel} – ${sunLabel}`;
  }

  // Day view — "Mon, May 12, 2026"
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Stateless toolbar that delegates navigation and view-change events to the parent.
 */
export function CalendarToolbar({
  view,
  currentDate,
  onViewChange,
  onNavigate,
}: CalendarToolbarProps) {
  const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
    { value: 'day',   label: 'Day'   },
    { value: 'week',  label: 'Week'  },
    { value: 'month', label: 'Month' },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 bg-white flex-shrink-0">
      {/* Left: navigation controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('today')}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-700 border border-surface-200 hover:bg-surface-50 transition-colors"
          aria-label="Go to today"
        >
          Today
        </button>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onNavigate('prev')}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-600 hover:text-surface-900 transition-colors"
            aria-label="Go to previous period"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-600 hover:text-surface-900 transition-colors"
            aria-label="Go to next period"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Period label */}
        <h2 className="text-sm font-semibold text-surface-900 ml-1 min-w-[200px]">
          {periodLabel(view, currentDate)}
        </h2>
      </div>

      {/* Right: view toggle */}
      <div
        className="flex items-center bg-surface-100 rounded-lg p-0.5"
        role="group"
        aria-label="Calendar view"
      >
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            aria-pressed={view === option.value}
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              view === option.value
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-500 hover:text-surface-700',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
