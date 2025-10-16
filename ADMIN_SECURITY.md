# Admin Dashboard Security

This document outlines the comprehensive security measures implemented to ensure only users with the `admin` role can access the admin dashboard.

## 🔒 Multi-Layer Security Protection

The admin dashboard uses **defense in depth** with multiple layers of security verification at every level.

## 🎯 Admin Dashboard Location

**The admin dashboard is located at `/` (root URL)**
- Admins see the admin dashboard at the root
- Artists see their artist portal at the root
- Role is checked to determine which dashboard to show

**Admin management pages:**
- `/admin/artworks` - Artworks management
- `/admin/artists` - Artists management  
- `/admin/events` - Events management
- `/admin` - Redirects to `/`

## 🛡️ Security Layers

### Layer 1: Middleware Protection (First Line of Defense)

**File:** `src/middleware.ts`

The middleware intercepts **all requests** to `/admin/*` routes before they reach any page:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    const user = await stackServerApp.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role (must be "admin" in clientMetadata)
    const hasAdminAccess = user.clientMetadata?.role === "admin";

    // Redirect non-admins to home
    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}
```

**Protection:**
- ✅ Runs on **every request** to `/admin/*`
- ✅ Checks authentication first
- ✅ Verifies `role === "admin"` in `clientMetadata`
- ✅ Redirects unauthorized users to home page
- ✅ Preserves intended URL for post-login redirect

### Layer 2: Main Dashboard Role Check (Root Page)

**File:** `src/app/page.tsx`

The main dashboard at `/` checks the user's role and shows appropriate content:

```typescript
export default async function Dashboard() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get user role
  const isAdmin = await isUserAdmin();
  
  if (isAdmin) {
    // Fetch and show admin dashboard
    const adminStats = await getAdminStats();
    const adminArtworks = await getAllArtworks();
    return <AdminDashboard stats={adminStats} artworks={adminArtworks} />;
  } else {
    // Show artist dashboard
    const artistData = await getArtistById();
    return <ArtistDashboard artist={artistData.artist} />;
  }
}
```

**Protection:**
- ✅ Server-side role check
- ✅ Admin actions only execute for admin users
- ✅ Different content rendered based on role

### Layer 3: Layout Protection (Admin Routes)

**File:** `src/app/admin/layout.tsx`

The admin layout verifies admin access for all admin management pages:

```typescript
export default async function AdminLayout({ children }) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role
  const hasAdminAccess = user.clientMetadata?.role === "admin";

  if (!hasAdminAccess) {
    redirect("/");
  }

  // Render admin UI
  return <AdminLayoutUI user={user}>{children}</AdminLayoutUI>;
}
```

**Protection:**
- ✅ Server-side authentication check
- ✅ Role verification on every page render
- ✅ Redirects non-admins to home page
- ✅ Prevents any admin UI from rendering

### Layer 4: Server Actions Protection (Every Action)

**File:** `src/lib/actions/admin-actions.ts`

**EVERY** server action verifies admin access using a helper function:

```typescript
async function requireAdmin() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const hasAdminAccess = user.clientMetadata?.role === "admin";

  if (!hasAdminAccess) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// ALL admin actions call this first
export async function getAllArtworks() {
  await requireAdmin(); // ✅ Verify admin access
  // Proceed with admin operation...
}

export async function updateArtworkLocation(artworkId: number, location: string) {
  await requireAdmin(); // ✅ Verify admin access
  // Proceed with admin operation...
}

export async function deleteArtworkAdmin(artworkId: number) {
  await requireAdmin(); // ✅ Verify admin access
  // Proceed with admin operation...
}

// ... and so on for ALL admin actions
```

**Protection:**
- ✅ Every mutation/query verifies admin role
- ✅ Throws error if unauthorized
- ✅ Cannot bypass by calling actions directly
- ✅ Works even if UI protection is bypassed

## 🔐 Protected Admin Actions

All these server actions require `role === "admin"`:

### Statistics
- ✅ `getAdminStats()` - Dashboard statistics

### Data Fetching
- ✅ `getAllArtworks()` - All artworks with artist info
- ✅ `getAllArtists()` - All artists with artwork counts
- ✅ `getAllEvents()` - All events with details

### Artworks Management
- ✅ `updateArtworkLocation(artworkId, location)` - Change location
- ✅ `toggleArtworkVisibility(artworkId)` - Show/hide artwork
- ✅ `deleteArtworkAdmin(artworkId)` - Delete artwork

### Artists Management
- ✅ `toggleArtistVisibility(artistId)` - Show/hide artist
- ✅ `deleteArtistAdmin(artistId)` - Delete artist

### Events Management
- ✅ `toggleEventCancellation(eventId)` - Cancel/uncancel event
- ✅ `deleteEventAdmin(eventId)` - Delete event

## 🔍 Authentication Flow

### Scenario 1: Unauthenticated User
1. User visits `/` or `/admin/*`
2. No user session found
3. Redirected to `/login`

### Scenario 2: Artist (Non-Admin) User
1. User logs in as artist
2. Visits `/` → sees artist dashboard
3. Tries `/admin/artworks` → middleware blocks → redirect to `/`
4. Tries to call admin action → `requireAdmin()` throws error

### Scenario 3: Admin User
1. User logs in with `role: "admin"`
2. Visits `/` → sees admin dashboard
3. Visits `/admin/artworks` → middleware allows → page loads
4. Calls admin actions → `requireAdmin()` passes → actions execute

## 📋 Admin Role Management

### Assigning Admin Role

Set in Stack Auth's `clientMetadata`:

```json
{
  "role": "admin"
}
```

**Option 1: Stack Auth Dashboard**
1. Go to Stack Auth dashboard
2. Navigate to Users
3. Select user
4. Edit clientMetadata
5. Add: `{ "role": "admin" }`

**Option 2: Via API**
```typescript
await stackServerApp.updateUser(userId, {
  clientMetadata: {
    role: "admin"
  }
});
```

**Option 3: During Creation**
```typescript
await stackServerApp.createUser({
  email: "admin@example.com",
  clientMetadata: {
    role: "admin"
  }
});
```

### Revoking Admin Access

Remove or change the role:
```typescript
await stackServerApp.updateUser(userId, {
  clientMetadata: {
    role: "artist" // or null, or remove entirely
  }
});
```

User immediately loses admin access on next request.

## 🧪 Security Testing

### Test Case 1: Unauthenticated Access
```
1. Open browser in incognito mode
2. Navigate to /admin/artworks
3. Expected: Redirect to /login?redirect=/admin/artworks
```

### Test Case 2: Artist Attempts Admin Access
```
1. Login as artist (role !== "admin")
2. Navigate to /admin/artworks
3. Expected: Middleware redirects to /
4. Try calling deleteArtworkAdmin() via console
5. Expected: Error "Unauthorized: Admin access required"
```

### Test Case 3: Admin Access
```
1. Login as admin (role === "admin")
2. Navigate to / 
3. Expected: Admin dashboard loads with stats
4. Navigate to /admin/artworks
5. Expected: Artworks management page loads
6. Execute admin actions
7. Expected: All actions succeed
```

### Test Case 4: Direct Server Action Call
```typescript
// As non-admin, try:
const result = await deleteArtworkAdmin(1);
// Expected: Error thrown, action blocked
```

## ⚡ Security Features

### ✅ Defense in Depth
Four layers of security ensure protection even if one fails:
1. **Middleware** - Blocks unauthorized requests to `/admin/*`
2. **Root Page** - Shows admin dashboard only to admins
3. **Layout** - Re-verifies before rendering admin pages
4. **Server Actions** - Guards every operation

### ✅ Server-Side Verification
All security checks happen on the server:
- Cannot be bypassed by client-side code
- No exposure of sensitive logic to browser
- Role checking in trusted environment

### ✅ Zero Trust Architecture
Every request is verified:
- No assumptions about authentication
- No caching of permissions
- Fresh verification on every action

### ✅ Role-Based Access Control
Simple, effective authorization:
- Single role check: `role === "admin"`
- Consistent across all layers
- Easy to audit and maintain

## 📊 Architecture Summary

```
User Request → Middleware Check → Page Role Check → Server Action Check → Execute
                    ↓                    ↓                    ↓
              [Admin? Yes/No]     [Admin? Yes/No]    [Admin? Yes/No]
                    ↓                    ↓                    ↓
              [Block/Allow]        [Block/Allow]      [Block/Allow]
```

**All checks must pass for admin operations to execute.**

## 🎯 Summary

The admin dashboard is **fully protected** with:

1. ✅ **Middleware protection** - Blocks unauthorized `/admin/*` requests
2. ✅ **Root dashboard** - Shows admin UI only to admins at `/`
3. ✅ **Layout protection** - Verifies before rendering admin pages
4. ✅ **Server action protection** - Guards every operation
5. ✅ **Stack Auth integration** - Reliable authentication
6. ✅ **Role-based access** - Simple, effective authorization

**Only users with `role: "admin"` in their Stack Auth `clientMetadata` can:**
- See the admin dashboard at `/`
- Access admin management pages at `/admin/*`
- Execute admin server actions

All security checks happen server-side and cannot be bypassed by client manipulation.

## 🔄 Admin Dashboard Flow

```
Admin User Flow:
/ → Admin Dashboard (stats, quick actions, artworks preview)
  ↓
/admin/artworks → Full artworks management
/admin/artists → Full artists management  
/admin/events → Full events management

Artist User Flow:
/ → Artist Dashboard (their artworks and profile)
  ↓
Cannot access /admin/* (blocked by middleware)
```
