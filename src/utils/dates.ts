import { format } from 'date-fns';

// Format a Date as YYYY-MM-DD in the device's local timezone.
// Never use Date.toISOString() for calendar-day comparisons: it converts to
// UTC, which rolls to the wrong day for part of every day in most timezones
// (e.g. after ~5pm in the US).
export function localDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Today's date as YYYY-MM-DD in the device's local timezone.
export function todayLocalStr(): string {
  return localDateStr(new Date());
}
