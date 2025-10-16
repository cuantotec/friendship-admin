# Quick Actions Feature - Edit Profile & Settings

## Overview
Added two new quick action modals to the Artist Dashboard for managing artist profiles and settings using shadcn UI components and server actions.

## ✨ New Features

### 1. **Edit Profile Modal**
Professional profile editing interface with:
- **Artist Name** (required)
- **Specialty/Medium** - Primary artistic style
- **Biography** - Artist story and philosophy
- **Exhibitions & Achievements** - Career highlights

### 2. **Settings Modal**
Simple settings management with:
- **Featured on Website** - Toggle for homepage visibility
- Visual feedback with star icon
- Informative description of benefits

## 📁 Files Created

### 1. **src/lib/actions/artist-actions.ts**
Server actions for artist data management:

**`updateArtistProfile`**
- Updates: name, bio, specialty, exhibitions
- Uses authenticated user's artist ID
- Server-side validation
- Error handling with descriptive messages

**`updateArtistSettings`**
- Updates: featured status
- Boolean toggle for website visibility
- Secure server-side execution

### 2. **src/components/artist-profile-modal.tsx**
Profile editing modal:
- Form validation (name required)
- Text inputs and textareas
- shadcn UI components (Dialog, Input, Textarea, Button, Label)
- Loading states with toast notifications
- Auto-refresh on save

### 3. **src/components/artist-settings-modal.tsx**
Settings modal:
- Featured toggle with Switch component
- Visual feedback (star icon changes color)
- Info box explaining benefits
- Toast notifications for success/error

### 4. **src/components/ui/switch.tsx**
shadcn Switch component (installed via CLI)

## 🔄 Files Modified

### **src/components/artist-dashboard.tsx**
**New State:**
```typescript
const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
```

**New Imports:**
```typescript
import ArtistProfileModal from "./artist-profile-modal";
import ArtistSettingsModal from "./artist-settings-modal";
```

**Updated Quick Actions:**
- "Edit Profile" button → Opens profile modal
- "Settings" button → Opens settings modal
- Both refresh data on save

## 🏗️ Architecture

### Server Actions (Server-Side)
```
src/lib/actions/artist-actions.ts
├── updateArtistProfile()
│   ├── Get authenticated artist ID
│   ├── Validate data
│   ├── Update database
│   └── Return result
└── updateArtistSettings()
    ├── Get authenticated artist ID
    ├── Update featured status
    └── Return result
```

### Client Components (UI Layer)
```
Artist Dashboard
├── Edit Profile Button → ArtistProfileModal
│   └── calls updateArtistProfile() server action
└── Settings Button → ArtistSettingsModal
    └── calls updateArtistSettings() server action
```

## 🎨 UI Components Used (All shadcn)

### Profile Modal:
- ✅ Dialog
- ✅ Input
- ✅ Label
- ✅ Textarea
- ✅ Button

### Settings Modal:
- ✅ Dialog
- ✅ Switch
- ✅ Label
- ✅ Button

## 🔐 Security Features

- ✅ Server-side authentication check
- ✅ Uses authenticated user's artist ID
- ✅ No client-side ID manipulation
- ✅ Server action validation
- ✅ SQL injection protection (parameterized queries)

## 💾 Database Updates

### Profile Fields:
```sql
UPDATE artists SET
  name = $1,
  bio = $2,
  specialty = $3,
  exhibitions = $4
WHERE id = $5
```

### Settings Fields:
```sql
UPDATE artists SET
  featured = $1
WHERE id = $2
```

## 📊 User Flow

### Edit Profile:
1. Click **"Edit Profile"** in Quick Actions
2. Modal opens with current data
3. Edit fields (name, bio, specialty, exhibitions)
4. Click **"Save Changes"**
5. Server action updates database
6. Toast notification confirms success
7. Page refreshes with new data
8. Modal closes

### Settings:
1. Click **"Settings"** in Quick Actions
2. Modal opens with current featured status
3. Toggle **"Featured on the Website"** switch
4. See visual feedback (star icon)
5. Click **"Save Settings"**
6. Server action updates database
7. Toast notification confirms
8. Page refreshes
9. Modal closes

