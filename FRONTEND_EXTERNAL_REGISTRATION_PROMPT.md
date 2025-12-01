# Frontend Implementation: External Registration URL Support

## Overview
Events can now have external registration links. When an event has `registrationType === 'external'` and a `registrationUrl`, clicking the registration button should open the external URL in a new tab instead of showing the modal registration form.

## Event Data Structure

The event object includes the following fields related to registration:

```typescript
interface EventListItem {
  // ... other fields
  registrationEnabled: boolean;
  registrationType: string; // 'modal' | 'external' | 'disabled'
  registrationUrl: string | null; // The external registration URL (only when registrationType === 'external')
  // ... other fields
}
```

## Implementation Requirements

### 1. Check Registration Type
Before showing the registration modal or handling registration, check the event's `registrationType`:

```typescript
if (event.registrationType === 'external' && event.registrationUrl) {
  // Open external URL in new tab
} else if (event.registrationType === 'modal') {
  // Show existing modal registration form
} else {
  // Registration disabled or not available
}
```

### 2. Open External URL
When `registrationType === 'external'` and `registrationUrl` is present:

- Open the URL in a new tab/window
- Use `window.open()` with security best practices:
  ```typescript
  window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
  ```
- Ensure the URL is valid and not empty before opening
- Consider adding error handling if the URL fails to open

### 3. UI/UX Considerations

**Registration Button Behavior:**
- If `registrationType === 'external'` and `registrationUrl` exists:
  - Button should indicate it opens an external link (e.g., "Register Now" or "Register on External Site")
  - Consider adding an external link icon (↗) to indicate it opens in a new tab
  - Button should open the URL directly (no modal)

- If `registrationType === 'modal'`:
  - Keep existing behavior (open registration modal)

- If `registrationType === 'disabled'` or `registrationEnabled === false`:
  - Hide or disable the registration button

**Example Implementation:**

```typescript
const handleRegistrationClick = (event: EventListItem) => {
  // Check if external registration
  if (event.registrationEnabled && 
      event.registrationType === 'external' && 
      event.registrationUrl) {
    // Open external URL in new tab
    window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  
  // Check if modal registration
  if (event.registrationEnabled && 
      event.registrationType === 'modal') {
    // Open existing registration modal
    setShowRegistrationModal(true);
    return;
  }
  
  // Registration not available
  console.warn('Registration not available for this event');
};
```

### 4. Validation

Before opening the external URL:
- Verify `registrationUrl` is not null or empty
- Verify `registrationUrl` is a valid URL format
- Verify `registrationType === 'external'`
- Verify `registrationEnabled === true`

**Example Validation:**

```typescript
const isValidExternalRegistration = (event: EventListItem): boolean => {
  return (
    event.registrationEnabled &&
    event.registrationType === 'external' &&
    event.registrationUrl !== null &&
    event.registrationUrl.trim() !== '' &&
    /^https?:\/\/.+/.test(event.registrationUrl) // Basic URL validation
  );
};
```

### 5. Error Handling

Handle edge cases:
- If `registrationType === 'external'` but `registrationUrl` is null/empty:
  - Log an error
  - Don't show registration button or show disabled state
  - Consider showing a message: "Registration link not available"

- If URL fails to open:
  - Fallback: Show error message to user
  - Optionally: Provide a copy-to-clipboard option for the URL

### 6. Accessibility

- Ensure the button/link has proper ARIA labels
- Indicate when a link opens in a new tab (for screen readers)
- Example: `aria-label="Register for event (opens in new tab)"`

## Testing Checklist

- [ ] External registration button opens URL in new tab
- [ ] Modal registration still works for `registrationType === 'modal'`
- [ ] Registration button is hidden/disabled when `registrationEnabled === false`
- [ ] Registration button is hidden/disabled when `registrationType === 'disabled'`
- [ ] Error handling works when `registrationUrl` is null/empty
- [ ] URL validation prevents invalid URLs from opening
- [ ] Security attributes (`noopener,noreferrer`) are included
- [ ] Accessibility labels are properly set
- [ ] External link icon is displayed (if applicable)

## Files to Update

Locate and update the following components (exact file names may vary):

1. **Event Card/List Components** - Where registration buttons are displayed
2. **Event Detail Page** - Where the main registration button is shown
3. **Registration Modal Component** - Add conditional logic to check registration type before opening

## Example Component Update

```tsx
// Example: EventCard component
import { ExternalLink } from 'lucide-react';

function EventCard({ event }: { event: EventListItem }) {
  const handleRegister = () => {
    if (event.registrationType === 'external' && event.registrationUrl) {
      window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
    } else if (event.registrationType === 'modal') {
      // Open modal
      setShowModal(true);
    }
  };

  const isExternalRegistration = 
    event.registrationEnabled && 
    event.registrationType === 'external' && 
    event.registrationUrl;

  return (
    <div>
      {/* Event details */}
      
      {event.registrationEnabled && (
        <Button onClick={handleRegister}>
          {isExternalRegistration ? (
            <>
              Register Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          ) : (
            'Register'
          )}
        </Button>
      )}
    </div>
  );
}
```

## Notes

- The `registrationUrl` field is only populated when `registrationType === 'external'`
- Always validate the URL before opening to prevent security issues
- Use `noopener,noreferrer` for security when opening external links
- Consider user experience: make it clear when registration opens an external site

## Questions?

If you need clarification on:
- Event data structure
- Registration type values
- URL format requirements
- Error handling approach

Please refer to the `EventListItem` type definition in `src/types/index.ts` or contact the backend team.

