export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, string | number | boolean | undefined>;
  replyTo?: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Artist-specific email data
export interface ArtistInvitationData {
  artistName: string;
  artistEmail: string;
  invitationCode?: string; // Made optional since we're not using it anymore
  adminName: string;
  setupUrl: string;
  baseUrl: string; // Added for login page link
}

export interface ArtworkApprovalData {
  artistName: string;
  artworkTitle: string;
  artworkId: string;
  approvedBy: string;
  publishedUrl: string;
}

export interface ArtworkRejectionData {
  artistName: string;
  artworkTitle: string;
  artworkId: string;
  rejectionReason: string;
  adminContact: string;
}

export interface ArtistWelcomeData {
  artistName: string;
  artistEmail: string;
  dashboardUrl: string;
  supportEmail: string;
}

export interface ArtworkSubmissionNotificationData {
  artistName: string;
  artworkTitle: string;
  artworkId: string;
  submissionDate: string;
  reviewUrl: string;
}

