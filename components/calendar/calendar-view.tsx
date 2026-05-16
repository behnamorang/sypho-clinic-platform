/**
 * @file components/calendar/calendar-view.tsx
 * @description Root interactive calendar client component.
 *
 * Orchestrates all calendar subsystems:
 * - View switching (Day / Week / Month)
 * - Date navigation (prev / next / today)
 * - Modal state (booking modal, appointment detail modal)
 * - Optimistic UI updates via React's `useOptimistic`
 * - Pointer-based resize tracking (attached to window during active resize)
 * - HTML5 drag-and-drop rescheduling
 * - Server Action calls for all mutations
 * - Incremental refetch when user navigates to a new date range
 *
 * @compliance GDPR — No PHI is written to console or localStorage.
 *             clinic_id enforcement is in the server actions, not here.
 */

'use client';

import {
  useState,
  useOptimistic,
  useTransition,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { CalendarToolbar }   from '@/components/calendar/calendar-toolbar';
import { WeekView }          from '@/components/calendar/week-view';
import { DayView }           from '@/components/calendar/day-view';
import { MonthView }         from '@/components/calendar/month-view';
import { BookingModal }      from '@/components/calendar/booking-modal';
import { AppointmentModal }  from '@/components/calendar/appointment-modal';

import {
  rescheduleAppointmentAction,
  resizeAppointmentAction,
  fetchAppointmentsForRange,
} from '@/app/(dashboard)/dashboard/calendar/actions';

import {
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  buildLocalISO,
} from '@/lib/utils/date';

import type {
  AppointmentWithRelations,
  CalendarView,
  CalendarSlot,
  OptimisticUpdate,
  CalendarInitialData,
} from '@/types/calendar';
import type { AppointmentStatus } from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Pixel resolution of a single snap interval (15 min = HOUR_HEIGHT/4). */
const HOUR_HEIGHT = 64;

// ---------------------------------------------------------------------------
// Optimistic reducer
// ---------------------------------------------------------------------------

function optimisticReducer(
  state: AppointmentWithRelations[],
  update: OptimisticUpdate,
): AppointmentWithRelations[] {
  switch (update.type) {
    case 'create':
      return [...state, update.appointment];

    case 'status':
      return state.map((a) =>
        a.id === update.id
          ? {
              ...a,
              status:              update.status,
              cancellation_reason: update.cancellationReason ?? a.cancellation_reason,
            }
          : a,
      );

    case 'reschedule':
      return state.map((a) =>
        a.id === update.id
          ? { ...a, scheduled_at: update.scheduledAt }
          : a,
      );

    case 'resize':
      return state.map((a) =>
        a.id === update.id
          ? { ...a, duration_minutes: update.durationMinutes }
          : a,
      );

    case 'remove':
      return state.filter((a) => a.id !== update.id);
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarViewProps {
  initialData: CalendarInitialData;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Root interactive calendar. Receives initial server-fetched data and
 * manages all calendar interactions client-side with optimistic updates.
 */
export function CalendarView({ initialData }: CalendarViewProps) {
  const { patients, doctors, appointmentTypes } = initialData;

  // ── View / navigation state ─────────────────────────────────────────────
  const [view,        setView]        = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // ── Appointments (base state + optimistic layer) ────────────────────────
  const [appointments, setAppointments]                 = useState(initialData.appointments);
  const [optimisticAppts, dispatchOptimistic]           = useOptimistic(appointments, optimisticReducer);
  const [, startTransition]                             = useTransition();
  const [isFetching, setIsFetching]                     = useState(false);
  const [fetchError,  setFetchError]                    = useState<string | null>(null);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [bookingSlot,       setBookingSlot]      = useState<CalendarSlot | null>(null);
  const [selectedAppt,      setSelectedAppt]     = useState<AppointmentWithRelations | null>(null);
  const bookingModalOpen    = bookingSlot !== null;
  const apptModalOpen       = selectedAppt !== null;

  // ── Drag state ───────────────────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // ── Resize state (pointer-tracked) ──────────────────────────────────────
  const resizeStateRef = useRef<{
    appointmentId:           string;
    startY:                  number;
    originalDurationMinutes: number;
  } | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  /**
   * Computes the ISO date range for the current view + date.
   */
  const getRangeForView = useCallback((v: CalendarView, d: Date): [string, string] => {
    if (v === 'day') {
      return [startOfDay(d).toISOString(), endOfDay(d).toISOString()];
    }
    if (v === 'week') {
      return [startOfWeek(d).toISOString(), endOfWeek(d).toISOString()];
    }
    // month
    return [startOfMonth(d).toISOString(), endOfMonth(d).toISOString()];
  }, []);

  /**
   * Fetches appointments for the new date/view and updates the base state.
   */
  const fetchRange = useCallback(
    async (v: CalendarView, d: Date) => {
      setFetchError(null);
      setIsFetching(true);
      const [start, end] = getRangeForView(v, d);
      const result = await fetchAppointmentsForRange(start, end);
      setIsFetching(false);
      if (result.ok) {
        setAppointments(result.data);
      } else {
        setFetchError(result.error);
      }
    },
    [getRangeForView],
  );

  // ── Navigation handlers ──────────────────────────────────────────────────

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      setCurrentDate((prev) => {
        let next: Date;
        if (direction === 'today') {
          next = new Date();
        } else if (view === 'day') {
          next = addDays(prev, direction === 'next' ? 1 : -1);
        } else if (view === 'week') {
          next = addDays(prev, direction === 'next' ? 7 : -7);
        } else {
          next = addMonths(prev, direction === 'next' ? 1 : -1);
        }
        // Trigger fetch after state update (via useEffect)
        return next;
      });
    },
    [view],
  );

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
    // fetchRange will run via useEffect
  }, []);

  // Fetch appointments whenever view or currentDate changes
  useEffect(() => {
    void fetchRange(view, currentDate);
  }, [view, currentDate, fetchRange]);

  // ── Slot click → open booking modal ─────────────────────────────────────
  const handleSlotClick = useCallback((slot: CalendarSlot) => {
    setBookingSlot(slot);
  }, []);

  // ── Appointment click → open detail modal ───────────────────────────────
  const handleAppointmentClick = useCallback((appt: AppointmentWithRelations) => {
    setSelectedAppt(appt);
  }, []);

  // ── Booking created ──────────────────────────────────────────────────────
  const handleBookingCreated = useCallback(
    (_newId: string) => {
      // Revalidation from the server action will refresh data via the
      // next fetchRange call. We trigger a refetch immediately.
      void fetchRange(view, currentDate);
    },
    [view, currentDate, fetchRange],
  );

  // ── Status updated (from appointment modal) ──────────────────────────────
  const handleStatusUpdated = useCallback(
    (id: string, status: AppointmentStatus, cancellationReason?: string) => {
      startTransition(() => {
        const update: OptimisticUpdate = cancellationReason !== undefined
          ? { type: 'status', id, status, cancellationReason }
          : { type: 'status', id, status };
        dispatchOptimistic(update);
      });
      // Base state will refresh on next navigation; also trigger immediate fetch
      void fetchRange(view, currentDate);
    },
    [dispatchOptimistic, fetchRange, view, currentDate],
  );

  // ── Drag start ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((appt: AppointmentWithRelations) => {
    setDraggingId(appt.id);
  }, []);

  // ── Appointment drop → reschedule ─────────────────────────────────────────
  const handleAppointmentDrop = useCallback(
    (appointmentId: string, targetDate: Date, targetHour: number, targetMinute: number) => {
      setDraggingId(null);

      const newScheduledAt = buildLocalISO(targetDate, targetHour, targetMinute);

      // Optimistic update
      startTransition(() => {
        dispatchOptimistic({ type: 'reschedule', id: appointmentId, scheduledAt: newScheduledAt });
      });

      // Server action (non-blocking)
      startTransition(async () => {
        const result = await rescheduleAppointmentAction({
          appointment_id: appointmentId,
          scheduled_at:   newScheduledAt,
        });

        if (!result.ok) {
          // Revert by re-fetching
          void fetchRange(view, currentDate);
        }
      });
    },
    [dispatchOptimistic, fetchRange, view, currentDate],
  );

  // ── Resize start / move / end ─────────────────────────────────────────────

  const handleResizeStart = useCallback(
    (appointmentId: string, startY: number, originalDurationMinutes: number) => {
      resizeStateRef.current = { appointmentId, startY, originalDurationMinutes };
      setResizingId(appointmentId);
    },
    [],
  );

  // Attach pointer-move and pointer-up listeners to the window for resize tracking.
  useEffect(() => {
    if (!resizingId) return;

    const handlePointerMove = (e: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;

      const deltaY          = e.clientY - state.startY;
      const deltaMinutes    = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;
      const newDuration     = Math.max(15, state.originalDurationMinutes + deltaMinutes);

      // Live optimistic height update
      startTransition(() => {
        dispatchOptimistic({ type: 'resize', id: state.appointmentId, durationMinutes: newDuration });
      });
    };

    const handlePointerUp = async (e: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) { setResizingId(null); return; }

      const deltaY       = e.clientY - state.startY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;
      const finalDuration = Math.max(15, state.originalDurationMinutes + deltaMinutes);

      resizeStateRef.current = null;
      setResizingId(null);

      const result = await resizeAppointmentAction({
        appointment_id:   state.appointmentId,
        duration_minutes: finalDuration,
      });

      if (!result.ok) {
        // Revert optimistic update
        startTransition(() => {
          dispatchOptimistic({
            type:            'resize',
            id:              state.appointmentId,
            durationMinutes: state.originalDurationMinutes,
          });
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup',   handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup',   handlePointerUp);
    };
  }, [resizingId, dispatchOptimistic]);

  // ── Month day click → navigate to day view ────────────────────────────────
  const handleMonthDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setView('day');
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ cursor: resizingId ? 'ns-resize' : undefined }}>
      {/* Toolbar */}
      <CalendarToolbar
        view={view}
        currentDate={currentDate}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
      />

      {/* Loading / error bar */}
      {isFetching && (
        <div
          className="h-0.5 bg-brand-400 animate-pulse"
          role="progressbar"
          aria-label="Loading appointments"
          aria-busy="true"
        />
      )}
      {fetchError && (
        <div
          role="alert"
          className="px-4 py-2 bg-danger-50 border-b border-danger-100 text-xs text-danger-700 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {fetchError}
          <button
            onClick={() => void fetchRange(view, currentDate)}
            className="ml-auto text-danger-600 hover:text-danger-800 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Calendar body */}
      <div className="flex-1 overflow-hidden">
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            appointments={optimisticAppts}
            draggingAppointmentId={draggingId}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentDragStart={handleDragStart}
            onAppointmentDrop={handleAppointmentDrop}
            onResizeStart={handleResizeStart}
          />
        )}

        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            appointments={optimisticAppts}
            draggingAppointmentId={draggingId}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentDragStart={handleDragStart}
            onAppointmentDrop={handleAppointmentDrop}
            onResizeStart={handleResizeStart}
          />
        )}

        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            appointments={optimisticAppts}
            onDayClick={handleMonthDayClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      {/* Booking modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingSlot(null)}
        initialDate={bookingSlot?.date ?? currentDate}
        initialHour={bookingSlot?.hour ?? 9}
        initialMinute={bookingSlot?.minute ?? 0}
        patients={patients}
        doctors={doctors}
        appointmentTypes={appointmentTypes}
        onCreated={handleBookingCreated}
      />

      {/* Appointment detail/status modal */}
      <AppointmentModal
        isOpen={apptModalOpen}
        onClose={() => setSelectedAppt(null)}
        appointment={selectedAppt}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
