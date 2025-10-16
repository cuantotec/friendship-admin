# Revalidation Implementation

This document explains the revalidation functionality implemented to trigger ISR cache invalidation on the main site (friendshipcentergallery.org) from the admin panel.

## Overview

The revalidation system allows the admin panel to trigger cache invalidation on the main site whenever data is modified. This ensures that changes made in the admin panel are immediately reflected on the public-facing website.

## Implementation Details

### 1. Revalidation Helper (`src/lib/revalidation.ts`)

The core revalidation functionality is implemented in `src/lib/revalidation.ts`:

- **`triggerRevalidation()`**: Main function that calls the revalidation API on the main site
- **`revalidationPatterns`**: Pre-configured patterns for common revalidation scenarios

### 2. Environment Configuration

Add these environment variables to your `.env.local`:

```env
# Main Site Configuration (for revalidation)
MAIN_SITE_URL="https://friendshipcentergallery.org"
REVALIDATE_SECRET="your-revalidate-secret-here"
```

### 3. Integration Points

Revalidation is automatically triggered in the following admin actions:

#### Admin Actions (`src/lib/actions/admin-actions.ts`)
- `updateArtworkLocation()` - Triggers artwork revalidation
- `toggleArtworkVisibility()` - Triggers artwork revalidation
- `toggleArtistVisibility()` - Triggers artist revalidation
- `deleteArtworkAdmin()` - Triggers artwork revalidation
- `deleteArtistAdmin()` - Triggers artist revalidation

#### Artwork Actions (`src/lib/actions/artwork-actions.ts`)
- `updateArtwork()` - Triggers artwork revalidation
- `deleteArtwork()` - Triggers artwork revalidation
- `createArtwork()` - Triggers artwork revalidation

## Revalidation Patterns

The system includes several pre-configured patterns:

- **`artwork()`**: Revalidates all artwork-related pages (`/`, `/artwork`, `/artists`)
- **`artists()`**: Revalidates artist pages (`/artists`, `/`)
- **`artworkById(id)`**: Revalidates specific artwork page
- **`artistById(id)`**: Revalidates specific artist page
- **`all()`**: Revalidates everything

## Error Handling

The revalidation system includes robust error handling:

- Revalidation failures are logged but don't interrupt admin operations
- The admin panel continues to function even if the main site is unreachable
- All revalidation calls are wrapped in try-catch blocks

## Testing

A test script is available at `scripts/test-revalidation.ts`:

```bash
npx tsx scripts/test-revalidation.ts
```

This script tests all revalidation patterns and provides detailed output.

## Main Site Requirements

The main site (friendshipcentergallery.org) must have a revalidation API endpoint at `/api/revalidate` that accepts:

```json
{
  "secret": "your-revalidate-secret-here",
  "paths": ["/", "/artwork", "/artists"],
  "tags": ["artwork", "artists"]
}
```

The endpoint should return:

```json
{
  "message": "Revalidation successful",
  "revalidated": true,
  "now": 1234567890,
  "paths": ["/", "/artwork", "/artists"],
  "tags": ["artwork", "artists"]
}
```

## Security

- The revalidation secret is required to prevent unauthorized cache invalidation
- The secret should be a strong, randomly generated string
- The secret is only used for server-to-server communication

## Usage Examples

### Manual Revalidation

```typescript
import { triggerRevalidation, revalidationPatterns } from '@/lib/revalidation';

// Revalidate specific paths and tags
await triggerRevalidation({
  paths: ['/', '/artwork'],
  tags: ['artwork']
});

// Use pre-configured patterns
await revalidationPatterns.artwork();
await revalidationPatterns.artists();
await revalidationPatterns.all();
```

### Custom Revalidation

```typescript
// Revalidate specific artwork
await revalidationPatterns.artworkById('123');

// Revalidate specific artist
await revalidationPatterns.artistById('456');
```

## Monitoring

Check the console logs for revalidation status:

- `"Main site revalidation successful"` - Revalidation completed successfully
- `"Main site revalidation failed: [error]"` - Revalidation failed (logged but doesn't break admin operations)

## Troubleshooting

1. **Revalidation not working**: Check that `MAIN_SITE_URL` and `REVALIDATE_SECRET` are correctly set
2. **Main site not responding**: Verify the main site's revalidation endpoint is accessible
3. **Secret mismatch**: Ensure the `REVALIDATE_SECRET` matches between admin panel and main site
4. **Network issues**: Check firewall and network connectivity between admin panel and main site
