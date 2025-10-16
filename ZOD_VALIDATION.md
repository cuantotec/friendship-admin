# Zod Validation Implementation

## Overview

All form validations are now handled server-side using **Zod schemas** for comprehensive type-safe validation with detailed error messages.

## Architecture

### Validation Flow
```
Client Form
    ↓
Submit to Server Action
    ↓
Zod Schema Validation
    ↓
✅ Valid → Process Request
❌ Invalid → Return Detailed Error
```

## Validation Schemas

### Location
All schemas are centralized in: `src/lib/validations/`

### Structure
```
src/lib/validations/
├── index.ts         # Central exports
├── artwork.ts       # Artwork validation schemas
└── artist.ts        # Artist validation schemas
```

## Artwork Validation

### Schema: `artworkSchema`
**Location:** `src/lib/validations/artwork.ts`

```typescript
const artworkSchema = z.object({
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  
  price: z.union([z.string(), z.number()])
    .transform((val) => parseFloat(val))
    .pipe(
      z.number()
        .nonnegative("Price must be 0 or greater")
        .max(100000, "Price cannot exceed $100,000")
    ),
  
  year: z.string()
    .regex(/^\d{4}$/, "Year must be a valid 4-digit year"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  
  status: z.enum(['Available', 'Sold', 'Reserved', 'Draft', 'Not for Sale']),
  
  // ... more fields
});
```

### Constants
```typescript
export const MAX_PRICE = 100000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
```

### Create vs Update
- **Create:** `createArtworkSchema` - Required fields only
- **Update:** `updateArtworkSchema` - All fields optional + ID required

## Artist Validation

### Schema: `artistProfileSchema`
**Location:** `src/lib/validations/artist.ts`

```typescript
const artistProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  bio: z.string()
    .min(10, "Bio must be at least 10 characters")
    .max(2000, "Bio must be less than 2000 characters")
    .optional()
    .or(z.literal('')),
  
  specialty: z.string()
    .min(2, "Specialty must be at least 2 characters")
    .max(100, "Specialty must be less than 100 characters")
    .optional(),
  
  profileImage: z.string()
    .url("Profile image must be a valid URL")
    .optional(),
});
```

### Schema: `artistSettingsSchema`
```typescript
const artistSettingsSchema = z.object({
  featured: z.boolean({
    required_error: "Featured status is required",
    invalid_type_error: "Featured must be a boolean",
  }),
  
  isVisible: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});
```

## Server Action Implementation

### Artwork Actions

#### Create Artwork
```typescript
export async function createArtwork(
  artworkData: Record<string, unknown>
): Promise<ApiResponse<Artwork>> {
  try {
    // Validate with Zod
    const validatedData = createArtworkSchema.parse(artworkData);
    
    // Process validated data
    // ...
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
        details: error.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        ).join(', ')
      };
    }
    
    return {
      success: false,
      error: "Failed to create artwork"
    };
  }
}
```

#### Update Artwork
```typescript
export async function updateArtwork(
  artworkId: number,
  updates: Partial<Artwork>
): Promise<ApiResponse<Artwork>> {
  try {
    // Validate with Zod
    const validatedData = updateArtworkSchema.parse({
      ...updates,
      id: artworkId
    });
    
    // Process validated data
    // ...
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        details: error.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        ).join(', ')
      };
    }
    
    return {
      success: false,
      error: "Failed to update artwork"
    };
  }
}
```

### Artist Actions

#### Update Profile
```typescript
export async function updateArtistProfile(
  data: Record<string, unknown>
): Promise<ApiResponse<Artist>> {
  try {
    // Validate with Zod
    const validatedData = artistProfileSchema.parse(data);
    
    // Process validated data
    // ...
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        details: error.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        ).join(', ')
      };
    }
    
    return {
      success: false,
      error: "Failed to update profile"
    };
  }
}
```

## Validation Rules

### Artwork Validation

| Field | Rules | Error Messages |
|-------|-------|----------------|
| **title** | min: 2, max: 200, trimmed | "Title must be at least 2 characters" |
| **price** | number, ≥ 0, ≤ 100000 | "Price cannot exceed $100,000" |
| **year** | 4-digit string, regex: `^\d{4}$` | "Year must be a valid 4-digit year" |
| **medium** | min: 2, max: 100 | "Medium must be at least 2 characters" |
| **dimensions** | min: 2, max: 100 | "Dimensions must be at least 2 characters" |
| **description** | min: 10, max: 2000 | "Description must be at least 10 characters" |
| **status** | enum | "Invalid status" |
| **slug** | lowercase, alphanumeric + hyphens | "Slug must contain only lowercase letters..." |
| **widthCm** | positive number, max: 1000 | "Width must be positive" |
| **heightCm** | positive number, max: 1000 | "Height must be positive" |
| **depthCm** | positive number, max: 1000 | "Depth must be positive" |

