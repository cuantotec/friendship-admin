# Artist Portal AI Agent Instructions

## Overview
This document provides detailed instructions for AI agents working with the Friendship Gallery Artist Portal. The portal allows artists to manage their profiles, artworks, and settings through a comprehensive dashboard system.

## System Architecture

### Core Components
- **Artist Dashboard** (`src/components/artist-dashboard.tsx`) - Main interface
- **Artwork Modal** (`src/components/artwork-modal.tsx`) - Artwork creation/editing
- **Artist Profile Modal** (`src/components/artist-profile-modal.tsx`) - Profile management
- **Artist Settings Modal** (`src/components/artist-settings-modal.tsx`) - Settings management

### Data Flow
- All data operations use **Drizzle ORM** (no raw SQL)
- Server Actions handle backend operations
- Real-time updates via React state management
- Image uploads via Cloudinary integration

## Artist Dashboard (`artist-dashboard.tsx`)

### Purpose
Central hub for artists to manage their gallery presence, artworks, and profile information.

### Key Features
1. **Statistics Display**
   - Total artworks count
   - Available artworks count
   - Sold artworks count
   - Total portfolio value

2. **View Modes**
   - Grid view (default)
   - List view
   - Toggle via view mode buttons

3. **Drag & Drop Reordering**
   - Artists can reorder their artworks
   - Changes saved automatically
   - Visual feedback during drag operations

4. **Quick Actions**
   - Add New Artwork
   - Edit Profile
   - Settings

### State Management
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);
const [isDragMode, setIsDragMode] = useState(false);
const [artworksOrder, setArtworksOrder] = useState<ArtworkWithDisplayOrder[]>([]);
const [hasChanges, setHasChanges] = useState(false);
```

### Props Interface
```typescript
interface ArtistDashboardProps {
  artist: Artist | null;
  artworks: ArtworkWithDisplayOrder[];
}
```

## Artwork Modal (`artwork-modal.tsx`)

### Purpose
Comprehensive interface for creating and editing artworks with full image management capabilities.

### Modes
- **Create Mode**: Adding new artworks
- **Edit Mode**: Modifying existing artworks

### Form Fields

#### Basic Information
- **Title** (required): Artwork title
- **Year** (required): Creation year
- **Medium** (required): Art medium (e.g., "Oil on Canvas")
- **Dimensions** (required): Physical dimensions (e.g., "24x36 inches")
- **Description** (required): Detailed artwork description
- **Price** (required): Selling price (decimal)

#### Physical Properties
- **Width (cm)**: Width in centimeters (for AR)
- **Height (cm)**: Height in centimeters (for AR)
- **Depth (cm)**: Depth in centimeters (for 3D sculptures)
- **Is Sculpture**: Boolean for 3D artworks
- **Is Framed**: Boolean for framed status

#### Status & Visibility
- **Status**: Dropdown with options:
  - "Draft" (default for new)
  - "Available"
  - "Sold"
  - "Reserved"
- **Location**: Text field (default: "Gallery")
- **Is Visible**: Boolean for public visibility

#### Image Management
- **Image Upload**: Cloudinary integration
- **Image Preview**: Real-time preview
- **Image Removal**: Delete uploaded images
- **Watermarking**: Automatic watermark application

### State Management
```typescript
const [isEditing, setIsEditing] = useState(mode === 'create');
const [editedArtwork, setEditedArtwork] = useState<Partial<Artwork & ArtworkWithDisplayOrder> | null>(null);
const [showOriginalImage, setShowOriginalImage] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
```

### Props Interface
```typescript
interface ArtworkModalProps {
  artwork: Artwork | ArtworkWithDisplayOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onArtworkUpdated: (artwork: Artwork) => void;
  onArtworkDeleted: (artworkId: number) => void;
  artistId: number;
  mode?: 'edit' | 'create';
}
```

### Validation Rules
- Title: Required, max 200 characters
- Year: Required, valid year format
- Medium: Required, max 100 characters
- Dimensions: Required, max 50 characters
- Description: Required, max 2000 characters
- Price: Required, positive number
- Width/Height/Depth: Optional, positive numbers if provided

## Artist Profile Modal (`artist-profile-modal.tsx`)

### Purpose
Manage artist profile information including bio, specialty, exhibitions, and profile image.

### Form Fields

#### Basic Information
- **Name** (required): Artist's full name
- **Bio** (optional): Artist biography (max 2000 characters)
- **Specialty** (optional): Art specialty/medium focus
- **Exhibitions** (optional): List of exhibitions (textarea, one per line)

#### Profile Image
- **Profile Image Upload**: Cloudinary integration
- **Image Preview**: Real-time preview
- **Image Removal**: Delete profile image
- **Image Click**: Open full-size view

### State Management
```typescript
const [isLoading, setIsLoading] = useState(false);
const [isUploadingImage, setIsUploadingImage] = useState(false);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
```

### Props Interface
```typescript
interface ArtistProfileModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}
```

### Data Type
```typescript
type ArtistFormData = Omit<Artist, 'exhibitions'> & {
  exhibitions: string | null; // String for textarea input
};
```

## Artist Settings Modal (`artist-settings-modal.tsx`)

### Purpose
Manage artist visibility and featured status settings.

### Settings

#### Featured Status
- **Featured Toggle**: Switch to make artist featured
- **Featured Benefits**:
  - Artworks appear first in search results
  - Profile highlighted on homepage
  - Increased visibility to gallery visitors
  - Priority placement in artist listings

### State Management
```typescript
const [isFeatured, setIsFeatured] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

