/**
 * @file components/calendar/week-view.tsx
 * @description 7-day time grid with drag-and-drop rescheduling and resize support.
 *
 * Architecture:
 * - Sticky day-header row with day names and date numbers
 * - Scrollable time grid (START_HOUR – END_HOUR)
 * - Each day column is a relative-positioned container for appointment blocks
 * - 15-minute slots are individual divs that accept drag-drop events
 * - Appointments are absolutely positioned using pixel offsets derived from time
 *
 * Drag behavior:
 * - Dragging an appointment block stores its ID in dataTransfer
 * - Hovering a slot highlights it as a drop target
 * - Dropping calls `onAppointmentDrop(appointmentId, targetDate, targetHour, targetMinute)`
 *
 * Click behavior:
 * - Clicking an empty slot calls `onSlotClick(date, hour, minute)`
 * - Clicking an appointment calls `onAppointmentClick(appointment)`
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import { AppointmentBlock }              from '@/components/calendar/appointment-block';
import {
  getWeekDays,
  formatShortDate,
  isToday,
  isSameDay,
  formatLocalDate,
  getTopOffset,
  getBlockHeight,
} from '@/lib/utils/date';
import type { AppointmentWithRelations, CalendarSlot } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Grid constants
// ---------------------------------------------------------------------------

/** First hour displayed in the grid (inclusive). */
export const START_HOUR = 7;

/** Last hour displayed in the grid (exclusive — grid ends at this hour). */
export const END_HOUR = 21;

/** Pixel height of one hour row. Must be divisible by 4 for 15-min slots. */
export const HOUR_HEIGHT = 64;

/** Pixel height of one 15-minute slot. */
export const SLOT_HEIGHT = HOUR_HEIGHT / 4;

/** Total visible hours. */
const TOTAL_HOURS = END_HOUR - START_HOUR;

/** Total grid height in pixels. */
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeekViewProps {
  currentDate:          Date;
  appointments:         AppointmentWithRelations[];
  draggingAppointmentId: string | null;
  onSlotClick:          (slot: CalendarSlot) => void;
  onAppointmentClick:   (appointment: AppointmentWithRelations) => void;
  onAppointmentDragStart: (appointment: AppointmentWithRelations) => void;
  onAppointmentDrop:    (appointmentId: string, targetDate: Date, targetHour: number, targetMinute: number) => void;
  onResizeStart:        (appointmentId: string, startY: number, originalDurationMinutes: number) => void;
}

// ---------------------------------------------------------------------------
// Overlap layout computation
// ---------------------------------------------------------------------------

interface LayoutAppointment {
  appointment: AppointmentWithRelations;
  column:      number;
  totalColumns: number;
}

/**
 * Computes non-overlapping column layout for appointments on a single day.
 * Appointments that overlap in time are placed in adjacent columns.
 */
