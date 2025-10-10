# Stack Auth Role-Based Redirection Setup

This document explains how to set up role-based redirection using Stack Auth user metadata.

## Overview

The application now supports role-based redirection after OTP authentication. Users are automatically redirected to different dashboards based on their role:

- **Admin/Super Admin**: Redirected to `/admin` (or root `/` for now)
- **Artist**: Redirected to `/artist`

## Setting Up User Roles in Stack Auth

### 1. In Stack Auth Dashboard

1. Go to your Stack Auth project dashboard
2. Navigate to **Users** section
3. Find the user you want to assign a role to
4. Click on the user to edit their profile
5. In the **Server Metadata** section, add:
   ```json
   {
     "role": "admin"
   }
   ```
   or
   ```json
   {
     "role": "artist"
   }
   ```

### 2. Available Roles

- `admin` - Full access to admin dashboard
- `super_admin` - Full access to admin dashboard (same as admin)
- `artist` - Access to artist dashboard (default if no role is set)

### 3. Artist Metadata Structure

For artist users, you need to include both `role` and `artistID` in the server metadata:

```json
{
  "role": "artist",
  "artistID": 1
}
```

Where `artistID` corresponds to the `id` field in the `artists` table in your database.

**Note**: The system checks `serverMetadata` first, then falls back to `clientMetadata` for backward compatibility.

### 4. Programmatic Role Assignment

You can also set roles programmatically when creating users or during authentication:

```typescript
// Example: Setting role during user creation
await stackServerApp.createUser({
  email: "user@example.com",
  serverMetadata: {
    role: "admin"
  }
});

// Example: Updating user role
await stackServerApp.updateUser(userId, {
  serverMetadata: {
    role: "artist"
  }
});
```

## How It Works

1. **OTP Verification**: When a user verifies their OTP, the system checks their `serverMetadata.role` (with fallback to `clientMetadata.role`)
2. **Role Detection**: The `getUserRole()` helper function extracts the role from Stack Auth user data
3. **Redirection**: Based on the role, users are redirected to:
   - `/admin` for admin/super_admin roles
   - `/artist` for artist role
   - `/login` if no role is found

## Helper Functions

The following helper functions are available in `src/lib/stack-auth-helpers.ts`:

- `getUserRole()` - Returns the user's role from Stack Auth metadata
- `isUserAdmin()` - Returns true if user is admin or super_admin
- `isUserArtist()` - Returns true if user is artist
- `getRedirectPath(role)` - Returns the appropriate redirect path for a given role

## Testing

To test role-based redirection:

1. Set up a user with `role: "admin"` in Stack Auth
2. Sign in with OTP - should redirect to admin dashboard
3. Set up a user with `role: "artist"` in Stack Auth
4. Sign in with OTP - should redirect to artist dashboard
5. Set up a user with no role - should default to artist dashboard

## Migration from Existing Users

If you have existing users without role metadata:

1. They will default to the "artist" role
2. You can update their roles in the Stack Auth dashboard
3. Or use the programmatic approach to bulk update roles

## Security Notes

- Role checking happens server-side for security
- Client metadata is not directly accessible from the client
- Always validate roles on the server before granting access to protected resources
