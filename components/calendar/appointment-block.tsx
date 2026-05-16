/**
 * @file components/calendar/appointment-block.tsx
 * @description Draggable appointment block rendered inside the time grid.
 *
 * Supports:
 * - HTML5 drag-and-drop for rescheduling
 * - Pointer-event resize handle at the bottom for duration changes
 * - Click to open the appointment detail modal
 * - Status-based color coding
 * - Optimistic height/position updates during resize
 */

'use client';

import { useRef, useCallback } from 'react';
import { formatTime, formatDuration } from '@/lib/utils/date';
import type { AppointmentWithRelations } from '@/types/calendar';
import type { AppointmentStatus }        from '@/database/types/database.types';

// ---------------------------------------------------------------------------
// Status color map
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; border: string; text: string; dot: string }> = {
  pending:     { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-900',  dot: 'bg-amber-400'   },
  confirmed:   { bg: 'bg-brand-50',   border: 'border-brand-200',  text: 'text-brand-900',  dot: 'bg-brand-500'   },
  checked_in:  { bg: 'bg-accent-50',  border: 'border-accent-200', text: 'text-accent-900', dot: 'bg-accent-500'  },
  in_progress: { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-900', dot: 'bg-violet-500'  },
  completed:   { bg: 'bg-success-50', border: 'border-green-200',  text: 'text-green-900',  dot: 'bg-success-500' },
  cancelled:   { bg: 'bg-danger-50',  border: 'border-danger-100', text: 'text-danger-700', dot: 'bg-danger-500'  },
  no_show:     { bg: 'bg-surface-100',border: 'border-surface-200',text: 'text-surface-500',dot: 'bg-surface-400' },
  rescheduled: { bg: 'bg-sky-50',     border: 'border-sky-200',    text: 'text-sky-900',    dot: 'bg-sky-500'     },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum visible block height even for very short appointments. */
const MIN_BLOCK_HEIGHT_PX = 28;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppointmentBlockProps {
  appointment:   AppointmentWithRelations;
  topPx:         number;
  heightPx:      number;
  /** 0–1 fractional width. Used when multiple appointments overlap. */
  widthFraction: number;
  /** Fractional left offset for overlapping appointments. */
  leftFraction:  number;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
  onDragStart:        (appointment: AppointmentWithRelations) => void;
  onResizeStart:      (appointmentId: string, startY: number, originalDurationMinutes: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single appointment as an absolutely-positioned block inside the
 * time grid. Handles drag initiation and resize initiation.
 */
export function AppointmentBlock({
  appointment,
  topPx,
  heightPx,
  widthFraction,
  leftFraction,
  onAppointmentClick,
  onDragStart,
  onResizeStart,
}: AppointmentBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);

  const styles = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending;
  const effectiveHeight = Math.max(heightPx, MIN_BLOCK_HEIGHT_PX);
  const isCompact = effectiveHeight < 44;

  const doctorLabel = [appointment.doctor.title, appointment.doctor.last_name]
    .filter(Boolean)
    .join(' ');

  const patientLabel = `${appointment.patient.first_name} ${appointment.patient.last_name}`;

  // ── Drag start ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.dataTransfer.setData('appointmentId', appointment.id);
      e.dataTransfer.effectAllowed = 'move';
      // Make drag ghost slightly transparent
      if (blockRef.current) {
        e.dataTransfer.setDragImage(blockRef.current, 8, 8);
      }
      onDragStart(appointment);
    },
    [appointment, onDragStart],
  );

  // ── Resize handle ────────────────────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      onResizeStart(appointment.id, e.clientY, appointment.duration_minutes);
    },
    [appointment.id, appointment.duration_minutes, onResizeStart],
  );

  // ── Click ────────────────────────────────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onAppointmentClick(appointment);
    },
    [appointment, onAppointmentClick],
  );

  return (
    <div
      ref={blockRef}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${patientLabel} with Dr. ${doctorLabel} at ${formatTime(appointment.scheduled_at)} — ${appointment.status}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAppointmentClick(appointment); } }}
      className={[
        'absolute cursor-pointer select-none rounded-md border overflow-hidden',
        'transition-shadow hover:shadow-card-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
        styles.bg,
        styles.border,
        styles.text,
        appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'opacity-60' : '',
      ].join(' ')}
      style={{
        top:    `${topPx}px`,
        height: `${effectiveHeight}px`,
        left:   `calc(${leftFraction * 100}% + 2px)`,
        width:  `calc(${widthFraction * 100}% - 4px)`,
        zIndex: 10,
      }}
    >
      {/* Colored left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${styles.dot}`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="pl-2.5 pr-1 py-1 h-full flex flex-col justify-between">
        <div className="min-h-0">
          <p className={`font-semibold leading-tight truncate ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
            {patientLabel}
          </p>
          {!isCompact && (
            <>
              <p className="text-[10px] opacity-70 leading-snug truncate">
                Dr. {doctorLabel}
              </p>
              <p className="text-[10px] opacity-60 leading-snug">
                {formatTime(appointment.scheduled_at)} · {formatDuration(appointment.duration_minutes)}
              </p>
            </>
          )}
        </div>

        {/* Status dot */}
        <div className="flex items-center justify-between mt-0.5">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} aria-hidden="true" />
        </div>
      </div>

      {/* Resize handle — only show when block is tall enough */}
      {effectiveHeight >= 36 && (
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Resize appointment duration"
          role="separator"
          aria-orientation="horizontal"
        >
          <div className="w-6 h-0.5 rounded-full bg-current opacity-40" />
        </div>
      )}
    </div>
  );
}
