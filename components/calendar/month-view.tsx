/**
 * @file components/calendar/month-view.tsx
 * @description Monthly calendar grid view.
 *
 * Renders a standard 7-column (Mon–Sun) month grid. Each cell shows:
 * - Day number (highlighted if today)
 * - Up to 3 compact appointment chips per day
 * - "+N more" overflow link if there are more than 3
 *
 * Clicking a day navigates to the day view.
 * Clicking an appointment opens the appointment detail modal.
 */

'use client';

import {
  getMonthGridDays,
  formatLocalDate,
  isToday,
} from '@/lib/utils/date';
import type { AppointmentWithRelations } from '@/types/calendar';
import type { AppointmentStatus }        from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE = 3;

// Status dot colors for appointment chips
const STATUS_CHIP_STYLES: Record<AppointmentStatus, string> = {
  pending:     'bg-amber-100 text-amber-800',
  confirmed:   'bg-brand-100 text-brand-800',
  checked_in:  'bg-accent-100 text-accent-800',
  in_progress: 'bg-violet-100 text-violet-800',
  completed:   'bg-green-100 text-green-800',
  cancelled:   'bg-surface-200 text-surface-500 line-through',
  no_show:     'bg-surface-200 text-surface-400 line-through',
  rescheduled: 'bg-sky-100 text-sky-800',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthViewProps {
  currentDate:        Date;
  appointments:       AppointmentWithRelations[];
  onDayClick:         (date: Date) => void;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a full month calendar grid with appointment chips per day.
 */
export function MonthView({
  currentDate,
  appointments,
  onDayClick,
  onAppointmentClick,
}: MonthViewProps) {
  const gridDays = getMonthGridDays(currentDate);

  // Group appointments by day key
  const byDay = new Map<string, AppointmentWithRelations[]>();
  for (const appt of appointments) {
    const key = formatLocalDate(new Date(appt.scheduled_at));
    const arr = byDay.get(key) ?? [];
    arr.push(appt);
    byDay.set(key, arr);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Weekday header row */}
      <div className="grid grid-cols-7 flex-shrink-0 border-b border-surface-200 bg-white">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="py-2.5 text-center text-xs font-semibold text-surface-500 uppercase tracking-wide border-r border-surface-100 last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 h-full" style={{ gridAutoRows: 'minmax(120px, 1fr)' }}>
          {gridDays.map((day) => {
            const key       = formatLocalDate(day);
            const dayAppts  = (byDay.get(key) ?? []).sort(
              (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
            );
            const visible   = dayAppts.slice(0, MAX_VISIBLE);
            const overflow  = dayAppts.length - MAX_VISIBLE;
            const today     = isToday(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={key}
                className={[
                  'border-r border-b border-surface-100 last:border-r-0 p-1.5 flex flex-col min-h-[120px]',
                  isCurrentMonth
                    ? today ? 'bg-brand-50/30' : 'bg-white hover:bg-surface-50/50'
                    : 'bg-surface-50/50',
                  'transition-colors',
                ].join(' ')}
              >
                {/* Day number */}
                <button
                  onClick={() => onDayClick(day)}
                  className="self-start mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  aria-label={`View ${day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
                >
                  <span
                    className={[
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium leading-none',
                      today
                        ? 'bg-brand-600 text-white'
                        : isCurrentMonth
                          ? 'text-surface-800 hover:bg-surface-100'
                          : 'text-surface-400 hover:bg-surface-100',
                    ].join(' ')}
                  >
                    {day.getDate()}
                  </span>
                </button>

                {/* Appointment chips */}
                <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-hidden">
                  {visible.map((appt) => (
                    <AppointmentChip
                      key={appt.id}
                      appointment={appt}
                      onClick={onAppointmentClick}
                    />
                  ))}
                  {overflow > 0 && (
                    <button
                      onClick={() => onDayClick(day)}
                      className="text-[10px] text-brand-600 hover:text-brand-800 font-medium text-left px-1 leading-snug"
                    >
                      +{overflow} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appointment chip (compact representation in month cell)
// ---------------------------------------------------------------------------

interface AppointmentChipProps {
  appointment: AppointmentWithRelations;
  onClick:     (appointment: AppointmentWithRelations) => void;
}

function AppointmentChip({ appointment, onClick }: AppointmentChipProps) {
  const style = STATUS_CHIP_STYLES[appointment.status] ?? STATUS_CHIP_STYLES.pending;
  const time  = new Date(appointment.scheduled_at).toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(appointment); }}
      className={[
        'w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate leading-snug',
        'transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500',
        style,
      ].join(' ')}
      aria-label={`${appointment.patient.first_name} ${appointment.patient.last_name} at ${time}`}
    >
      <span className="font-medium">{time}</span>
      {' '}
      {appointment.patient.first_name} {appointment.patient.last_name[0]}.
    </button>
  );
}
