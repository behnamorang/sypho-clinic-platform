/**
 * @file lib/utils/date.ts
 * @description Pure date utility functions for the Sypho.io calendar engine.
 *
 * All functions are stateless and side-effect-free. They operate in the
 * browser's local timezone (matching clinic locale) rather than UTC, so that
 * "08:00" always means 08:00 in the user's current clock — regardless of UTC offset.
 *
 * No external date libraries are used to keep the bundle lean.
 */

// ---------------------------------------------------------------------------
// Week boundary helpers
// ---------------------------------------------------------------------------

/**
 * Returns the Monday of the ISO week containing the given date.
 * Sets time to midnight (00:00:00.000) in local timezone.
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the Sunday of the ISO week containing the given date.
 * Sets time to end-of-day (23:59:59.999) in local timezone.
 */
export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ---------------------------------------------------------------------------
// Day helpers
// ---------------------------------------------------------------------------

/** Returns a new Date with time set to midnight (00:00:00.000). */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns a new Date with time set to end-of-day (23:59:59.999). */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Adds n calendar days to a date and returns a new Date. */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Returns true if two Date objects fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** Returns true if the date is today. */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ---------------------------------------------------------------------------
// Month helpers
// ---------------------------------------------------------------------------

/** Returns the first day of the month at midnight. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/** Returns the last day of the month at end-of-day. */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Adds n months to a date and returns a new Date. */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// ---------------------------------------------------------------------------
// Collection helpers
// ---------------------------------------------------------------------------

/**
 * Returns an array of 7 Date objects for the ISO week containing the given date.
 * Always starts on Monday.
 */
export function getWeekDays(date: Date): Date[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Returns all calendar grid days for a month view, including leading/trailing
 * days from adjacent months to fill complete ISO weeks.
 */
export function getMonthGridDays(date: Date): Date[] {
  const firstOfMonth = startOfMonth(date);
  const lastOfMonth  = endOfMonth(date);
  const gridStart    = startOfWeek(firstOfMonth);
  const gridEnd      = endOfWeek(lastOfMonth);

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Formats a Date as "YYYY-MM-DD" using local timezone (not UTC).
 * Safe to use as a stable map key for appointments per day.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a time string from an ISO 8601 datetime string to 12-hour format.
 * Example: "2024-12-05T10:30:00.000Z" → "10:30 AM"
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const h    = date.getHours();
  const m    = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Formats a time string as 24-hour "HH:MM".
 * Useful for <input type="time"> value binding.
 */
export function formatTime24(isoString: string): string {
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Formats a month and year, e.g., "May 2026".
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns a short label for a calendar day column header: `{ weekday: "Mon", dayNum: 12 }`.
 */
export function formatShortDate(date: Date): { weekday: string; dayNum: number } {
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum:  date.getDate(),
  };
}

/**
 * Formats a duration in minutes as a human-readable string.
 * Examples: 30 → "30m", 60 → "1h", 90 → "1h 30m"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Calendar positioning helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the pixel offset from the top of the time grid for a given
 * ISO datetime string, relative to START_HOUR.
 *
 * @param isoString  - ISO 8601 datetime of the event start.
 * @param startHour  - The first hour displayed in the grid (e.g., 7 for 7 AM).
 * @param hourHeight - The pixel height of one hour in the grid.
 */
export function getTopOffset(
  isoString: string,
  startHour: number,
  hourHeight: number,
): number {
  const date = new Date(isoString);
  const offsetMinutes = (date.getHours() - startHour) * 60 + date.getMinutes();
  return (offsetMinutes / 60) * hourHeight;
}

/**
 * Calculates the pixel height for an appointment block given its duration.
 *
 * @param durationMinutes - Duration of the appointment in minutes.
 * @param hourHeight      - The pixel height of one hour in the grid.
 * @param minHeight       - Minimum block height (prevents tiny blocks).
 */
export function getBlockHeight(
  durationMinutes: number,
  hourHeight: number,
  minHeight = 24,
): number {
  return Math.max((durationMinutes / 60) * hourHeight, minHeight);
}

/**
 * Constructs an ISO datetime string from a Date and explicit hour + minute.
 * Uses local timezone (not UTC).
 */
export function buildLocalISO(date: Date, hour: number, minute: number): string {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Given a pixel offset from the top of the time grid, returns the
 * nearest snapped time (snapped to SNAP_MINUTES intervals).
 *
 * @param pixelOffset  - Y offset in pixels from the grid top.
 * @param startHour    - First hour displayed in the grid.
 * @param hourHeight   - Pixels per hour.
 * @param snapMinutes  - Snap granularity in minutes (default: 15).
 */
export function pixelOffsetToTime(
  pixelOffset: number,
  startHour: number,
  hourHeight: number,
  snapMinutes = 15,
): { hour: number; minute: number } {
  const totalMinutes = Math.round((pixelOffset / hourHeight) * 60 / snapMinutes) * snapMinutes;
  const clampedMinutes = Math.max(0, totalMinutes);
  return {
    hour:   startHour + Math.floor(clampedMinutes / 60),
    minute: clampedMinutes % 60,
  };
}
