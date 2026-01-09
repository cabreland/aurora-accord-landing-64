import { format, formatDistanceToNow, isToday, isYesterday, isThisYear, differenceInHours } from 'date-fns';

/**
 * Get the user's timezone abbreviation (e.g., EST, PST, GMT)
 */
export const getUserTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    
    // Get the timezone abbreviation
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || '';
  } catch {
    return '';
  }
};

/**
 * Format a timestamp with smart relative/absolute display and timezone
 * 
 * Examples:
 * - "2 hours ago" (for recent, < 24 hours)
 * - "Today at 3:45 PM EST" (for today, > 24 hours old)
 * - "Yesterday at 10:30 AM EST" (for yesterday)
 * - "Jan 9 at 10:30 AM EST" (for this year)
 * - "Dec 15, 2025 at 2:15 PM EST" (for previous years)
 */
export const formatSmartTimestamp = (
  dateInput: string | Date,
  options: {
    showTimezone?: boolean;
    relativeThresholdHours?: number;
  } = {}
): string => {
  const { showTimezone = true, relativeThresholdHours = 24 } = options;
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const hoursDiff = differenceInHours(now, date);
  const tz = showTimezone ? ` ${getUserTimezone()}` : '';
  
  // Recent: show relative time (e.g., "2 hours ago")
  if (hoursDiff < relativeThresholdHours && hoursDiff >= 0) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // Today: "Today at 3:45 PM EST"
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}${tz}`;
  }
  
  // Yesterday: "Yesterday at 10:30 AM EST"
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}${tz}`;
  }
  
  // This year: "Jan 9 at 10:30 AM EST"
  if (isThisYear(date)) {
    return `${format(date, 'MMM d')} at ${format(date, 'h:mm a')}${tz}`;
  }
  
  // Previous years: "Dec 15, 2025 at 2:15 PM EST"
  return `${format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm a')}${tz}`;
};

/**
 * Format timestamp for compact display (without "at")
 * Used for inline displays like comment timestamps
 * 
 * Examples:
 * - "2 hours ago"
 * - "Today, 3:45 PM EST"
 * - "Jan 9, 1:08 PM EST"
 */
export const formatCompactTimestamp = (
  dateInput: string | Date,
  options: {
    showTimezone?: boolean;
    relativeThresholdHours?: number;
  } = {}
): string => {
  const { showTimezone = true, relativeThresholdHours = 6 } = options;
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const hoursDiff = differenceInHours(now, date);
  const tz = showTimezone ? ` ${getUserTimezone()}` : '';
  
  // Very recent: show relative time
  if (hoursDiff < relativeThresholdHours && hoursDiff >= 0) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // Today
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}${tz}`;
  }
  
  // Yesterday
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}${tz}`;
  }
  
  // This year
  if (isThisYear(date)) {
    return `${format(date, 'MMM d')}, ${format(date, 'h:mm a')}${tz}`;
  }
  
  // Previous years
  return `${format(date, 'MMM d, yyyy')}, ${format(date, 'h:mm a')}${tz}`;
};

/**
 * Format for activity feed - smart relative with timezone fallback
 */
export const formatActivityTimestamp = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const hoursDiff = differenceInHours(new Date(), date);
  
  // Within 48 hours: relative time
  if (hoursDiff < 48 && hoursDiff >= 0) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // Beyond 48 hours: show date with time and timezone
  return formatCompactTimestamp(date, { showTimezone: true, relativeThresholdHours: 0 });
};
