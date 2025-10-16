# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for artwork image uploads and watermarking in the Friendship Admin application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Getting Your Cloudinary Credentials

1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Go to your Dashboard
3. Copy the following credentials:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## Watermark Logo Setup

The system uses a watermark logo stored in Cloudinary. To set this up:

1. Upload your watermark logo to Cloudinary
2. Place it in a folder named `watermarks`
3. Name the file `friendship-gallery-logo` (or update the reference in `src/lib/cloudinary.ts`)

The watermark configuration in the code:
```typescript
{
  overlay: 'watermarks:friendship-gallery-logo',
  opacity: 20,
  width: 175,
  gravity: 'center'
}
```

## Features

### Image Upload
- Artists can upload artwork images through the artwork modal
- Images are automatically uploaded to Cloudinary
- Original images are stored privately
- File size limit: 10MB
- Supported formats: JPEG, PNG, GIF, WebP

### Automatic Watermarking
The system automatically applies two types of watermarks to uploaded images:

1. **Logo Watermark**
   - Position: Center
   - Opacity: 20%
   - Size: 175px width

2. **Text Watermark**
   - Content: "Friendship Center Gallery"
   - Position: Bottom center (50px from bottom)
   - Font: Verdana, 28px
   - Color: White
   - Opacity: 30%

### Image Transformations
All uploaded images are automatically:
- Resized to max 1200x800px (maintains aspect ratio)
- Optimized for web delivery (quality: auto:best)
- Converted to HTTPS URLs

## Usage

### Creating a New Artwork
1. Click "Add New Artwork" button on the artist dashboard
2. Fill in artwork details (title, year, medium, etc.)
3. Click "Upload Artwork Image" to select an image
4. The image will be uploaded and watermarked automatically
5. Click "Create Artwork" to save

### Editing an Artwork
1. Click on an existing artwork to open the modal
2. Click "Edit" button
3. Click "Change Image" to upload a new image (optional)
4. Update other fields as needed
5. Click "Save Changes"

### View Options
- **Watermarked Image**: Default public-facing image with watermarks
- **Original Image**: Toggle to view the original uploaded image (available in edit mode)

## API Endpoint

The upload API is available at `/api/upload`:

**Request:**
```
POST /api/upload
Content-Type: multipart/form-data

{
  file: <image file>
}
```

**Response:**
```json
{
  "originalUrl": "https://res.cloudinary.com/.../original.jpg",
  "watermarkedUrl": "https://res.cloudinary.com/.../watermarked.jpg",
  "publicId": "artworks/private/abc123"
}
```

## Database Schema

The `artworks` table includes these image-related fields:

- `original_image`: URL to the original uploaded image
- `watermarked_image`: URL to the watermarked public image
- `watermarked_images_history`: JSON array of previous watermark configurations (for future use)

## Customization

To customize watermark settings, edit `src/lib/cloudinary.ts`:

```typescript
export function generateWatermarkedUrl(
  originalUrl: string,
  config: WatermarkConfig = {}
): string | null {
  const {
    logoOpacity = 20,        // Adjust logo opacity (0-100)
    logoSize = 175,          // Adjust logo size in pixels
    textContent = 'Your Text', // Change watermark text
    textOpacity = 30,        // Adjust text opacity (0-100)
    textFontSize = 28,       // Adjust text size
    textFontFamily = 'verdana', // Change font
    textColor = 'white'      // Change text color
  } = config;
  // ...
}
```

## Troubleshooting

### Upload Fails
- Check that your Cloudinary credentials are correct
- Ensure the file is under 10MB
- Verify the file is a valid image format

### Watermark Not Appearing
- Verify the watermark logo exists in Cloudinary at `watermarks/friendship-gallery-logo`
- Check the browser console for transformation errors
- Ensure the logo file name matches the one referenced in the code

### Images Not Displaying
- Check that `res.cloudinary.com` is allowed in `next.config.ts`
- Verify the URLs are HTTPS
- Check browser console for CORS errors

## Security Notes

- Original images are uploaded as `private` in Cloudinary
- Only authenticated artists can upload images
- The API validates user authentication before accepting uploads
- Cloudinary credentials should never be exposed to the client

## Performance

- Images are optimized automatically by Cloudinary
- Transformations are applied on-the-fly and cached by Cloudinary's CDN
- No server-side image processing required
- Fast global delivery through Cloudinary's CDN

## Support

For Cloudinary-specific issues, refer to:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)

