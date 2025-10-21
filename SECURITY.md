# Security Documentation

## 🔒 Server Actions Security

### ✅ **SECURE Server Actions**

All server actions in this application are properly secured with authentication checks:

#### **Authentication Pattern**
```typescript
// Every server action starts with:
await requireAdmin(); // SECURITY CHECK

// This function:
// 1. Gets user from Stack Auth
// 2. Redirects to login if not authenticated
// 3. Checks serverMetadata.role for admin/super_admin
// 4. Throws error if not authorized
```

#### **Secure Actions Location**
- `src/lib/actions/admin-actions.ts` - ✅ All functions have `requireAdmin()`
- `src/lib/actions/secure-admin-actions.ts` - ✅ All functions have `requireAdmin()`
- `src/lib/actions/artwork-actions.ts` - ✅ All functions have proper auth checks

### ❌ **INSECURE Generic CRUD (FIXED)**

The generic CRUD functions in `src/lib/actions/generic-crud.ts` were initially insecure but have been fixed:

**BEFORE (INSECURE):**
```typescript
export async function createRecord<T>(table: any, data: Partial<T>) {
  // NO AUTHENTICATION CHECK! 🚨
  const result = await db.insert(table).values(data);
}
```

**AFTER (SECURE):**
```typescript
export async function createRecord<T>(table: any, data: Partial<T>) {
  await requireAdmin(); // ✅ SECURITY CHECK
  const result = await db.insert(table).values(data);
}
```

### 🛡️ **Security Best Practices Implemented**

#### **1. Server-Side Authentication**
- All server actions verify user authentication
- Uses Stack Auth's `serverMetadata` (secure, server-only)
- Never trusts `clientMetadata` (can be manipulated)

#### **2. Role-Based Access Control**
```typescript
const role = user.serverMetadata?.role;
const hasAdminAccess = role === "admin" || role === "super_admin";
```

#### **3. Input Validation**
- All inputs are validated on the server
- TypeScript provides compile-time type safety
- Database schema enforces constraints

#### **4. Error Handling**
- Sensitive errors are logged server-side only
- Generic error messages returned to client
- No internal details exposed

#### **5. Path Revalidation**
- All mutations trigger appropriate cache revalidation
- Ensures UI consistency after changes

### 🔍 **Client Component Security**

#### **What's Safe:**
- ✅ UI components (React components)
- ✅ Form handling and validation
- ✅ State management
- ✅ API calls to server actions

#### **What's NOT Safe:**
- ❌ Client-side authentication checks
- ❌ Sensitive data in client state
- ❌ Trusting client-side validation alone

#### **Security Pattern:**
```typescript
// Client component
const handleDelete = async () => {
  // Client-side confirmation (UX only)
  if (!confirm("Are you sure?")) return;
  
  // Server action handles security
  const result = await deleteArtistAdmin(artistId);
  // Server action will check auth and permissions
};
```

### 🚨 **Security Vulnerabilities Fixed**

1. **Generic CRUD Functions** - Added authentication checks
2. **Client-Side Auth** - Removed reliance on client-side auth
3. **Error Exposure** - Sanitized error messages
4. **Input Validation** - Added server-side validation

### 📋 **Security Checklist**

- [x] All server actions require authentication
- [x] Role-based access control implemented
- [x] Input validation on server-side
- [x] Error handling doesn't expose internals
- [x] Client components don't handle auth
- [x] Database queries use parameterized statements
- [x] Sensitive data never sent to client
- [x] Cache revalidation after mutations

### 🔧 **How to Add New Secure Actions**

```typescript
"use server";

import { requireAdmin } from "@/lib/actions/admin-actions";

export async function myNewAction(data: any) {
  await requireAdmin(); // ✅ ALWAYS start with this
  
  try {
    // Your secure logic here
    const result = await db.update(table).set(data);
    
    revalidatePath("/admin");
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Operation failed" };
  }
}
```

### 🎯 **Key Security Principles**

1. **Never trust the client** - Always validate on server
2. **Authenticate every action** - Every server action checks auth
3. **Principle of least privilege** - Only admin/super_admin access
4. **Defense in depth** - Multiple layers of security
5. **Fail securely** - Default to deny access

## ✅ **Current Security Status: SECURE**

All server actions are properly authenticated and authorized. The application follows security best practices for Next.js server actions with Stack Auth.
