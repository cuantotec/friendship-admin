# Email System Integration Examples

This document provides practical examples of how to integrate the email system into your existing codebase.

## Table of Contents

1. [Artwork Upload Integration](#artwork-upload-integration)
2. [Artwork Approval Integration](#artwork-approval-integration)
3. [Artwork Rejection Integration](#artwork-rejection-integration)
4. [Artist Invitation Integration](#artist-invitation-integration)
5. [Artist Registration Integration](#artist-registration-integration)

---

## Artwork Upload Integration

Send notifications to admins when an artist uploads new artwork.

### File: `src/lib/actions/artwork-actions.ts`

```typescript
import { sendArtworkSubmissionNotification } from '@/lib/emailer';
import { getArtistId } from '@/lib/stack-auth-helpers';
import { pool } from '@/lib/db';

export async function uploadArtwork(formData: FormData) {
  try {
    // Get artist ID
    const artistId = await getArtistId();
    if (!artistId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get artist details
    const artistResult = await pool.query(
      'SELECT * FROM artists WHERE id = $1',
      [artistId]
    );
    const artist = artistResult.rows[0];

    // Your existing upload logic here...
    const artwork = {
      id: '12345', // generated artwork ID
      title: formData.get('title') as string,
      // ... other fields
    };

    // Send notification email to admins
    await sendArtworkSubmissionNotification({
      artistName: artist.name,
      artworkTitle: artwork.title,
      artworkId: artwork.id,
      submissionDate: new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/artworks/review/${artwork.id}`
    });

    return { success: true, artwork };
  } catch (error) {
    console.error('Error uploading artwork:', error);
    return { success: false, error: 'Failed to upload artwork' };
  }
}
```

---

## Artwork Approval Integration

Send approval emails to artists when their artwork is approved.

### File: `src/lib/actions/admin-artwork-actions.ts`

```typescript
import { sendArtworkApproval } from '@/lib/emailer';
import { pool } from '@/lib/db';

export async function approveArtwork(artworkId: string) {
  try {
    // Update artwork status to approved
    await pool.query(
      'UPDATE artworks SET status = $1, approved_at = NOW() WHERE id = $2',
      ['approved', artworkId]
    );

    // Get artwork and artist details
    const result = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.slug,
        ar.name as artist_name,
        ar.email as artist_email
      FROM artworks a
      JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id = $1
    `, [artworkId]);

    const artwork = result.rows[0];

    if (!artwork) {
      return { success: false, error: 'Artwork not found' };
    }

    // Send approval email to artist
    await sendArtworkApproval({
      artistName: artwork.artist_name,
      artworkTitle: artwork.title,
      artworkId: artwork.id,
      approvedBy: 'Gallery Admin',
      publishedUrl: `https://friendshipcentergallery.org/artwork/${artwork.slug}`
    });

    return { success: true, message: 'Artwork approved and artist notified' };
  } catch (error) {
    console.error('Error approving artwork:', error);
    return { success: false, error: 'Failed to approve artwork' };
  }
}
```

---

## Artwork Rejection Integration

Send rejection emails with feedback to artists.

### File: `src/lib/actions/admin-artwork-actions.ts`

```typescript
import { sendArtworkRejection } from '@/lib/emailer';
import { pool } from '@/lib/db';

export async function rejectArtwork(
  artworkId: string, 
  rejectionReason: string
) {
  try {
    // Update artwork status to rejected
    await pool.query(
      'UPDATE artworks SET status = $1, rejection_reason = $2, rejected_at = NOW() WHERE id = $3',
      ['rejected', rejectionReason, artworkId]
    );

    // Get artwork and artist details
    const result = await pool.query(`
      SELECT 
        a.id,
        a.title,
        ar.name as artist_name,
        ar.email as artist_email
      FROM artworks a
      JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id = $1
    `, [artworkId]);

    const artwork = result.rows[0];

    if (!artwork) {
      return { success: false, error: 'Artwork not found' };
    }

    // Send rejection email to artist
    await sendArtworkRejection({
      artistName: artwork.artist_name,
      artworkTitle: artwork.title,
      artworkId: artwork.id,
      rejectionReason: rejectionReason,
      adminContact: 'eliran@cuantotec.com'
    });

    return { success: true, message: 'Artwork rejected and artist notified' };
  } catch (error) {
    console.error('Error rejecting artwork:', error);
    return { success: false, error: 'Failed to reject artwork' };
  }
}
```

---

## Artist Invitation Integration

Send invitation emails when adding new artists to the gallery.

### File: `src/lib/actions/admin-artist-actions.ts`

```typescript
import { sendArtistInvitation } from '@/lib/emailer';
import { generateConfirmationNumber } from '@/lib/emailer/helpers';
import { pool } from '@/lib/db';

