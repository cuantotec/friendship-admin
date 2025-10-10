# Stack Auth Password Reset Setup

This document explains how password reset functionality is implemented using Stack Auth's built-in components.

## Overview

The application uses Stack Auth's native `ForgotPassword` component for both password reset request and password reset form functionality. This provides a complete, secure, and user-friendly password reset experience.

## Implementation

### 1. Stack Auth Component

The password reset functionality is implemented using Stack Auth's built-in `ForgotPassword` component:

```typescript
// src/components/stack-forgot-password.tsx
import { ForgotPassword } from '@stackframe/stack';

export const MyForgotPassword = () => {
  return <ForgotPassword fullPage={true} />;
}
```

### 2. Routes

Two routes are set up for password reset:

- **`/forgot-password`** - Password reset request page
- **`/reset-password`** - Password reset form page (handled by the same component)

Both routes use the same Stack Auth component, which automatically handles:
- Email validation
- Password reset email sending
- Token verification
- Password reset form
- Success/error messaging
- Redirects after successful reset

### 3. Features Included

The Stack Auth `ForgotPassword` component provides:

- **Email Input Form** - Clean, validated email input
- **Password Reset Email** - Sends secure reset links
- **Token Validation** - Verifies reset tokens
- **Password Reset Form** - Secure password input with validation
- **Error Handling** - User-friendly error messages
- **Success States** - Clear success feedback
- **Responsive Design** - Works on all devices
- **Security** - Built-in security best practices

### 4. Configuration

The component is configured with:
- `fullPage={true}` - Takes up the entire page for better UX
- Automatic redirect handling
- Built-in validation and error states

### 5. Integration with Sign In

The `SignIn` component automatically includes a "Forgot Password" link, so users can easily access the password reset functionality.

## Usage

### For Users

1. **Request Password Reset:**
   - Go to `/forgot-password` or click "Forgot Password" on the sign-in page
   - Enter email address
   - Check email for reset link

2. **Reset Password:**
   - Click the reset link in the email
   - Enter new password (minimum 8 characters)
   - Confirm new password
   - Sign in with new password

### For Developers

The implementation is completely handled by Stack Auth, so no additional configuration is needed. The component automatically:

- Integrates with your Stack Auth project
- Uses your configured email settings
- Handles all security aspects
- Provides consistent UI/UX

## Security Features

- **Secure Token Generation** - Cryptographically secure reset tokens
- **Token Expiration** - Tokens expire after a set time
- **One-time Use** - Tokens can only be used once
- **Email Verification** - Only the email owner can reset the password
- **Password Validation** - Enforces strong password requirements

## Customization

While the component works out of the box, you can customize it by:

1. **Styling** - Override CSS classes
2. **Text** - Customize messages and labels
3. **Behavior** - Configure redirects and validation rules

Refer to the Stack Auth documentation for advanced customization options.

## Benefits

- **Zero Configuration** - Works immediately
- **Security First** - Built-in security best practices
- **Consistent UX** - Matches Stack Auth design system
- **Maintenance Free** - Updates automatically with Stack Auth
- **Accessibility** - Built-in accessibility features