## 🎯 Featured Artist Benefits

When enabled, artists get:
- ✨ Artworks appear first in search results
- ✨ Profile highlighted on homepage
- ✨ Increased visibility to visitors
- ✨ Priority placement in artist listings

## 🔍 Code Examples

### Opening Profile Modal:
```tsx
<Button onClick={() => setIsProfileModalOpen(true)}>
  <User className="h-6 w-6" />
  Edit Profile
</Button>
```

### Using Server Action:
```tsx
const result = await updateArtistProfile({
  name: editedProfile.name,
  bio: editedProfile.bio,
  specialty: editedProfile.specialty,
  exhibitions: editedProfile.exhibitions
});

if (result.success) {
  toast.success("Profile updated!");
  router.refresh();
}
```

### Featured Toggle:
```tsx
<Switch
  checked={isFeatured}
  onCheckedChange={setIsFeatured}
/>
```

## ✅ Validation Rules

### Profile:
- **Name**: Required, non-empty
- **Bio**: Optional, unlimited text
- **Specialty**: Optional, single line
- **Exhibitions**: Optional, multiline

### Settings:
- **Featured**: Boolean (true/false)

## 🎨 Design Highlights

### Profile Modal:
- Clean form layout
- Helper text for guidance
- Grouped related fields
- Required field indicators (*)
- Professional color scheme

### Settings Modal:
- Gradient background for featured option
- Star icon with fill animation
- Info box with bullet points
- Clear visual hierarchy
- Contextual help text

## 🚀 Usage

### For Artists:
1. Navigate to Dashboard
2. Find "Quick Actions" section
3. Click "Edit Profile" to update bio/info
4. Click "Settings" to toggle featured status

### For Administrators:
- Artists can only edit their own profile
- Featured status is artist-controlled
- All changes are logged server-side
- Database maintains data integrity

## 📝 Toast Notifications

### Success Messages:
- ✅ "Profile updated successfully!"
- ✅ "You are now featured on the website!"
- ✅ "You have been removed from featured artists."

### Error Messages:
- ❌ "Name is required"
- ❌ "No artist ID found"
- ❌ "Failed to update profile"
- ❌ Database error messages

## 🔄 Data Flow

```
User Action → Modal Opens
    ↓
User Edits Data
    ↓
Click Save → Client Validation
    ↓
Server Action Called
    ↓
Authentication Check
    ↓
Database Update
    ↓
Success/Error Response
    ↓
Toast Notification
    ↓
Page Refresh (on success)
    ↓
Modal Closes
```

## 🛠️ Tech Stack

- **UI Framework**: React (Next.js 15)
- **Components**: shadcn/ui
- **State**: React useState
- **Server**: Next.js Server Actions
- **Database**: PostgreSQL (Neon)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📚 Related Files

- `src/lib/stack-auth-helpers.ts` - Gets authenticated artist ID
- `src/lib/db.ts` - Database connection pool
- `src/app/page.tsx` - Server component that fetches artist data
- `drizzle/schema.ts` - Database schema

## 🧪 Testing Checklist

- [ ] Open Edit Profile modal
- [ ] Update name (required field)
- [ ] Update bio with long text
- [ ] Update specialty
- [ ] Update exhibitions
- [ ] Save and verify database update
- [ ] Test validation (empty name)
- [ ] Open Settings modal
- [ ] Toggle featured on/off
- [ ] Verify star icon changes
- [ ] Save settings
- [ ] Verify page refresh
- [ ] Check toast notifications
- [ ] Test error handling

## 🎉 Summary

**Quick Actions now provides:**
- ✅ Professional profile editing
- ✅ Easy settings management
- ✅ Server-side security
- ✅ Beautiful shadcn UI
- ✅ Server actions (no API routes)
- ✅ Real-time feedback
- ✅ Automatic data refresh
- ✅ Fully accessible components

Both modals integrate seamlessly with the existing dashboard and follow Next.js 15 best practices with server components and server actions!

