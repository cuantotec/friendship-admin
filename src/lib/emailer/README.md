# Email System Documentation

A comprehensive email system for The Friendship Center Gallery Admin with professional templates, Resend integration, and full artist/artwork management capabilities.

## Features

- **Professional Templates**: Beautiful, responsive email templates with gallery branding
- **Artist Management**: Invitation, welcome, and notification emails
- **Artwork Notifications**: Approval, rejection, and submission alerts
- **Modular Design**: Reusable components and templates
- **Type Safety**: Full TypeScript support
- **Resend Integration**: Reliable email delivery service
- **Dedicated Email Addresses**:
  - Admin emails: `admin@friendshipcentergallery.org`
  - Artist emails: `artists@friendshipcentergallery.org`
  - General emails: `noreply@friendshipcentergallery.org`

## Installation

The required packages are already installed:
- `resend@6.1.2` - Email sending service
- `@react-email/render@1.3.2` - Email rendering (already installed)
- `@maizzle/framework@5.2.7` - Email template framework
- `tailwindcss-preset-email@1.4.0` - Tailwind CSS preset for emails

## Environment Setup

Add to your `.env.local`:

```env
# Resend API Key (required for email sending)
RESEND_API_KEY=your_resend_api_key_here

# Admin Emails (JSON array, optional - defaults to admin@friendshipcentergallery.org)
ADMIN_EMAILS='[{"email":"admin@friendshipcentergallery.org","name":"Gallery Admin"}]'

# Base URL for links in emails
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

### Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Add it to your `.env.local` as `RESEND_API_KEY`

## Usage Examples

### 1. Artist Invitation Email

Send when inviting a new artist to join the gallery:

```typescript
import { sendArtistInvitation } from '@/lib/emailer';

await sendArtistInvitation({
  artistName: 'Jane Doe',
  artistEmail: 'jane@example.com',
  invitationCode: 'INVITE-2024-ABC123',
  adminName: 'Gallery Admin',
  setupUrl: 'https://admin.friendshipcentergallery.org/setup?code=ABC123'
});
```

### 2. Artist Welcome Email

Send after artist completes registration:

```typescript
import { sendArtistWelcome } from '@/lib/emailer';

await sendArtistWelcome({
  artistName: 'Jane Doe',
  artistEmail: 'jane@example.com',
  dashboardUrl: 'https://admin.friendshipcentergallery.org/dashboard',
  supportEmail: 'support@friendshipcentergallery.org'
});
```

### 3. Artwork Approval Email

Send when approving an artist's artwork:

```typescript
import { sendArtworkApproval } from '@/lib/emailer';

await sendArtworkApproval({
  artistName: 'Jane Doe',
  artworkTitle: 'Sunset Dreams',
  artworkId: '12345',
  approvedBy: 'Gallery Admin',
  publishedUrl: 'https://friendshipcentergallery.org/artwork/sunset-dreams'
});
```

### 4. Artwork Rejection Email

Send when rejecting an artwork submission:

```typescript
import { sendArtworkRejection } from '@/lib/emailer';

await sendArtworkRejection({
  artistName: 'Jane Doe',
  artworkTitle: 'Abstract Piece',
  artworkId: '12346',
  rejectionReason: 'The image quality does not meet our gallery standards. Please resubmit with higher resolution photos.',
  adminContact: 'admin@friendshipcentergallery.org'
});
```

### 5. Artwork Submission Notification (to Admins)

Send to admins when artist submits new artwork:

```typescript
import { sendArtworkSubmissionNotification } from '@/lib/emailer';

await sendArtworkSubmissionNotification({
  artistName: 'Jane Doe',
  artworkTitle: 'New Masterpiece',
  artworkId: '12347',
  submissionDate: 'January 15, 2024 at 10:30 AM',
  reviewUrl: 'https://admin.friendshipcentergallery.org/artworks/review/12347'
});
```

### 6. Custom Admin Notification

Send custom notifications to admins:

```typescript
import { sendAdminNotification } from '@/lib/emailer';

await sendAdminNotification(
  'System Alert',
  '<h1>Important Update</h1><p>Something requires your attention.</p>',
  'Important Update: Something requires your attention.'
);
```

### 7. Direct Email Sending

For complete control over email content:

```typescript
import { sendEmail } from '@/lib/emailer';

