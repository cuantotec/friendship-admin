# Admin Dashboard

A comprehensive admin dashboard for managing the Friendship Gallery's artworks, artists, and events.

## Overview

The admin dashboard is built with a **server-first architecture** using Next.js 15 App Router. It maximizes server-side rendering and server actions, with minimal client-side JavaScript for optimal performance and security.

## Features

### 🏠 Overview Page (`/admin`)
- **Dashboard Statistics:**
  - Total artworks count
  - Total artworks worth (calculated value)
  - Total artists count
  - Active events count
- **Active Artworks Display:** Grid view of currently visible artworks
- **Quick Actions:** Fast navigation to management pages

### 🎨 Artworks Management (`/admin/artworks`)
- **Server-Side Filtering via URL Search Params:**
  - Search by title or artist name
  - Filter by status (Available, Sold, Reserved)
  - Filter by location (Gallery, Storage, On Loan, Private)
- **Statistics Cards (Server-Rendered):**
  - Total artworks
  - Visible artworks
  - Hidden artworks
  - Total worth
- **Actions (Server Actions):**
  - Toggle visibility (show/hide artwork)
  - Change artwork location (dropdown with server action)
  - Delete artwork
  - View artwork details with image

### 👥 Artists Management (`/admin/artists`)
- **Server-Side Search via URL Search Params:**
  - Search by name, email, or specialty
- **Statistics Cards (Server-Rendered):**
  - Total artists
  - Visible artists
  - Featured artists
  - Total artworks by all artists
- **Actions (Server Actions):**
  - Toggle visibility (show/hide artist)
  - Delete artist (only if no artworks)
  - View artist profile with artwork count

### 📅 Events Management (`/admin/events`)
- **Server-Side Search via URL Search Params:**
  - Search by title, description, or location
- **Statistics Cards (Server-Rendered):**
  - Total events
  - Active events
  - Canceled events
  - Recurring events
- **Actions (Server Actions):**
  - Cancel/Uncancel event
  - Delete event
  - View event details with dates and location
- **Event Status (Server-Computed):**
  - Upcoming (before start date)
  - Ongoing (between start and end date)
  - Past (after end date)
  - Canceled (manually canceled)

## Architecture

### 🚀 Server-First Design

#### **Server Components (Maximum Server-Side Rendering)**
All page components are server components that:
- Fetch data at request time
- Process and filter data on the server
- Calculate statistics on the server
- Render tables and UI on the server

Pages:
- `/admin/page.tsx` - Overview dashboard (100% server-rendered)
- `/admin/artworks/page.tsx` - Artworks page with server-side filtering
- `/admin/artists/page.tsx` - Artists page with server-side search
- `/admin/events/page.tsx` - Events page with server-side search

#### **Client Components (Minimal, Only for Interactivity)**
Small, focused client components handle only UI interactions:

**Filter Components** (URL-based, trigger server re-render):
- `ArtworksFilters` - Updates URL search params, triggers server-side filtering
- `ArtistsFilters` - Updates URL search params, triggers server-side search
- `EventsFilters` - Updates URL search params, triggers server-side search

**Table Components** (Server-rendered):
- `ArtworksTable` - Fully server-rendered table
- `ArtistsTable` - Fully server-rendered table
- `EventsTable` - Fully server-rendered table with computed status

**Action Components** (Server actions only):
- `ArtworkActions` - Buttons that call server actions
- `ArtistActions` - Buttons that call server actions
- `EventActions` - Buttons that call server actions

### Server Actions

All data mutations are handled by server actions in `/lib/actions/admin-actions.ts`:

#### Statistics
- `getAdminStats()` - Get dashboard statistics

#### Data Fetching
- `getAllArtworks()` - Get all artworks with artist info
- `getAllArtists()` - Get all artists with artwork counts
- `getAllEvents()` - Get all events with details

#### Artworks
- `updateArtworkLocation(artworkId, location)` - Update artwork location
- `toggleArtworkVisibility(artworkId)` - Show/hide artwork
- `deleteArtworkAdmin(artworkId)` - Delete artwork

#### Artists
- `toggleArtistVisibility(artistId)` - Show/hide artist
- `deleteArtistAdmin(artistId)` - Delete artist (with validation)

#### Events
- `toggleEventCancellation(eventId)` - Cancel/uncancel event
- `deleteEventAdmin(eventId)` - Delete event

## Key Benefits of Server-First Architecture

### ✅ Performance
- **Reduced JavaScript Bundle:** Minimal client-side code
- **Faster Initial Load:** Server-rendered HTML
- **Server-Side Filtering:** No client-side data processing
- **Optimized Network:** Only necessary data sent to client

### ✅ SEO & Accessibility
- **Full HTML on First Load:** All content rendered on server
- **Progressive Enhancement:** Works without JavaScript
- **Better for Screen Readers:** Semantic HTML from server

### ✅ Security
- **Server-Side Auth:** Authentication checked on server for every request
- **Protected Actions:** All mutations require admin verification
- **No Exposed Data:** Filtering happens on server, not client
- **XSS Prevention:** No client-side data manipulation

### ✅ User Experience
- **URL-Based Filtering:** Shareable filtered views
- **Back Button Works:** Browser history preserved with URL params
- **Refresh Keeps State:** URL params maintain filter state
- **useTransition:** Pending states for smooth UX

