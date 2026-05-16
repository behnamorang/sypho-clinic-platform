/**
 * @file lib/booking/slots.ts
 * @description Available time slot computation for the booking portal.
 *
 * Generates a list of bookable time slots for a given doctor, date, and
 * appointment type by:
 *   1. Reading the doctor's weekly availability schedule (JSONB).
 *   2. Computing candidate slots within each work time range.
 *   3. Filtering out slots that overlap with existing appointments (buffer-aware).
 *   4. Filtering out slots that are in the past.
 *
 * All time comparisons use UTC. The doctor's schedule is stored as "HH:MM"
 * strings relative to the clinic's timezone — callers must pass the correct
 * UTC offset for accurate conversion. For simplicity in initial implementation,
 * we treat schedule times as UTC-equivalent (clinic must configure UTC times).
 *
 * @see database/migrations/001_initial_schema.sql — doctors.availability_schedule
 * @see types/booking.ts — BookingTimeSlot
 */

import type { WeeklySchedule, TimeSlot }    from '@/database/types/database.types';
import type { BookingTimeSlot }             from '@/types/booking';

// ---------------------------------------------------------------------------
// INTERNAL HELPERS
// ---------------------------------------------------------------------------

/** Ordered day-of-week names matching JavaScript Date.getDay() (0 = Sunday). */
const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

type DayName = typeof DAYS_OF_WEEK[number];

/**
 * Parses a "HH:MM" time string into minutes-since-midnight.
 * Returns NaN if the format is invalid.
 */
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  const hours   = parts[0] !== undefined ? parseInt(parts[0], 10) : NaN;
  const minutes = parts[1] !== undefined ? parseInt(parts[1], 10) : NaN;
  if (isNaN(hours) || isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
}

/**
 * Formats minutes-since-midnight as "HH:MM" (24-hour).
 */
function minutesToTimeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Builds an ISO 8601 UTC datetime string from a local YYYY-MM-DD date and
 * a minutes-since-midnight offset.
 *
 * NOTE: This implementation treats the schedule as UTC. Clinics should
 * configure availability_schedule in UTC. A future version should accept
 * a timezone and use Intl.DateTimeFormat for proper conversion.
 */
function buildISODatetime(date: string, minutesSinceMidnight: number): string {
  const [year, month, day] = date.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid date string: ${date}`);
  }
  const hours   = Math.floor(minutesSinceMidnight / 60);
  const minutes = minutesSinceMidnight % 60;
  const dt = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  return dt.toISOString();
}

// ---------------------------------------------------------------------------
// BOOKED SLOT SHAPE (from get_booked_slots RPC or direct query)
// ---------------------------------------------------------------------------

export interface BookedWindow {
  scheduled_at: string;  // ISO 8601
  ends_at:      string;  // ISO 8601
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------

/**
 * Generates available time slots for a doctor on a specific date,
 * filtering out already-booked windows and past times.
 *
 * @param availabilitySchedule - Doctor's weekly schedule (JSON from DB).
 * @param bookedWindows        - Existing active appointments for that day.
 * @param date                 - The target date in YYYY-MM-DD format (UTC).
 * @param durationMinutes      - Appointment type duration in minutes.
 * @param bufferBeforeMinutes  - Buffer before each appointment (minutes).
 * @param bufferAfterMinutes   - Buffer after each appointment (minutes).
 * @returns Sorted array of BookingTimeSlot objects.
 */
export function computeAvailableSlots(
  availabilitySchedule:  Record<string, unknown>,
  bookedWindows:         BookedWindow[],
  date:                  string,
  durationMinutes:       number,
  bufferBeforeMinutes:   number,
  bufferAfterMinutes:    number,
): BookingTimeSlot[] {
  // Determine day of week from the date string
  const [year, month, day] = date.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return [];
  }

  const dateObj   = new Date(Date.UTC(year, month - 1, day));
  const dayIndex  = dateObj.getUTCDay();              // 0 = Sunday
  const dayName   = DAYS_OF_WEEK[dayIndex] as DayName | undefined;
  if (dayName === undefined) return [];

  const schedule  = availabilitySchedule as WeeklySchedule;
  const daySchedule = schedule[dayName];

  // Skip if doctor is closed or has no slots defined for this day
  if (!daySchedule || daySchedule.closed === true) return [];
  const timeSlots: TimeSlot[] = daySchedule.slots ?? [];
  if (timeSlots.length === 0) return [];

  const now = new Date();

  const result: BookingTimeSlot[] = [];

  for (const range of timeSlots) {
    const rangeStart = parseTimeToMinutes(range.start);
    const rangeEnd   = parseTimeToMinutes(range.end);

    if (isNaN(rangeStart) || isNaN(rangeEnd) || rangeStart >= rangeEnd) continue;

    // Slot step equals the appointment duration (no overlap between slots)
    let cursor = rangeStart;

    while (cursor + durationMinutes <= rangeEnd) {
      const slotStart   = cursor;
      const slotEnd     = cursor + durationMinutes;

      const slotStartISO = buildISODatetime(date, slotStart);
      const slotEndISO   = buildISODatetime(date, slotEnd);

      const slotStartDate = new Date(slotStartISO);

      // Skip slots in the past (with a 5-minute grace window)
      if (slotStartDate.getTime() < now.getTime() - 5 * 60 * 1000) {
        cursor += durationMinutes;
        continue;
      }

      // Check overlap with any existing booked window (including buffer zones)
      const bufferedSlotStart = cursor - bufferBeforeMinutes;
      const bufferedSlotEnd   = slotEnd + bufferAfterMinutes;

      const isBlocked = bookedWindows.some((booked) => {
        const bookedStart = new Date(booked.scheduled_at).getTime();
        const bookedEnd   = new Date(booked.ends_at).getTime();
        const checkStart  = new Date(buildISODatetime(date, bufferedSlotStart)).getTime();
        const checkEnd    = new Date(buildISODatetime(date, bufferedSlotEnd)).getTime();

        // Overlap condition: existing window starts before slot ends AND ends after slot starts
        return bookedStart < checkEnd && bookedEnd > checkStart;
      });

      if (!isBlocked) {
        result.push({
          starts_at: slotStartISO,
          ends_at:   slotEndISO,
          label:     minutesToTimeLabel(slotStart),
        });
      }

      cursor += durationMinutes;
    }
  }

  return result;
}

/**
 * Returns the set of weekday names on which the doctor has at least one
 * time range configured (not closed). Used to pre-mark available days
 * in the mini calendar without additional API calls.
 *
 * @param availabilitySchedule - Doctor's weekly schedule (JSON from DB).
 * @returns Set of day names that have availability (e.g., {'monday', 'friday'}).
 */
export function getAvailableWeekdays(
  availabilitySchedule: Record<string, unknown>,
): Set<string> {
  const schedule = availabilitySchedule as WeeklySchedule;
  const available = new Set<string>();

  for (const day of DAYS_OF_WEEK) {
    const daySchedule = schedule[day];
    if (!daySchedule) continue;
    if (daySchedule.closed === true) continue;
    if ((daySchedule.slots ?? []).length > 0) {
      available.add(day);
    }
  }

  return available;
}