export async function inviteArtist(formData: FormData) {
  try {
    const artistName = formData.get('name') as string;
    const artistEmail = formData.get('email') as string;
    const adminName = formData.get('adminName') as string || 'Gallery Admin';

    // Generate unique invitation code
    const invitationCode = generateConfirmationNumber('INVITE-');

    // Store invitation in database
    await pool.query(
      `INSERT INTO artist_invitations (email, name, code, invited_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [artistEmail, artistName, invitationCode, adminName]
    );

    // Send invitation email
    await sendArtistInvitation({
      artistName,
      artistEmail,
      invitationCode,
      adminName,
      setupUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/setup?code=${invitationCode}`
    });

    return { 
      success: true, 
      message: 'Invitation sent successfully',
      invitationCode 
    };
  } catch (error) {
    console.error('Error inviting artist:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}
```

---

## Artist Registration Integration

Send welcome emails when artists complete their registration.

### File: `src/lib/actions/artist-registration-actions.ts`

```typescript
import { sendArtistWelcome } from '@/lib/emailer';
import { pool } from '@/lib/db';

export async function completeArtistRegistration(formData: FormData) {
  try {
    const invitationCode = formData.get('code') as string;
    
    // Verify invitation code
    const inviteResult = await pool.query(
      'SELECT * FROM artist_invitations WHERE code = $1 AND used_at IS NULL',
      [invitationCode]
    );

    if (inviteResult.rows.length === 0) {
      return { success: false, error: 'Invalid or expired invitation code' };
    }

    const invitation = inviteResult.rows[0];

    // Create artist account
    const artistResult = await pool.query(
      `INSERT INTO artists (name, email, bio, specialty, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [
        formData.get('name'),
        invitation.email,
        formData.get('bio'),
        formData.get('specialty')
      ]
    );

    const artist = artistResult.rows[0];

    // Mark invitation as used
    await pool.query(
      'UPDATE artist_invitations SET used_at = NOW(), artist_id = $1 WHERE code = $2',
      [artist.id, invitationCode]
    );

    // Send welcome email
    await sendArtistWelcome({
      artistName: artist.name,
      artistEmail: artist.email,
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      supportEmail: 'eliran@cuantotec.com'
    });

    return { 
      success: true, 
      message: 'Registration completed successfully',
      artist 
    };
  } catch (error) {
    console.error('Error completing registration:', error);
    return { success: false, error: 'Failed to complete registration' };
  }
}
```

---

## Error Handling Best Practices

Always handle email errors gracefully without breaking the main flow:

```typescript
export async function uploadArtwork(formData: FormData) {
  try {
    // Main upload logic
    const artwork = await saveArtworkToDatabase(formData);

    // Send email notification (non-blocking)
    try {
      const emailResult = await sendArtworkSubmissionNotification({
        // ... email data
      });

      if (!emailResult.success) {
        console.error('Failed to send notification email:', emailResult.error);
        // Optionally log to database for retry later
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't throw - continue with upload success
    }

    return { success: true, artwork };
  } catch (error) {
    return { success: false, error: 'Upload failed' };
  }
}
```

---

## Using in Server Components

You can also call email functions directly from server components:

```typescript
// app/admin/artworks/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendArtworkApproval } from '@/lib/emailer';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Approve logic...
    
    // Send email
    await sendArtworkApproval({
      artistName: 'Artist Name',
      artworkTitle: 'Artwork Title',
      artworkId: params.id,
      approvedBy: 'Admin',
      publishedUrl: `https://gallery.org/artwork/${params.id}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## Testing Email Integration

Use the test script to verify email functionality:

```bash
npm run test:email
```

Or create your own test:

```typescript
import { sendEmail } from '@/lib/emailer';

const result = await sendEmail({
  to: { email: 'your-email@example.com', name: 'Test User' },
  subject: 'Test Email',
  html: '<h1>Test</h1>'
});

console.log(result.success ? 'Sent!' : `Failed: ${result.error}`);
```

---

## Environment Variables

Make sure these are set in your `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3002
ADMIN_EMAILS='[{"email":"admin@gallery.org","name":"Admin"}]'
```

---

## Next Steps

1. Choose the integration points that match your workflow
2. Copy the relevant code examples
3. Adjust to match your database schema and logic
4. Test with the provided test script
5. Deploy and monitor email deliverability

For more information, see:
- `src/lib/emailer/README.md` - Full API documentation
- `EMAIL_SYSTEM_SETUP.md` - Setup guide
- `scripts/test-email.ts` - Test script