### Props Interface
```typescript
interface ArtistSettingsModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}
```

## Data Types & Schemas

### Artist Type
```typescript
type Artist = {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  profileImage: string | null;
  specialty: string | null;
  exhibitions: string[] | null;
  isHidden: boolean;
  isVisible: boolean;
  featured: boolean;
  createdAt: Date;
};
```

### Artwork Type
```typescript
type Artwork = {
  id: number;
  title: string;
  slug: string;
  artistId: number;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  price: string; // Decimal from DB
  status: string;
  originalImage: string | null;
  watermarkedImage: string | null;
  watermarkedImagesHistory: Array<{
    url: string;
    generatedAt: string;
    settings: object;
    notes?: string;
  }>;
  privateImages: string[];
  featured: number;
  widthCm: string | null;
  heightCm: string | null;
  depthCm: string | null;
  model3dUrl: string | null;
  has3dModel: boolean;
  studioVisualizationUrl: string | null;
  hasStudioVisualization: boolean;
  show3D: boolean;
  isSculpture: boolean;
  isFramed: boolean;
  location: string;
  isVisible: boolean;
  artistDisplayOrder: number;
  globalDisplayOrder: number;
  createdAt: Date;
};
```

## Server Actions

### Artwork Actions (`src/lib/actions/artwork-actions.ts`)
- `createArtwork(formData: FormData)`: Create new artwork
- `updateArtwork(id: number, formData: FormData)`: Update existing artwork
- `deleteArtwork(id: number)`: Delete artwork
- `updateArtworkOrder(artworks: ArtworkUpdateOrderData[])`: Update display order

### Artist Actions (`src/lib/actions/artist-actions.ts`)
- `updateArtistProfile(formData: FormData)`: Update artist profile
- `updateArtistSettings(settings: ArtistSettingsFormData)`: Update artist settings

## Image Upload System

### Cloudinary Integration
- **Endpoint**: `/api/upload`
- **Supported Formats**: JPG, PNG, WebP
- **Max File Size**: 10MB
- **Automatic Optimization**: Yes
- **Watermarking**: Applied to artwork images

### Upload Process
1. User selects image file
2. File validated (size, format)
3. Upload to Cloudinary
4. URL returned and stored
5. Preview updated in UI

## Error Handling

### Toast Notifications
- **Success**: Green toast with checkmark
- **Error**: Red toast with X icon
- **Loading**: Blue toast with spinner
- **Info**: Blue toast with info icon

### Common Error Scenarios
1. **Validation Errors**: Form field validation failures
2. **Upload Errors**: Image upload failures
3. **Network Errors**: API request failures
4. **Permission Errors**: Unauthorized access attempts

## Mobile Responsiveness

### Design Principles
- **Mobile-First**: All components designed for mobile first
- **Touch-Friendly**: Large touch targets (44px minimum)
- **Responsive Grid**: Adapts to screen size
- **Collapsible UI**: Space-efficient on small screens

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Best Practices for AI Agents

### When Creating Artworks
1. **Always validate required fields** before submission
2. **Use appropriate status** (Draft for new, Available for ready)
3. **Provide detailed descriptions** for better gallery presentation
4. **Set realistic prices** based on artist's market
5. **Upload high-quality images** for best presentation

### When Managing Profiles
1. **Write compelling bios** that tell the artist's story
2. **List relevant exhibitions** in chronological order
3. **Choose appropriate specialty** that matches their work
4. **Upload professional profile images**

### When Handling Settings
1. **Explain featured benefits** to artists
2. **Use featured status strategically** for emerging artists
3. **Maintain visibility settings** appropriately

### Error Recovery
1. **Always provide clear error messages**
2. **Suggest specific actions** to resolve issues
3. **Preserve user data** when possible
4. **Offer alternative solutions** when primary action fails

## Security Considerations

### Data Validation
- All inputs validated on both client and server
- SQL injection prevention via Drizzle ORM
- XSS protection through React's built-in escaping

### File Upload Security
- File type validation
- File size limits
- Malware scanning via Cloudinary

### Authentication
- Stack Auth integration for user management
- Role-based access control
- Session management

## Performance Optimization

### Image Optimization
- Automatic image compression
- WebP format when supported
- Lazy loading for large galleries
- Responsive image sizing

### State Management
- Minimal re-renders
- Efficient state updates
- Debounced search inputs
- Optimistic UI updates

## Testing Guidelines

### Component Testing
- Test all form validations
- Test image upload flows
- Test error scenarios
- Test mobile responsiveness

### Integration Testing
- Test server action responses
- Test database operations
- Test Cloudinary integration
- Test authentication flows

This documentation should be used as a comprehensive guide for AI agents working with the Artist Portal system. Always refer to the actual component code for the most up-to-date implementation details.