### Artist Validation

| Field | Rules | Error Messages |
|-------|-------|----------------|
| **name** | min: 2, max: 100 | "Name must be at least 2 characters" |
| **bio** | min: 10, max: 2000, optional | "Bio must be at least 10 characters" |
| **specialty** | min: 2, max: 100, optional | "Specialty must be at least 2 characters" |
| **profileImage** | URL, optional | "Profile image must be a valid URL" |
| **featured** | boolean, required | "Featured must be a boolean" |

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: string;        // First error message
  details?: string;     // All errors concatenated
}
```

### Example Error Response
```json
{
  "success": false,
  "error": "Title must be at least 2 characters",
  "details": "title: Title must be at least 2 characters, price: Price must be 0 or greater"
}
```

### ZodError Handling
```typescript
if (error instanceof ZodError) {
  const firstError = error.errors[0];
  return {
    success: false,
    error: firstError.message,  // User-friendly message
    details: error.errors       // All validation errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
  };
}
```

## Benefits

### ✅ Type Safety
- Runtime validation matches TypeScript types
- Automatic type inference from schemas
- Prevents invalid data from reaching database

### ✅ Comprehensive Validation
- Field-level rules (min/max length, regex)
- Type coercion (string → number for price)
- Custom error messages
- Optional fields handled properly

### ✅ Developer Experience
- Centralized validation logic
- Reusable schemas
- Clear error messages
- Easy to maintain and extend

### ✅ Security
- Server-side enforcement (client can't bypass)
- Input sanitization (trim, transform)
- Type validation
- Range checking

## Usage Examples

### Adding New Field Validation
```typescript
// In src/lib/validations/artwork.ts
export const artworkSchema = z.object({
  // ... existing fields
  
  // Add new field
  category: z.enum(['Painting', 'Sculpture', 'Photography'], {
    errorMap: () => ({ message: "Invalid category" })
  }).optional(),
});
```

### Custom Validation Logic
```typescript
const artworkSchema = z.object({
  // ... other fields
  
  price: z.union([z.string(), z.number()])
    .transform((val) => parseFloat(val))
    .pipe(
      z.number()
        .nonnegative()
        .max(MAX_PRICE)
        .refine((val) => val % 0.01 === 0, {
          message: "Price must have at most 2 decimal places"
        })
    ),
});
```

## Testing

### Valid Input
```typescript
// Should pass
createArtworkSchema.parse({
  title: "Sunset Painting",
  artistId: 1,
  year: "2024",
  medium: "Oil on Canvas",
  dimensions: "24x36 inches",
  description: "A beautiful sunset over the ocean",
  price: 5000,
  status: "Available",
});
```

### Invalid Input
```typescript
// Should fail with validation errors
createArtworkSchema.parse({
  title: "A",                    // Too short
  price: 200000,                 // Exceeds max
  year: "24",                    // Invalid format
  description: "Short",          // Too short
  status: "InvalidStatus",       // Not in enum
});
```

## Migration Guide

### Before (No Validation)
```typescript
export async function createArtwork(data: any) {
  // Direct database insert - no validation!
  await db.insert(artworks).values(data);
}
```

### After (Zod Validation)
```typescript
export async function createArtwork(data: Record<string, unknown>) {
  // Validate first
  const validated = createArtworkSchema.parse(data);
  
  // Type-safe, validated data
  await db.insert(artworks).values(validated);
}
```

## Files Modified

1. ✅ `src/lib/validations/artwork.ts` - Artwork schemas
2. ✅ `src/lib/validations/artist.ts` - Artist schemas
3. ✅ `src/lib/validations/index.ts` - Central exports
4. ✅ `src/lib/actions/artwork-actions.ts` - Uses artwork schemas
5. ✅ `src/lib/actions/artist-actions.ts` - Uses artist schemas

## Summary

✅ **Server-Side Only:** All validation happens on server  
✅ **Type-Safe:** Zod ensures runtime type safety  
✅ **Comprehensive:** Field-level validation with custom rules  
✅ **Error Handling:** Detailed, user-friendly error messages  
✅ **Maintainable:** Centralized, reusable schemas  
✅ **Secure:** Input sanitization and validation  
✅ **Price Limit:** Enforced $100,000 maximum