await sendEmail({
  to: { email: 'artist@example.com', name: 'Artist Name' },
  subject: 'Custom Email Subject',
  html: '<h1>Custom HTML Content</h1>',
  text: 'Custom plain text content',
  from: 'custom@friendshipcentergallery.org',
  replyTo: 'reply@friendshipcentergallery.org',
  cc: [{ email: 'cc@example.com', name: 'CC Recipient' }],
  bcc: [{ email: 'bcc@example.com', name: 'BCC Recipient' }]
});
```

## Template Structure

```
src/lib/emailer/
├── components/
│   ├── Header.ts              # Email header with gallery branding
│   ├── Footer.ts              # Email footer with contact info
│   └── CommonStyles.ts        # Shared CSS styles
├── templates/
│   ├── artist-invitation-template.ts
│   ├── artist-welcome-template.ts
│   ├── artwork-approval-template.ts
│   ├── artwork-rejection-template.ts
│   ├── artwork-submission-notification-template.ts
│   └── index.ts
├── helpers.ts                 # Utility functions
├── types.ts                   # TypeScript interfaces
├── index.ts                   # Main email service
└── README.md                  # This file
```

## Email Templates

### Available Templates

1. **Artist Invitation** - Invite new artists to join the gallery
2. **Artist Welcome** - Welcome newly registered artists
3. **Artwork Approval** - Notify artist of approved artwork
4. **Artwork Rejection** - Notify artist with rejection feedback
5. **Artwork Submission Notification** - Alert admins of new submissions

### Template Features

All templates include:
- ✅ Responsive design (mobile & desktop)
- ✅ Gallery branding with logo and colors
- ✅ Social media links (Facebook, Instagram, TikTok, YouTube)
- ✅ Contact information
- ✅ Unsubscribe links
- ✅ Call-to-action buttons
- ✅ Professional styling

## Integration with Server Actions

Example integration in your server actions:

```typescript
// src/lib/actions/artwork-actions.ts
import { sendArtworkApproval, sendArtworkSubmissionNotification } from '@/lib/emailer';

export async function uploadArtwork(formData: FormData) {
  try {
    // ... your upload logic ...
    
    // Send notification to admins
    await sendArtworkSubmissionNotification({
      artistName: artist.name,
      artworkTitle: artwork.title,
      artworkId: artwork.id.toString(),
      submissionDate: new Date().toLocaleString(),
      reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/artworks/review/${artwork.id}`
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to upload artwork' };
  }
}

export async function approveArtwork(artworkId: string) {
  try {
    // ... your approval logic ...
    
    // Send approval email to artist
    await sendArtworkApproval({
      artistName: artist.name,
      artworkTitle: artwork.title,
      artworkId: artwork.id.toString(),
      approvedBy: 'Gallery Admin',
      publishedUrl: `https://friendshipcentergallery.org/artwork/${artwork.slug}`
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to approve artwork' };
  }
}
```

## Helper Functions

### Date Formatting

```typescript
import { formatEmailDate, formatEmailDateRange } from '@/lib/emailer/helpers';

const formatted = formatEmailDate(new Date());
// "Monday, January 15, 2024 at 10:30 AM"

const range = formatEmailDateRange(startDate, endDate);
// "Monday, January 15 - Friday, January 19, 2024"
```

### Confirmation Numbers

```typescript
import { generateConfirmationNumber } from '@/lib/emailer/helpers';

const confirmationCode = generateConfirmationNumber('ART-');
// "ART-5K9L2M7P"
```

### Content Sanitization

```typescript
import { sanitizeEmailContent } from '@/lib/emailer/helpers';

const safe = sanitizeEmailContent(userInput);
// Prevents XSS in email content
```

## Error Handling

All email functions return an `EmailResult` object:

```typescript
interface EmailResult {
  success: boolean;
  messageId?: string;  // Resend message ID if successful
  error?: string;      // Error message if failed
}
```

Example error handling:

```typescript
const result = await sendArtistInvitation(data);

if (result.success) {
  console.log('Email sent successfully:', result.messageId);
} else {
  console.error('Failed to send email:', result.error);
}
```

## Development & Testing

### Testing Email Templates Locally

1. Set up Resend API key in `.env.local`
2. Use test mode in Resend dashboard
3. Send test emails to your own address:

```typescript
await sendEmail({
  to: { email: 'your-test@email.com', name: 'Test User' },
  subject: 'Test Email',
  html: '<h1>Test</h1>'
});
```

### Viewing Email HTML

You can export the HTML from templates for preview:

```typescript
import { generateArtistInvitationEmail } from '@/lib/emailer/templates';

const html = generateArtistInvitationEmail({
  artistName: 'Test Artist',
  artistEmail: 'test@example.com',
  invitationCode: 'TEST123',
  adminName: 'Admin',
  setupUrl: 'http://localhost:3002/setup'
});

console.log(html); // Copy to .html file and open in browser
```

## Security Considerations

1. **API Key Protection**: Never commit `.env.local` to version control
2. **Content Sanitization**: Always sanitize user input in emails
3. **Rate Limiting**: Resend has built-in rate limiting
4. **Unsubscribe Links**: All emails include unsubscribe options
5. **Recipient Validation**: Email addresses are validated by Resend

## Production Deployment

Before deploying to production:

1. ✅ Set `RESEND_API_KEY` in production environment
2. ✅ Update `NEXT_PUBLIC_BASE_URL` to production domain
3. ✅ Configure custom domain in Resend (optional)
4. ✅ Set up proper `ADMIN_EMAILS` list
5. ✅ Test all email templates
6. ✅ Verify unsubscribe functionality

## Support

For issues or questions:
- Email: admin@friendshipcentergallery.org
- Documentation: This README
- Resend Docs: [resend.com/docs](https://resend.com/docs)

## Future Enhancements

Potential additions:
- [ ] Email scheduling/queuing
- [ ] Email analytics tracking
- [ ] A/B testing support
- [ ] Multi-language templates
- [ ] Email template builder UI
- [ ] Automated reminder emails
- [ ] Newsletter templates

