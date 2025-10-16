# Email System Setup Guide

This document explains how to set up and use the email system in the Friendship Gallery Admin application.

## Overview

The email system provides professional, branded email templates for:
- **Artist invitations** - Invite new artists to join the gallery
- **Artist welcome emails** - Welcome newly registered artists  
- **Artwork approvals** - Notify artists when their work is approved
- **Artwork rejections** - Provide feedback on rejected submissions
- **Admin notifications** - Alert admins of new artwork submissions

## Quick Start

### 1. Install Dependencies

The required packages are already installed:
```bash
npm install resend@6.1.2 @maizzle/framework@5.2.7 tailwindcss-preset-email@1.4.0
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create a new API key in your dashboard
3. Copy the API key

### 3. Configure Environment Variables

Add to your `.env.local`:

```env
# Required: Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Optional: Admin email recipients (JSON array)
ADMIN_EMAILS='[{"email":"admin@friendshipcentergallery.org","name":"Gallery Admin"}]'

# Required: Base URL for email links
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

### 4. Test the Email System

Create a test file to verify the setup:

```typescript
// scripts/test-email.ts
import { sendEmail } from '@/lib/emailer';

async function testEmail() {
  const result = await sendEmail({
    to: { email: 'your-email@example.com', name: 'Test User' },
    subject: 'Test Email from Gallery Admin',
    html: '<h1>Success!</h1><p>The email system is working correctly.</p>',
  });

  if (result.success) {
    console.log('✅ Email sent successfully!', result.messageId);
  } else {
    console.error('❌ Failed to send email:', result.error);
  }
}

testEmail();
```

Run with:
```bash
npx tsx scripts/test-email.ts
```

## Usage Examples

### Send Artist Invitation

```typescript
import { sendArtistInvitation } from '@/lib/emailer';

await sendArtistInvitation({
  artistName: 'Jane Doe',
  artistEmail: 'jane@example.com',
  invitationCode: 'INVITE-2024-ABC123',
  adminName: 'Gallery Director',
  setupUrl: 'https://admin.friendshipcentergallery.org/setup?code=ABC123'
});
```

### Send Artwork Approval

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

### Send Artwork Rejection

```typescript
import { sendArtworkRejection } from '@/lib/emailer';

await sendArtworkRejection({
  artistName: 'Jane Doe',
  artworkTitle: 'Abstract Piece',
  artworkId: '12346',
  rejectionReason: 'Image quality does not meet gallery standards. Please submit higher resolution photos.',
  adminContact: 'admin@friendshipcentergallery.org'
});
```

### Notify Admins of New Submission

```typescript
import { sendArtworkSubmissionNotification } from '@/lib/emailer';

await sendArtworkSubmissionNotification({
  artistName: 'Jane Doe',
  artworkTitle: 'New Masterpiece',
  artworkId: '12347',
  submissionDate: new Date().toLocaleString(),
  reviewUrl: 'https://admin.friendshipcentergallery.org/artworks/review/12347'
});
```

## Integration with Existing Code

### Example: Artwork Upload Action

```typescript
// src/lib/actions/artwork-actions.ts
import { sendArtworkSubmissionNotification } from '@/lib/emailer';

export async function uploadArtwork(formData: FormData) {
  try {
    // Your existing upload logic
    const artwork = await saveArtworkToDatabase(formData);
    
    // Send notification to admins
    await sendArtworkSubmissionNotification({
      artistName: currentArtist.name,
      artworkTitle: artwork.title,
      artworkId: artwork.id.toString(),
      submissionDate: new Date().toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short'
      }),
      reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/review/${artwork.id}`
    });
    
    return { success: true, artwork };
  } catch (error) {
    return { success: false, error: 'Upload failed' };
  }
}
```

### Example: Artwork Approval Action

```typescript
// src/lib/actions/artwork-actions.ts
import { sendArtworkApproval } from '@/lib/emailer';

export async function approveArtwork(artworkId: string) {
  try {
    // Update artwork status
    await updateArtworkStatus(artworkId, 'approved');
    
    // Get artwork and artist details
    const artwork = await getArtworkById(artworkId);
    const artist = await getArtistById(artwork.artistId);
    
    // Send approval email
    await sendArtworkApproval({
      artistName: artist.name,
      artworkTitle: artwork.title,
      artworkId: artwork.id.toString(),
      approvedBy: 'Gallery Admin',
      publishedUrl: `https://friendshipcentergallery.org/artwork/${artwork.slug}`
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Approval failed' };
  }
}
```

## Email Templates

All email templates include:

### Header
- Gallery logo and branding
- Purple gradient design
- Responsive layout

### Footer
- Contact information
- Social media links (Facebook, Instagram, TikTok, YouTube)
- Physical address
- Unsubscribe link

### Styling
- Montserrat font family
- Responsive design for mobile and desktop
- Professional color scheme
- Call-to-action buttons
- Info boxes and highlights

## File Structure

```
src/lib/emailer/
├── components/
│   ├── Header.ts              # Email header template
│   ├── Footer.ts              # Email footer template
│   └── CommonStyles.ts        # Shared CSS styles
├── templates/
│   ├── artist-invitation-template.ts
│   ├── artist-welcome-template.ts
│   ├── artwork-approval-template.ts
│   ├── artwork-rejection-template.ts
│   ├── artwork-submission-notification-template.ts
│   └── index.ts
├── helpers.ts                 # Utility functions
├── types.ts                   # TypeScript types
├── index.ts                   # Main email service
└── README.md                  # Detailed documentation
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | Your Resend API key | `re_xxxxxxxxxxxx` |
| `ADMIN_EMAILS` | No | JSON array of admin emails | `[{"email":"admin@gallery.org","name":"Admin"}]` |
| `NEXT_PUBLIC_BASE_URL` | Yes | Base URL for email links | `http://localhost:3002` |

## Production Checklist

Before deploying to production:

- [ ] Set `RESEND_API_KEY` in production environment
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain  
- [ ] Configure `ADMIN_EMAILS` with real admin addresses
- [ ] Test all email templates with real data
- [ ] Verify unsubscribe links work correctly
- [ ] Set up custom domain in Resend (optional)
- [ ] Configure SPF/DKIM records for better deliverability

## Troubleshooting

### Email not sending

1. Check if `RESEND_API_KEY` is set correctly
2. Verify the API key is valid in Resend dashboard
3. Check server logs for error messages
4. Ensure recipient email is valid

### Emails going to spam

1. Configure custom domain in Resend
2. Set up SPF and DKIM records
3. Avoid spam trigger words in subject/content
4. Include unsubscribe links (already included)

### Template not rendering correctly

1. Test HTML in browser first
2. Check for unclosed HTML tags
3. Verify inline styles are present
4. Test in multiple email clients

## Support Resources

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Email Best Practices**: [resend.com/blog](https://resend.com/blog)
- **Detailed System Docs**: See `src/lib/emailer/README.md`
- **Gallery Support**: admin@friendshipcentergallery.org

## Next Steps

1. ✅ Install packages (already done)
2. ✅ Configure environment variables
3. ✅ Test email sending
4. ✅ Integrate with existing actions
5. ✅ Deploy to production
6. ✅ Monitor email deliverability

The email system is now ready to use! 🎉

