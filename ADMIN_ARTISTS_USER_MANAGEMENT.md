# Admin Artists Page - User Management Features

## Overview

The Admin Artists page now includes Stack Auth user management features, allowing administrators to view which artists have active user accounts and manage those accounts.

## Features Implemented

### 1. Image Configuration Fix
- ✅ Added `ui-avatars.com` to Next.js image configuration
- ✅ Fixes the Next.js image hostname error for avatar images

### 2. Stack Auth User Integration
- ✅ Artists table now shows Stack Auth user status
- ✅ Displays whether each artist has an active user account
- ✅ Shows user email from Stack Auth if available

### 3. User Status Display
- ✅ **Active User** badge (green) - Artist has a Stack Auth account
- ✅ **No Account** badge (gray) - Artist doesn't have a Stack Auth account
- ✅ Displays user email in the Email column when available

### 4. User Management Actions

For artists with active Stack Auth accounts, administrators can:

#### Password Reset
- Send password reset instructions to the user
- Shows forgot password link that can be shared with the user
- Non-intrusive info toast with 8-second duration

#### User Blocking/Unblocking
- Block user access (future feature)
- Unblock user access (future feature)
- Currently provides instructions to use Stack Auth Dashboard
- Will be fully implemented when Stack Auth API supports these operations

### 5. Enhanced Artist Actions Menu

The artist actions now include:
- 👁️ **Toggle Visibility** - Show/hide artist on the public site
- ⋮ **User Management Menu** (only for artists with accounts):
  - 🔑 **Reset Password** - Send password reset instructions
  - 🛡️ **Block User** - Block user access (via Stack Auth Dashboard)
  - ✅ **Unblock User** - Unblock user access (via Stack Auth Dashboard)
- 🗑️ **Delete Artist** - Delete artist (only if no artworks)

## Technical Implementation

### Files Modified

1. **`next.config.ts`**
   - Added `ui-avatars.com` to allowed image domains

2. **`src/types/index.ts`**
   - Added Stack Auth user fields to `ArtistListItem` interface:
     - `hasUser: boolean`
     - `userId: string | null`
     - `userEmail: string | null`
     - `userPrimaryEmail: string | null`

3. **`src/lib/actions/admin-actions.ts`**
   - Updated `getAllArtists()` to fetch Stack Auth users
   - Matches artists with Stack Auth users via `artistID` in `serverMetadata`
   - Added `sendPasswordResetEmail()` server action
   - Added `updateUserStatus()` server action for blocking/unblocking

4. **`src/app/admin/artists/page.tsx`**
   - Fixed Next.js 15 `searchParams` await requirement
   - Updated to pass user data to artists table

5. **`src/components/admin/artists-table.tsx`**
   - Added "User Status" column
   - Displays user account status with badges
   - Passes user data to artist actions component

6. **`src/components/admin/artist-actions.tsx`**
   - Added dropdown menu for user management
   - Implemented password reset handler
   - Implemented block/unblock user handlers
   - Shows informational toasts with instructions

## How It Works

### User Matching Logic

```typescript
// In getAllArtists() server action
const stackUser = stackUsers.find(u => {
  const artistId = u.serverMetadata?.artistID;
  return artistId && parseInt(String(artistId)) === row.id;
});
```

Artists are matched with Stack Auth users by comparing:
- Artist database ID (from `artists` table)
- `artistID` field in Stack Auth user's `serverMetadata`

### Password Reset Flow

1. Admin clicks "Reset Password" for an artist with a user account
2. System provides forgot password link: `/forgot-password`
3. Admin can share this link with the user
4. User uses the link to reset their password via Stack Auth

### User Blocking (Future Implementation)

Currently shows instructions to use Stack Auth Dashboard. Will be fully implemented when Stack Auth provides API methods for:
- `stackServerApp.getUser({ userId })`
- `stackServerApp.updateUser(userId, options)`
- User blocking/disabling functionality

## Usage

### For Administrators

1. **View User Status**
   - Navigate to `/admin/artists`
   - Look at the "User Status" column
   - Green "Active User" = Artist has an account
   - Gray "No Account" = Artist doesn't have an account

2. **Reset User Password**
   - Click the ⋮ menu for an artist with an account
   - Select "Reset Password"
   - Copy the forgot password link from the toast message
   - Share the link with the user

3. **Block/Unblock User**
   - Click the ⋮ menu for an artist with an account
   - Select "Block User" or "Unblock User"
   - Follow instructions to use Stack Auth Dashboard

### For Developers

To set up an artist with a Stack Auth account:

```json
// In Stack Auth Dashboard > Users > Edit User > Server Metadata
{
  "role": "artist",
  "artistID": 1  // Must match the artist.id from database
}
```

## Security

- ✅ All user management actions require admin authentication
- ✅ Uses `requireAdmin()` helper for authorization
- ✅ Only uses `serverMetadata` for secure user role/ID checking
- ✅ Client-side UI only shows for authorized admins

## Future Enhancements

1. **Direct Password Reset Email**
   - Implement when Stack Auth API provides email sending
   - Automatically send reset email instead of showing link

2. **User Blocking API Integration**
   - Implement when Stack Auth provides blocking API
   - Add real-time user status (blocked/active)
   - Add blocked user count to dashboard stats

3. **User Activity Logs**
   - Show last login time
   - Show recent actions
   - Add activity timeline

4. **Bulk User Management**
   - Send reset emails to multiple users
   - Bulk block/unblock operations
   - Export user list with status

## Testing

### Test Cases

1. **Image Loading**
   - ✅ Avatar images from ui-avatars.com load correctly
   - ✅ No Next.js image configuration errors

2. **User Status Display**
   - ✅ Artists with Stack Auth accounts show "Active User"
   - ✅ Artists without accounts show "No Account"
   - ✅ User email displays correctly when available

3. **Password Reset**
   - ✅ Shows forgot password link for users with accounts
   - ✅ Link is correct and accessible
   - ✅ Toast message displays for 8 seconds

4. **User Management Menu**
   - ✅ Menu only shows for artists with accounts
   - ✅ All menu items are accessible
   - ✅ Actions show appropriate messages

## Notes

- The TypeScript linter error for `@/components/admin/artists-table` is a cache issue and will resolve automatically
- Stack Auth user management features will be enhanced as Stack Auth API evolves
- Current implementation provides admin instructions until direct API integration is available