function computeLayout(dayAppointments: AppointmentWithRelations[]): LayoutAppointment[] {
  const sorted = [...dayAppointments].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );

  const result: LayoutAppointment[] = [];
  // Each entry is the end-time (ms) of the last appointment placed in that column.
  const columnEnds: number[] = [];

  for (const appt of sorted) {
    const startMs = new Date(appt.scheduled_at).getTime();
    const endMs   = startMs + appt.duration_minutes * 60_000;

    // Find the first column where the appointment doesn't overlap.
    let col = columnEnds.findIndex((endTime) => endTime <= startMs);
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(endMs);
    } else {
      columnEnds[col] = endMs;
    }

    result.push({ appointment: appt, column: col, totalColumns: 0 });
  }

  // Set totalColumns = max column index + 1 for each appointment.
  const maxCol = columnEnds.length;
  for (const item of result) {
    item.totalColumns = maxCol;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Time label helpers
// ---------------------------------------------------------------------------

function getHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the 7-day week view with a scrollable time grid.
 */
export function WeekView({
  currentDate,
  appointments,
  draggingAppointmentId,
  onSlotClick,
  onAppointmentClick,
  onAppointmentDragStart,
  onAppointmentDrop,
  onResizeStart,
}: WeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);

  const weekDays = getWeekDays(currentDate);
  const hours    = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
  const slots    = Array.from({ length: 4 }, (_, i) => i * 15); // 0, 15, 30, 45

  // Group appointments by day key (YYYY-MM-DD)
  const appointmentsByDay = new Map<string, AppointmentWithRelations[]>();
  for (const day of weekDays) {
    appointmentsByDay.set(formatLocalDate(day), []);
  }
  for (const appt of appointments) {
    const key = formatLocalDate(new Date(appt.scheduled_at));
    const arr = appointmentsByDay.get(key);
    if (arr) arr.push(appt);
  }

  // ── Drag-over / Drop handlers ────────────────────────────────────────────

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, key: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTargetKey(key);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetKey(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, day: Date, hour: number, minute: number) => {
      e.preventDefault();
      setDropTargetKey(null);
      const appointmentId = e.dataTransfer.getData('appointmentId');
      if (appointmentId) {
        onAppointmentDrop(appointmentId, day, hour, minute);
      }
    },
    [onAppointmentDrop],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Day header row (sticky) ───────────────────────────────────────── */}
      <div className="flex flex-shrink-0 bg-white border-b border-surface-200 z-10">
        {/* Time gutter spacer */}
        <div className="w-14 flex-shrink-0 border-r border-surface-100" />

        {weekDays.map((day) => {
          const { weekday, dayNum } = formatShortDate(day);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={[
                'flex-1 flex flex-col items-center py-2 border-r border-surface-100 last:border-r-0 min-w-0',
                today ? 'bg-brand-50/40' : '',
              ].join(' ')}
            >
              <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                {weekday}
              </span>
              <span
                className={[
                  'mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold',
                  today
                    ? 'bg-brand-600 text-white'
                    : 'text-surface-700',
                ].join(' ')}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable time grid ─────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex" style={{ minHeight: `${GRID_HEIGHT}px` }}>
          {/* Time labels column */}
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

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayKey     = formatLocalDate(day);
            const dayAppts   = appointmentsByDay.get(dayKey) ?? [];
            const layoutItems = computeLayout(dayAppts);
            const today      = isToday(day);

            return (
              <div
                key={dayKey}
                className={[
                  'flex-1 relative border-r border-surface-100 last:border-r-0 min-w-0',
                  today ? 'bg-brand-50/20' : 'bg-white',
                ].join(' ')}
                style={{ height: `${GRID_HEIGHT}px` }}
              >
                {/* Hour dividers and 15-min slots */}
                {hours.map((hour) =>
                  slots.map((minute) => {
                    const slotKey = `${dayKey}-${hour}-${minute}`;
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
                          isDropTarget
                            ? 'bg-brand-100/60'
                            : 'hover:bg-surface-50/80',
                        ].join(' ')}
                        style={{
                          top:    `${(hour - START_HOUR) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT}px`,
                          height: `${SLOT_HEIGHT}px`,
                        }}
                        onClick={() => onSlotClick({ date: day, hour, minute })}
                        onDragOver={(e) => handleDragOver(e, slotKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, hour, minute)}
                        role="button"
                        aria-label={`${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} — click to book`}
                        tabIndex={-1}
                      />
                    );
                  }),
                )}

                {/* Current time indicator (today only) */}
                {today && <CurrentTimeIndicator />}

                {/* Appointment blocks */}
                {layoutItems.map(({ appointment, column, totalColumns }) => {
                  const apptDate = new Date(appointment.scheduled_at);
                  if (!isSameDay(apptDate, day)) return null;

                  const topPx      = getTopOffset(appointment.scheduled_at, START_HOUR, HOUR_HEIGHT);
                  const heightPx   = getBlockHeight(appointment.duration_minutes, HOUR_HEIGHT);
                  const widthFrac  = totalColumns > 0 ? 1 / totalColumns : 1;
                  const leftFrac   = totalColumns > 0 ? column / totalColumns : 0;
                  const isDragging = draggingAppointmentId === appointment.id;

                  return (
                    <div
                      key={appointment.id}
                      className={isDragging ? 'opacity-40' : undefined}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Current time indicator (red line for today)
// ---------------------------------------------------------------------------

function CurrentTimeIndicator() {
  const now     = new Date();
  const topPx   = getTopOffset(now.toISOString(), START_HOUR, HOUR_HEIGHT);

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
