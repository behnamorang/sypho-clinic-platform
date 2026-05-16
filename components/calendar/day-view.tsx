/**
 * @file components/calendar/day-view.tsx
 * @description Single-day time grid for the calendar — displays one day at full width.
 *
 * Shares the same time-grid constants and appointment positioning logic as
 * WeekView but dedicates the full horizontal space to a single day.
 * Also renders doctor-column grouping for a clearer multi-doctor layout.
 */

'use client';

import { useState, useCallback }         from 'react';
import { AppointmentBlock }              from '@/components/calendar/appointment-block';
import { START_HOUR, END_HOUR, HOUR_HEIGHT, SLOT_HEIGHT } from '@/components/calendar/week-view';
import {
  isSameDay,
  isToday,
  getTopOffset,
  getBlockHeight,
} from '@/lib/utils/date';
import type { AppointmentWithRelations, CalendarSlot } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayViewProps {
  currentDate:            Date;
  appointments:           AppointmentWithRelations[];
  draggingAppointmentId:  string | null;
  onSlotClick:            (slot: CalendarSlot) => void;
  onAppointmentClick:     (appointment: AppointmentWithRelations) => void;
  onAppointmentDragStart: (appointment: AppointmentWithRelations) => void;
  onAppointmentDrop:      (appointmentId: string, targetDate: Date, targetHour: number, targetMinute: number) => void;
  onResizeStart:          (appointmentId: string, startY: number, originalDurationMinutes: number) => void;
}

// ---------------------------------------------------------------------------
// Overlap layout (same algorithm as WeekView, single day)
// ---------------------------------------------------------------------------

interface LayoutItem {
  appointment:  AppointmentWithRelations;
  column:       number;
  totalColumns: number;
}

function computeLayout(dayAppointments: AppointmentWithRelations[]): LayoutItem[] {
  const sorted = [...dayAppointments].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );

  const result: LayoutItem[] = [];
  const colEnds: number[]    = [];

  for (const appt of sorted) {
    const startMs = new Date(appt.scheduled_at).getTime();
    const endMs   = startMs + appt.duration_minutes * 60_000;

    let col = colEnds.findIndex((end) => end <= startMs);
    if (col === -1) { col = colEnds.length; colEnds.push(endMs); }
    else            { colEnds[col] = endMs; }

    result.push({ appointment: appt, column: col, totalColumns: 0 });
  }

  const maxCol = colEnds.length;
  for (const item of result) item.totalColumns = maxCol;

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOTAL_HOURS = END_HOUR - START_HOUR;
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

function getHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single-day time grid. Vertically scrollable, full-width columns.
 */
export function DayView({
  currentDate,
  appointments,
  draggingAppointmentId,
  onSlotClick,
  onAppointmentClick,
  onAppointmentDragStart,
  onAppointmentDrop,
  onResizeStart,
}: DayViewProps) {
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
  const slots = Array.from({ length: 4 }, (_, i) => i * 15);

  const today     = isToday(currentDate);
  const dayAppts  = appointments.filter((a) => isSameDay(new Date(a.scheduled_at), currentDate));
  const layout    = computeLayout(dayAppts);

  const dateLabel = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  });

  // ── Drag handlers ──────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetKey(key);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, hour: number, minute: number) => {
      e.preventDefault();
      setDropTargetKey(null);
      const id = e.dataTransfer.getData('appointmentId');
      if (id) onAppointmentDrop(id, currentDate, hour, minute);
    },
    [currentDate, onAppointmentDrop],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div
            className={[
              'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
              today ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-700',
            ].join(' ')}
          >
            {currentDate.getDate()}
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900">{dateLabel}</p>
            <p className="text-xs text-surface-500">{dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${GRID_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="w-14 flex-shrink-0 relative border-r border-surface-100">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full flex items-start justify-end pr-2"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                aria-hidden="true"
              >
                <span className="text-[10px] text-surface-400 leading-none mt-[-5px] font-medium">
                  {getHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            className={[
              'flex-1 relative',
              today ? 'bg-brand-50/20' : 'bg-white',
            ].join(' ')}
            style={{ height: `${GRID_HEIGHT}px` }}
          >
            {/* Hour/slot dividers */}
            {hours.map((hour) =>
              slots.map((minute) => {
                const slotKey        = `day-${hour}-${minute}`;
                const isHourBoundary = minute === 0;
                const isDropTarget   = dropTargetKey === slotKey;

                return (
                  <div
                    key={slotKey}
                    className={[
                      'absolute w-full transition-colors',
                      isHourBoundary
                        ? 'border-t border-surface-200'
                        : 'border-t border-surface-100/50',
                      isDropTarget ? 'bg-brand-100/60' : 'hover:bg-surface-50/80',
                    ].join(' ')}
                    style={{
                      top:    `${(hour - START_HOUR) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT}px`,
                      height: `${SLOT_HEIGHT}px`,
                    }}
                    onClick={() => onSlotClick({ date: currentDate, hour, minute })}
                    onDragOver={(e) => handleDragOver(e, slotKey)}
                    onDragLeave={() => setDropTargetKey(null)}
                    onDrop={(e) => handleDrop(e, hour, minute)}
                    role="button"
                    aria-label={`${dateLabel} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} — click to book`}
                    tabIndex={-1}
                  />
                );
              }),
            )}

            {/* Current time line */}
            {today && <CurrentTimeLine />}

            {/* Appointments */}
            {layout.map(({ appointment, column, totalColumns }) => {
              const topPx     = getTopOffset(appointment.scheduled_at, START_HOUR, HOUR_HEIGHT);
              const heightPx  = getBlockHeight(appointment.duration_minutes, HOUR_HEIGHT);
              const widthFrac = totalColumns > 0 ? 1 / totalColumns : 1;
              const leftFrac  = totalColumns > 0 ? column / totalColumns : 0;

              return (
                <div
                  key={appointment.id}
                  className={draggingAppointmentId === appointment.id ? 'opacity-40' : undefined}
                >
                  <AppointmentBlock
                    appointment={appointment}
                    topPx={topPx}
                    heightPx={heightPx}
                    widthFraction={widthFrac}
                    leftFraction={leftFrac}
                    onAppointmentClick={onAppointmentClick}
                    onDragStart={onAppointmentDragStart}
                    onResizeStart={onResizeStart}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Current time line
// ---------------------------------------------------------------------------

function CurrentTimeLine() {
  const now   = new Date();
  const topPx = getTopOffset(now.toISOString(), START_HOUR, HOUR_HEIGHT);

  if (topPx < 0 || topPx > GRID_HEIGHT) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${topPx}px` }}
      aria-hidden="true"
    >
      <div className="relative">
        <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-danger-500 -translate-y-1/2" />
        <div className="h-px bg-danger-500 ml-1.5" />
      </div>
    </div>
  );
}
