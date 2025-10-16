/**
 * Simple template rendering function
 * Replaces {{key}} with data[key] and handles basic conditionals
 */
export function renderTemplate(template: string, data: Record<string, string | number | boolean | undefined>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    })
    .replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
      return data[key] ? content : '';
    });
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York'
  }).format(dateObj);
}

/**
 * Format date range for email display
 */
export function formatEmailDateRange(startDate: Date | string, endDate?: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  if (!endDate) {
    return formatEmailDate(start);
  }
  
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (start.getTime() === end.getTime()) {
    return formatEmailDate(start);
  }
  
  return `${new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York'
  }).format(start)} - ${new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  }).format(end)}`;
}

/**
 * Generate a random confirmation number
 */
export function generateConfirmationNumber(prefix: string = ''): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize email content to prevent XSS
 */
export function sanitizeEmailContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get admin emails from environment or default
 */
export function getAdminEmails(): Array<{ email: string; name: string }> {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  
  if (adminEmailsEnv) {
    try {
      return JSON.parse(adminEmailsEnv);
    } catch (error) {
      console.error('Failed to parse ADMIN_EMAILS:', error);
    }
  }
  
  // Default admin emails
  return [
    { email: 'admin@friendshipcentergallery.org', name: 'Gallery Admin' }
  ];
}

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

/**
 * Extract plain text from HTML email
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