## Technical Implementation

### URL Search Params Pattern
Instead of client-side state, filters use URL search params:

```typescript
// Server Component (artworks/page.tsx)
export default async function AdminArtworksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const allArtworks = await getAllArtworks();
  
  // Server-side filtering
  const filteredArtworks = allArtworks.filter((artwork) => {
    return artwork.title.toLowerCase().includes(searchParams.search || '');
  });
  
  return <ArtworksTable artworks={filteredArtworks} />;
}
```

```typescript
// Client Component (artworks-filters.tsx)
const updateFilter = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams);
  params.set(key, value);
  startTransition(() => {
    router.push(`?${params.toString()}`);
  });
};
```

### Server Actions Pattern
All mutations use server actions with `useTransition`:

```typescript
// Client Component (artwork-actions.tsx)
const [isPending, startTransition] = useTransition();

const handleToggleVisibility = () => {
  startTransition(async () => {
    const result = await toggleArtworkVisibility(artworkId);
    if (result.success) {
      toast.success("Visibility updated");
      router.refresh(); // Triggers server re-render
    }
  });
};
```

## Security

### Authentication
- Admin access is protected by Stack Auth
- Only users with `role: "admin"` in `clientMetadata` can access the dashboard
- Unauthorized users are redirected to the login page

### Authorization
- All server actions verify admin access before executing
- `requireAdmin()` helper function checks authentication and authorization
- Failed authorization throws an error and prevents action execution

### Data Validation
- All mutations include error handling
- Database operations are wrapped in try-catch blocks
- User-friendly error messages are returned to the client

## Layout

### Sidebar Navigation
The admin layout includes a persistent sidebar with:
- Logo and gallery name
- Navigation links:
  - Overview (Home icon)
  - Artworks (Palette icon)
  - Artists (Users icon)
  - Events (Calendar icon)
- User information display
- Logout button

### Responsive Design
- Mobile-friendly responsive layout
- Tables are horizontally scrollable on small screens
- Grid layouts adjust for different screen sizes

## Usage

### Accessing the Admin Dashboard
1. Navigate to `/admin`
2. If not logged in, you'll be redirected to `/login`
3. Login with an admin account (user with `role: "admin"`)
4. Access the dashboard and management pages

### Managing Artworks
1. Go to `/admin/artworks`
2. Use search and filters (URL updates, server re-renders)
3. Click visibility icon to show/hide artworks (server action)
4. Use location dropdown to change artwork location (server action)
5. Click delete icon to remove artworks (server action)

### Managing Artists
1. Go to `/admin/artists`
2. Search for artists (URL updates, server re-renders)
3. Toggle visibility to show/hide artists (server action)
4. Delete artists (only if they have no artworks) (server action)

### Managing Events
1. Go to `/admin/events`
2. Search for events (URL updates, server re-renders)
3. Cancel/uncancel events as needed (server action)
4. Delete events that are no longer needed (server action)

## File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin layout with sidebar (Server Component)
│       ├── page.tsx                # Overview/dashboard (Server Component)
│       ├── artworks/
│       │   └── page.tsx            # Artworks page with server-side filtering
│       ├── artists/
│       │   └── page.tsx            # Artists page with server-side search
│       └── events/
│           └── page.tsx            # Events page with server-side search
├── components/
│   └── admin/
│       # Filter Components (Client - URL param updates)
│       ├── artworks-filters.tsx    # Artworks filter controls
│       ├── artists-filters.tsx     # Artists search control
│       ├── events-filters.tsx      # Events search control
│       # Table Components (Server-rendered)
│       ├── artworks-table.tsx      # Artworks table (Server Component)
│       ├── artists-table.tsx       # Artists table (Server Component)
│       ├── events-table.tsx        # Events table (Server Component)
│       # Action Components (Client - Server action calls)
│       ├── artwork-actions.tsx     # Artwork action buttons
│       ├── artist-actions.tsx      # Artist action buttons
│       └── event-actions.tsx       # Event action buttons
└── lib/
    └── actions/
        └── admin-actions.ts        # All server actions
```

## Technologies Used

- **Next.js 15** - App Router with Server Components & Server Actions
- **React 18** - UI library with useTransition for pending states
- **Drizzle ORM** - Database queries
- **Stack Auth** - Authentication and authorization
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

## Performance Characteristics

- ✅ **Zero Client-Side Filtering:** All filtering happens on server
- ✅ **Minimal JavaScript:** Only essential interactivity is client-side
- ✅ **Fast Time to Interactive:** Server-rendered HTML loads first
- ✅ **SEO Friendly:** Full content in initial HTML
- ✅ **Shareable URLs:** Filters encoded in URL params
- ✅ **Progressive Enhancement:** Core functionality works without JS

## Future Enhancements

Potential features for future development:
- Create/Edit modals for artworks, artists, and events
- Bulk actions (delete multiple items, change multiple locations)
- Advanced filtering (date ranges, price ranges)
- Export data (CSV, Excel)
- Activity logs and audit trail
- Image upload and management
- Rich text editor for descriptions
- Drag-and-drop reordering
- Analytics and reporting
- Pagination for large datasets
- Real-time updates with Server-Sent Events
