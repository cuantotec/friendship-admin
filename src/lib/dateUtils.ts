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
  
  // Create a date string in the format that represents Eastern time
  const easternDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  
  // Use the most reliable method: create a date object and use timezone conversion
  // We'll create a date that represents the Eastern time, then convert it properly
  const easternDate = new Date(easternDateStr);
  
  // Get the timezone offset for Eastern time at this specific date
  // We'll use the Intl.DateTimeFormat to get the correct offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Get the parts to understand the timezone offset
  const parts = formatter.formatToParts(easternDate);
  const easternYear = parseInt(parts.find(part => part.type === 'year')?.value || '0');
  const easternMonth = parseInt(parts.find(part => part.type === 'month')?.value || '0') - 1;
  const easternDay = parseInt(parts.find(part => part.type === 'day')?.value || '0');
  const easternHour = parseInt(parts.find(part => part.type === 'hour')?.value || '0');
  const easternMinute = parseInt(parts.find(part => part.type === 'minute')?.value || '0');
  const easternSecond = parseInt(parts.find(part => part.type === 'second')?.value || '0');
  
  // Create a date object representing the Eastern time
  const easternTimeDate = new Date(easternYear, easternMonth, easternDay, easternHour, easternMinute, easternSecond);
  
  // Calculate the offset between the input time and the Eastern time
  const offset = easternDate.getTime() - easternTimeDate.getTime();
  
  // Create the UTC date by adding the offset
  const utcDate = new Date(easternDate.getTime() + offset);
  
  return utcDate.toISOString();
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
  recurring?: boolean;
}): string {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  
  // Format start date
  const startFormatted = format(startDate, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
  
  if (endDate) {
    const endFormatted = format(endDate, 'h:mm a');
    return `${startFormatted} - ${endFormatted}`;
  }
  
  return startFormatted;
}

/**
 * Gets the current time in Eastern Time
 * @returns Date object representing current time in Eastern Time
 */
export function getCurrentEasternTime(): Date {
  return convertToEasternTime(new Date());
}

/**
 * Formats a date for display in Eastern Time
 * @param date - Date object or ISO string
 * @param formatStr - Format string (default: 'MMM d, yyyy h:mm a')
 * @returns Formatted date string in Eastern Time
 */
export function formatEasternDate(date: Date | string, formatStr: string = 'MMM d, yyyy h:mm a'): string {
  const easternDate = convertToEasternTime(date);
  return format(easternDate, formatStr);
}