/**
 * Date formatting utilities for the Diet Management App
 *
 * Uses Intl.DateTimeFormat for locale-aware formatting without external dependencies.
 */

/**
 * Format a date for API requests (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a time for API requests (HH:mm)
 */
export function formatTimeForApi(date: Date = new Date()): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Format date for display (e.g., "21 Jan 2026")
 */
export function formatDisplayDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-AU', options).format(date);
}

/**
 * Format date and time for display (e.g., "21 Jan 2026, 2:30 PM")
 */
export function formatDisplayDateTime(dateString: string, timeString?: string): string {
  let date = new Date(dateString);

  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes);
  }

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDisplayDate(dateString);
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get start of day for a date
 */
export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day for a date
 */
export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
