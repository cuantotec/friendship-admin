import { Resend } from 'resend';
import { 
  EmailOptions, 
  EmailResult, 
  EmailRecipient,
  ArtistInvitationData,
  ArtworkApprovalData,
  ArtworkRejectionData,
  ArtistWelcomeData,
  ArtworkSubmissionNotificationData
} from './types';
import {
  generateArtistInvitationEmail,
  generateArtworkApprovalEmail,
  generateArtworkRejectionEmail,
  generateArtistWelcomeEmail,
  generateArtworkSubmissionNotificationEmail
} from './templates';
import { getAdminEmails, htmlToPlainText } from './helpers';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email addresses
const DEFAULT_FROM = 'Friendship Center Gallery <noreply@friendshipcentergallery.org>';
const ADMIN_FROM = 'Friendship Center Gallery <admin@friendshipcentergallery.org>';
const ARTIST_FROM = 'Friendship Center Gallery <artists@friendshipcentergallery.org>';

// Hard default BCC for all outgoing emails
const DEFAULT_BCC = 'eliran@cuantotec.com';

/**
 * Normalize email recipients to array format
 */
function normalizeRecipients(recipients: EmailRecipient | EmailRecipient[]): EmailRecipient[] {
  return Array.isArray(recipients) ? recipients : [recipients];
}

/**
 * Format recipients for Resend API
 */
function formatRecipients(recipients: EmailRecipient[]): string[] {
  return recipients.map(recipient => 
    recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
  );
}

/**
 * Core email sending function using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // Validate required fields
    if (!options.to) {
      throw new Error('Recipient (to) is required');
    }
    if (!options.subject) {
      throw new Error('Subject is required');
    }
    if (!options.html && !options.text) {
      throw new Error('Either HTML or text content is required');
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email will not be sent.');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    // Normalize recipients
    const toRecipients = normalizeRecipients(options.to);
    const ccRecipients = options.cc ? normalizeRecipients(options.cc) : [];
    const bccRecipients = options.bcc ? normalizeRecipients(options.bcc) : [];

    // Prepare email data
    const emailData: {
      from: string;
      to: string | string[];
      subject: string;
      html?: string;
      text: string;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
    } = {
      from: options.from || DEFAULT_FROM,
      to: formatRecipients(toRecipients),
      subject: options.subject,
      html: options.html,
      text: options.text || (options.html ? htmlToPlainText(options.html) : ''),
    };

    // Add CC if provided
    if (ccRecipients.length > 0) {
      emailData.cc = formatRecipients(ccRecipients);
    }

    // Always add hard default BCC + any additional BCCs
    const allBccRecipients = [
      { email: DEFAULT_BCC },
      ...bccRecipients
    ];
    emailData.bcc = formatRecipients(allBccRecipients);

    // Add reply-to if provided
    if (options.replyTo) {
      emailData.replyTo = options.replyTo;
    }

    console.log('📧 Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from
    });

    // Send email
    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('Resend error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email'
      };
    }

    console.log('✅ Email sent successfully:', result.data?.id);

    return {
      success: true,
      messageId: result.data?.id
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send artist invitation email
 */
export async function sendArtistInvitation(data: ArtistInvitationData): Promise<EmailResult> {
  const html = generateArtistInvitationEmail(data);
  
  return await sendEmail({
    to: { email: data.artistEmail, name: data.artistName },
    subject: '🎨 You\'re Invited to Join The Friendship Center Gallery',
    html,
    from: ARTIST_FROM,
  });
}

/**
 * Send artwork approval email
 */
export async function sendArtworkApproval(data: ArtworkApprovalData): Promise<EmailResult> {
  const html = generateArtworkApprovalEmail(data);
  
  return await sendEmail({
    to: { email: data.artistName, name: data.artistName },
    subject: `✅ Artwork Approved: ${data.artworkTitle}`,
    html,
    from: ARTIST_FROM,
  });
}

/**
 * Send artwork rejection email
 */
export async function sendArtworkRejection(data: ArtworkRejectionData): Promise<EmailResult> {
  const html = generateArtworkRejectionEmail(data);
  
  return await sendEmail({
    to: { email: data.artistName, name: data.artistName },
    subject: `Artwork Submission Update: ${data.artworkTitle}`,
    html,
    from: ARTIST_FROM,
  });
}

/**
 * Send artist welcome email
 */
export async function sendArtistWelcome(data: ArtistWelcomeData): Promise<EmailResult> {
  const html = generateArtistWelcomeEmail(data);
  
  return await sendEmail({
    to: { email: data.artistEmail, name: data.artistName },
    subject: '🎉 Welcome to The Friendship Center Gallery!',
    html,
    from: ARTIST_FROM,
  });
}

/**
 * Send artwork submission notification to admins
 */
export async function sendArtworkSubmissionNotification(
  data: ArtworkSubmissionNotificationData
): Promise<EmailResult> {
  const html = generateArtworkSubmissionNotificationEmail(data);
  const adminEmails = getAdminEmails();
  
  return await sendEmail({
    to: adminEmails,
    subject: `🎨 New Artwork Submission: ${data.artworkTitle}`,
    html,
    from: ADMIN_FROM,
  });
}

/**
 * Send notification email to admins
 */
export async function sendAdminNotification(
  subject: string,
  html: string,
  text?: string
): Promise<EmailResult> {
  const adminEmails = getAdminEmails();

  return await sendEmail({
    to: adminEmails,
    subject: `[Gallery Admin] ${subject}`,
    html,
    text,
    from: ADMIN_FROM,
  });
}

/**
 * Send custom email with template rendering
 */
export async function sendTemplateEmail(
  templateName: string,
  options: Omit<EmailOptions, 'html'>
): Promise<EmailResult> {
  // This is a placeholder for future template expansion
  // You can add more templates as needed
  
  console.warn(`Template "${templateName}" not found. Sending plain email.`);
  
  return await sendEmail({
    ...options,
    html: options.text || 'No content provided',
  });
}

// Export types for use in other files
export type { 
  EmailOptions, 
  EmailResult, 
  EmailRecipient,
  ArtistInvitationData,
  ArtworkApprovalData,
  ArtworkRejectionData,
  ArtistWelcomeData,
  ArtworkSubmissionNotificationData
} from './types';

