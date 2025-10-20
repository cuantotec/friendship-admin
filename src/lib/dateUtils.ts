import { format } from "date-fns";

/**
 * Converts a UTC timestamp to Eastern Time (EST/EDT)
 * @param utcTimestamp - ISO string or Date object in UTC
 * @returns Date object in Eastern Time
 */
export function convertToEasternTime(utcTimestamp: string | Date): Date {
  const utcDate = new Date(utcTimestamp);
  
  // Use Intl.DateTimeFormat to get the Eastern time components
  const easternFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = easternFormatter.formatToParts(utcDate);
  const year = parseInt(parts.find(part => part.type === 'year')?.value || '0');
  const month = parseInt(parts.find(part => part.type === 'month')?.value || '0') - 1; // Month is 0-indexed
  const day = parseInt(parts.find(part => part.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(part => part.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(part => part.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(part => part.type === 'second')?.value || '0');
  
  // Create a new Date object with the Eastern time components
  return new Date(year, month, day, hour, minute, second);
}

/**
 * Converts Eastern Time (EST/EDT) to UTC
 * @param easternTimeStr - Date string in format "YYYY-MM-DDTHH:MM:SS" representing Eastern time
 * @returns ISO string in UTC
 */
export function convertEasternToUTC(easternTimeStr: string): string {
  // Parse the date string components
  const [datePart, timePart] = easternTimeStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);
  
  // Create a date object representing the Eastern time
  const easternDate = new Date(year, month - 1, day, hour, minute, second);
  
  // Convert to UTC using native JavaScript timezone handling
  return easternDate.toISOString();
}

/**
 * Converts UTC to Eastern Time string
 * @param utcTimestamp - ISO string or Date object in UTC
 * @returns Date string in format "YYYY-MM-DDTHH:MM:SS" representing Eastern time
 */
export function convertUTCToEasternString(utcTimestamp: string | Date): string {
  const utcDate = new Date(utcTimestamp);
  
  // Use Intl.DateTimeFormat to get the Eastern time components
  const easternFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = easternFormatter.formatToParts(utcDate);
  const year = parts.find(part => part.type === 'year')?.value || '0';
  const month = parts.find(part => part.type === 'month')?.value || '0';
  const day = parts.find(part => part.type === 'day')?.value || '0';
  const hour = parts.find(part => part.type === 'hour')?.value || '0';
  const minute = parts.find(part => part.type === 'minute')?.value || '0';
  const second = parts.find(part => part.type === 'second')?.value || '0';
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/**
 * Formats an event date and time for display in Eastern Time
 * @param event - Event object with startDate, endDate, and recurring fields
 * @returns Formatted date and time string
 */
export function formatEventDateTime(event: {
  startDate: string;
  endDate?: string | null;
  isRecurring?: boolean;
  recurringStartTime?: string | null;
  recurringStartAmpm?: string | null;
  recurringEndTime?: string | null;
  recurringEndAmpm?: string | null;
}): string {
  // Convert to Eastern time
  const startDate = convertToEasternTime(event.startDate);
  const endDate = event.endDate ? convertToEasternTime(event.endDate) : null;
  
  // Format the start date
  const dateStr = format(startDate, "MMM d, yyyy");
  
  // Check if we have recurring time fields (for recurring events)
  if (event.isRecurring && event.recurringStartTime && event.recurringEndTime) {
    const startTime = `${event.recurringStartTime}${event.recurringStartAmpm || ''}`;
    const endTime = `${event.recurringEndTime}${event.recurringEndAmpm || ''}`;
    return `${dateStr} ${startTime} - ${endTime}`;
  }
  
  // For regular events, extract time from the Eastern timestamp
  const startTime = format(startDate, "h:mm a");
  
  if (endDate && endDate.getTime() !== startDate.getTime()) {
    // Different dates - show date range
    const endDateStr = format(endDate, "MMM d, yyyy");
    const endTime = format(endDate, "h:mm a");
    return `${dateStr} ${startTime} - ${endDateStr} ${endTime}`;
  } else if (endDate) {
    // Same date, different times
    const endTime = format(endDate, "h:mm a");
    return `${dateStr} ${startTime} - ${endTime}`;
  } else {
    // Only start time
    return `${dateStr} ${startTime}`;
  }
}

/**
 * Formats a date for display in Eastern Time
 * @param utcTimestamp - ISO string or Date object in UTC
 * @param formatString - date-fns format string (default: "MMM d, yyyy")
 * @returns Formatted date string in Eastern Time
 */
export function formatDateInEastern(
  utcTimestamp: string | Date, 
  formatString: string = "MMM d, yyyy"
): string {
  const easternDate = convertToEasternTime(utcTimestamp);
  return format(easternDate, formatString);
}

/**
 * Formats a time for display in Eastern Time
 * @param utcTimestamp - ISO string or Date object in UTC
 * @param formatString - date-fns format string (default: "h:mm a")
 * @returns Formatted time string in Eastern Time
 */
export function formatTimeInEastern(
  utcTimestamp: string | Date, 
  formatString: string = "h:mm a"
): string {
  const easternDate = convertToEasternTime(utcTimestamp);
  return format(easternDate, formatString);
}
