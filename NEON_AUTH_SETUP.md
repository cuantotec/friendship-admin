# Neon Auth Setup Guide

This project now uses **Neon Auth** (powered by Stack Auth) for authentication instead of custom OTP implementation.

## 🚀 Benefits of Neon Auth

- ✅ **Managed Authentication**: No need to build custom auth
- ✅ **Database Sync**: User data automatically synced to Neon database
- ✅ **Multiple Providers**: Email, OAuth (Google, GitHub, etc.)
- ✅ **Security**: Enterprise-grade security features
- ✅ **Scalability**: Handles high traffic automatically
- ✅ **Rate Limiting**: Built-in protection against abuse

## 📋 Setup Steps

### 1. Get Neon Auth Credentials

1. Go to your [Neon Console](https://console.neon.tech)
2. Navigate to **Auth** section
3. Click **"Set up Auth"**
4. Copy the provided environment variables

### 2. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Neon Auth (from Neon Console)
STACK_PROJECT_ID=your_project_id
STACK_API_KEY=your_api_key
STACK_PUBLIC_KEY=your_public_key

# Existing variables
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3002
DATABASE_URL=your-neon-database-url
```

### 3. Configure Auth Providers

In the Neon Console:
1. Go to **Auth** → **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - **From Email**: `otp@friendshipcentergallery.org`
   - **SMTP Settings**: Configure your email provider settings

### 4. User Management

#### Option A: Allow Sign-ups (Not Recommended)
- Users can register themselves
- Less secure for admin-only access

#### Option B: Pre-approve Users (Recommended)
- Disable public sign-ups
- Manually add users in Neon Console
- More secure for gallery management

### 5. Database Schema

Neon Auth automatically creates these tables:
- `stack_users` - User accounts
- `stack_sessions` - Active sessions
- `stack_verification_tokens` - Email verification

Your existing `admins` table can be linked via email.

## 🔧 Migration from Custom OTP

### What Changed:
- ❌ Custom OTP system removed
- ❌ Manual email sending removed
- ❌ Custom session management removed
- ✅ Neon Auth handles everything

### What Stays:
- ✅ Database schema (except auth fields)
- ✅ UI components (updated for Neon Auth)
- ✅ Dashboard functionality
- ✅ Role-based access control

## 🎯 Features

### Authentication Flow:
1. **User enters email** → Neon Auth sends magic link
2. **User clicks link** → Automatically signed in
3. **Session managed** → By Neon Auth
4. **User data synced** → To your Neon database

### User Management:
- **Add users**: Via Neon Console or API
- **Role assignment**: Via database or custom fields
- **Account management**: Self-service or admin-controlled

## 🚨 Important Notes

1. **Environment Variables**: Make sure all Neon Auth variables are set
2. **Database Permissions**: Ensure Neon Auth can write to your database
3. **Email Configuration**: Set up proper SMTP settings
4. **User Roles**: Implement role checking in your app logic

## 🔍 Testing

1. Start the development server: `npm run dev`
2. Go to `http://localhost:3002/login`
3. Enter an email address
4. Check your email for the magic link
5. Click the link to sign in

## 📚 Documentation

- [Neon Auth Docs](https://neon.tech/docs/guides/neon-auth)
- [Stack Auth Docs](https://docs.stack-auth.com)
- [Next.js Integration](https://docs.stack-auth.com/getting-started/nextjs)

## 🆘 Troubleshooting

### Common Issues:
1. **"User not found"**: Check if user exists in Neon Console
2. **Email not sent**: Verify SMTP settings
3. **Session issues**: Check environment variables
4. **Database errors**: Ensure proper permissions

### Debug Steps:
1. Check browser console for errors
2. Check server logs for authentication errors
3. Verify environment variables are loaded
4. Test with a known user account
