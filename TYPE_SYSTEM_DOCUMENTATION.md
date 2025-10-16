# Type System Documentation

## Overview

This document describes the centralized TypeScript type system implemented across the Friendship Gallery Admin application. All types are properly defined and shared between frontend and backend to ensure type safety and consistency.

## Core Principles

1. **No `any` types** - All code uses proper TypeScript types
2. **No `never` types** - All types are explicitly defined
3. **Shared types** - Frontend and backend use the same type definitions
4. **Type safety** - All API responses, function parameters, and return values are properly typed

## Type Location

All shared types are defined in: `src/types/index.ts`

## Type Categories

### 1. Database Types

These types are directly inferred from the Drizzle schema:

```typescript
export type Artist = DbArtist;
export type Artwork = DbArtwork;
export type Event = DbEvent;
```

**Source:** `src/lib/schema.ts`

### 2. Extended Types

Types that extend database types with additional computed fields:

#### Artist Types
- `ArtistWithMeta` - Artist with artwork count
- `Artist` - Base artist type from database

#### Artwork Types
- `Artwork` - Base artwork type from database
- `ArtworkWithArtist` - Artwork with artist information
- `ArtworkWithDisplayOrder` - Artwork with display order fields (for drag & drop)

#### Event Types
- `Event` - Base event type from database
- `EventWithMeta` - Event with attendee count

### 3. API Response Types

All server actions return consistent API responses:

```typescript
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### 4. Form Data Types

Types for form submissions:

- `ArtistProfileFormData` - Artist profile update form
- `ArtistSettingsFormData` - Artist settings update form
- `ArtworkFormData` - Artwork creation/update form
- `ArtworkUpdateOrderData` - Artwork reordering data

### 5. Component Props Types

Types for React component props:

- `ArtistDashboardProps` - Artist dashboard component
- `ArtworkModalProps` - Artwork modal component
- `ArtistProfileModalProps` - Artist profile modal
- `ArtistSettingsModalProps` - Artist settings modal

### 6. Admin Dashboard Types

Types for admin dashboard data:

- `AdminStats` - Dashboard statistics
- `ArtworkListItem` - Artwork list item with artist name
- `ArtistListItem` - Artist list item with artwork count
- `EventListItem` - Event list item

## File-by-File Type Usage

### Server Actions

#### `src/lib/actions/admin-actions.ts`
```typescript
import type { 
  AdminStats, 
  ArtworkListItem, 
  ArtistListItem, 
  EventListItem,
  ApiResponse
} from "@/types";

export async function getAdminStats(): Promise<AdminStats> { ... }
export async function getAllArtworks(): Promise<ArtworkListItem[]> { ... }
export async function getAllArtists(): Promise<ArtistListItem[]> { ... }
export async function getAllEvents(): Promise<EventListItem[]> { ... }
```

#### `src/lib/actions/artist-actions.ts`
```typescript
import type { 
  ArtistProfileFormData, 
  ArtistSettingsFormData,
  ApiResponse, 
  Artist 
} from "@/types";

export async function updateArtistProfile(
  data: ArtistProfileFormData
): Promise<ApiResponse<Artist>> { ... }
```

#### `src/lib/actions/artwork-actions.ts`
```typescript
import type { Artwork, ApiResponse } from "@/types";

export async function updateArtwork(
  artworkId: number, 
  updates: Partial<Artwork>
): Promise<ApiResponse<Artwork>> { ... }
```

#### `src/lib/actions/get-artist.ts`
```typescript
import type { Artist, ArtworkWithDisplayOrder, ApiResponse } from "@/types";

export async function getArtistById(
  artistId?: number
): Promise<ApiResponse<{ 
  artist: Artist; 
  artworks: ArtworkWithDisplayOrder[] 
}>> { ... }
```

### Client Components

#### `src/components/artist-dashboard.tsx`
```typescript
import type { 
  Artist, 
  Artwork, 
  ArtworkWithDisplayOrder, 
  ArtistDashboardProps 
} from "@/types";

export default function ArtistDashboard({ 
  artist, 
  artworks 
}: ArtistDashboardProps) { ... }
```

#### `src/app/page.tsx`
```typescript
import type { AdminStats, ArtworkListItem } from "@/types";

let adminStats: AdminStats | null = null;
let adminArtworks: ArtworkListItem[] | null = null;
```

## Type Safety Benefits

### 1. Compile-Time Error Detection
TypeScript catches type mismatches during development, preventing runtime errors.

### 2. IntelliSense Support
IDEs provide autocomplete and type hints based on the defined types.

### 3. Refactoring Safety
Changing a type definition automatically flags all affected code.

### 4. Documentation
Types serve as inline documentation for function signatures and data structures.

### 5. Consistency
Shared types ensure frontend and backend use the same data structures.

## Best Practices

### DO:
✅ Import types from `@/types`
✅ Use `ApiResponse<T>` for all server actions
✅ Define return types for all functions
✅ Use `Partial<T>` for optional update fields
✅ Extend base types for specific use cases

### DON'T:
❌ Use `any` type
❌ Use `never` type
❌ Duplicate type definitions
❌ Use inline types for complex structures
❌ Skip return type annotations

## Example Usage

### Server Action with Proper Types
```typescript
import type { ApiResponse, Artwork } from "@/types";

export async function updateArtwork(
  artworkId: number,
  updates: Partial<Artwork>
): Promise<ApiResponse<Artwork>> {
  try {
    // ... update logic
    return {
      success: true,
      data: updatedArtwork
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed"
    };
  }
}
```

### Component with Proper Types
```typescript
import type { ArtistDashboardProps } from "@/types";

export default function ArtistDashboard({ 
  artist, 
  artworks 
}: ArtistDashboardProps) {
  // TypeScript knows exact shape of artist and artworks
  return (
    <div>
      <h1>{artist?.name}</h1>
      {artworks.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
```

## Migration Notes

### Changes Made
1. Created centralized type definitions in `src/types/index.ts`
2. Removed all `any` type usage
3. Added proper return types to all server actions
4. Updated all components to use shared types
5. Added `ApiResponse<T>` pattern for consistent error handling

### Files Updated
- `src/types/index.ts` (new file)
- `src/app/page.tsx`
- `src/components/artist-dashboard.tsx`
- `src/lib/actions/admin-actions.ts`
- `src/lib/actions/artist-actions.ts`
- `src/lib/actions/artwork-actions.ts`
- `src/lib/actions/update-artwork-order.ts`
- `src/lib/actions/get-artist.ts`

## Utility Types

The type system includes helpful utility types:

```typescript
// Make specific fields required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Make specific fields optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

// Extract non-null type
export type NonNullable<T> = T extends null | undefined ? never : T;
```

## Future Enhancements

Consider adding:
- Zod runtime validation schemas
- Type guards for runtime type checking
- Discriminated unions for complex state management
- Branded types for IDs and special values

