import { format } from "date-fns";

/**
 * Converts a UTC timestamp to Eastern Time (EST/EDT)
 * @param utcTimestamp - ISO string or Date object in UTC
 * @returns Date object in Eastern Time
 */
export function convertToEasternTime(utcTimestamp: string | Date): Date {
  const date = new Date(utcTimestamp);
  
  // Get the Eastern time offset for the given date
  const easternTime = new Date(date.toLocaleString("en-US", { 
    timeZone: "America/New_York" 
  }));
  
  // Calculate the timezone offset difference
  const utcTime = new Date(date.toLocaleString("en-US", { 
    timeZone: "UTC" 
  }));
  
  const offsetDiff = easternTime.getTime() - utcTime.getTime();
  
  // Apply the offset to get the correct Eastern time
  return new Date(date.getTime() + offsetDiff);
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
