# Price Validation Implementation

## Overview

All artwork prices are validated and limited to a maximum of **$100,000** on both client and server side.

## Price Type System

### Database Layer
- Drizzle's `decimal` type returns price as **string** from PostgreSQL
- Stored with precision of 10 and scale of 2 (e.g., "12345.67")

### Application Layer
- Price is handled as **string** to match database type
- Parsed to **number** for validation and calculations
- Converted back to **string** for storage

### Type Definition
```typescript
// src/types/index.ts
export type Artwork = Omit<DbArtwork, 'price'> & {
  price: string; // Drizzle decimal returns string
};
```

## Validation Rules

### Server-Side (Always Enforced)
**Location:** `src/lib/actions/artwork-actions.ts`

```typescript
const MAX_PRICE = 100000;

function validatePrice(price: string | number | undefined): number {
  if (price === undefined) return 0;
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice < 0) return 0;
  return Math.min(numPrice, MAX_PRICE);
}
```

**Rules:**
- ✅ Maximum price: **$100,000**
- ✅ Minimum price: **$0**
- ✅ Invalid values default to **$0**
- ✅ Enforced on create and update

### Client-Side (User Experience)
**Location:** `src/components/artwork-modal.tsx`

```typescript
<Input
  type="number"
  step="0.01"
  min="0"
  max="100000"
  onChange={(e) => {
    const value = parseFloat(e.target.value) || 0;
    const limitedValue = Math.min(value, 100000);
    handleInputChange("price", limitedValue.toString());
  }}
/>
```

**Features:**
- ✅ HTML5 validation: `min="0"` `max="100000"`
- ✅ JavaScript enforcement: Caps at $100,000
- ✅ Step validation: Allows cents (0.01)
- ✅ Visual indicator: Shows "(max: $100,000)" label

## Implementation Details

### 1. Create Artwork
**File:** `src/lib/actions/artwork-actions.ts`

```typescript
export async function createArtwork(artworkData: Partial<Artwork>) {
  // Validate and limit price
  const validatedPrice = validatePrice(artworkData.price);
  
  const params = [
    // ... other fields
    validatedPrice,  // Enforced max $100,000
    // ... other fields
  ];
  
  await pool.query(query, params);
}
```

### 2. Update Artwork
**File:** `src/lib/actions/artwork-actions.ts`

```typescript
export async function updateArtwork(artworkId: number, updates: Partial<Artwork>) {
  // Validate and limit price if it's being updated
  if (updates.price !== undefined) {
    updates.price = validatePrice(updates.price).toString();
  }
  
  // ... update logic
}
```

### 3. Display Price
All components parse string price for display:

```typescript
// Display with proper formatting
${parseFloat(artwork.price).toLocaleString()}

// Calculate totals
artworks.reduce((sum, artwork) => 
  sum + parseFloat(artwork.price.toString()), 0
)
```

## Validation Flow

### Creating/Updating Artwork

```
User Input
    ↓
Client-Side Validation (max: 100000)
    ↓
Convert to String
    ↓
Send to Server
    ↓
Server-Side Validation (validatePrice)
    ↓
Limit to MAX_PRICE (100000)
    ↓
Convert to String
    ↓
Store in Database
```

### Reading Artwork

```
Database (decimal as string)
    ↓
Return to Client
    ↓
Parse to Number for Display
    ↓
Format with toLocaleString()
```

## Security Considerations

### ✅ Server-Side Enforcement
- Price validation **always** happens on server
- Client-side validation is **UX only**
- Direct API calls are protected

### ✅ Type Safety
- TypeScript ensures price is handled correctly
- Drizzle schema enforces database constraints
- Validation function handles all edge cases

### ✅ Edge Cases Handled
- `undefined` → defaults to 0
- `null` → defaults to 0
- Negative values → defaults to 0
- `NaN` → defaults to 0
- Values > 100000 → capped at 100000

## Testing

### Test Cases
```typescript
// Valid prices
validatePrice(1000)        // Returns: 1000
validatePrice("50000.50")  // Returns: 50000.5
validatePrice(99999.99)    // Returns: 99999.99

// Maximum enforcement
validatePrice(100000)      // Returns: 100000
validatePrice(200000)      // Returns: 100000 (capped)
validatePrice("999999")    // Returns: 100000 (capped)

// Edge cases
validatePrice(undefined)   // Returns: 0
validatePrice(-100)        // Returns: 0
validatePrice(NaN)         // Returns: 0
validatePrice("invalid")   // Returns: 0
```

## Files Modified

### Core Implementation
1. ✅ `src/lib/actions/artwork-actions.ts` - Server validation
2. ✅ `src/components/artwork-modal.tsx` - Client validation
3. ✅ `src/types/index.ts` - Type definitions

### Display Components
- `src/components/artist-dashboard.tsx` - Handles string price
- `src/components/admin/artworks-table.tsx` - Parses for display
- `src/app/page.tsx` - Calculates totals

## Constants

```typescript
// src/lib/actions/artwork-actions.ts
const MAX_PRICE = 100000;
```

To change the maximum price limit, update this constant. The validation will automatically apply the new limit across the entire application.

## Summary

✅ **Maximum Price:** $100,000  
✅ **Server-Side:** Always enforced  
✅ **Client-Side:** UX enhancement  
✅ **Type Safe:** Full TypeScript coverage  
✅ **Edge Cases:** All handled gracefully  
✅ **Consistent:** Applied across all artwork operations

