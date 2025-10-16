import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export interface WatermarkConfig {
  logoOpacity?: number;
  logoSize?: number;
  textContent?: string;
  textOpacity?: number;
  textFontSize?: number;
  textFontFamily?: string;
  textColor?: string;
}

/**
 * Generate a watermarked URL from a Cloudinary URL
 */
export function generateWatermarkedUrl(
  originalUrl: string,
  config: WatermarkConfig = {}
): string | null {
  try {
    const {
      logoOpacity = 20,
      logoSize = 175,
      textContent = 'Friendship Center Gallery',
      textOpacity = 30,
      textFontSize = 28,
      textFontFamily = 'verdana',
      textColor = 'white'
    } = config;

    let publicId: string | null = null;
    let imageType: 'private' | 'upload' = 'upload';
    
    // Handle private images
    if (originalUrl.includes('/image/private/')) {
      const privateMatch = originalUrl.match(/\/artworks\/private\/([^\./?]+)/);
      if (privateMatch) {
        publicId = `artworks/private/${privateMatch[1]}`;
        imageType = 'private';
      }
    } 
    // Handle public images
    else if (originalUrl.includes('/image/upload/')) {
      const publicMatch = originalUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.(jpg|jpeg|png|gif|webp)$/i);
      if (publicMatch) {
        publicId = publicMatch[1];
      }
    }
    
    if (!publicId) {
      console.error(`Could not extract public ID from URL: ${originalUrl}`);
      return null;
    }

    // Generate watermarked URL with transformations
    return cloudinary.url(publicId, {
      transformation: [
        { 
          width: 1200, 
          height: 800, 
          crop: 'limit', 
          quality: 'auto:best' 
        },
        {
          overlay: 'watermarks:friendship-gallery-logo',
          opacity: logoOpacity,
          width: logoSize,
          gravity: 'center'
        },
        {
          overlay: {
            text: textContent,
            font_family: textFontFamily,
            font_size: textFontSize
          },
          color: textColor,
          opacity: textOpacity,
          gravity: 'south',
          y: 50
        }
      ],
      secure: true,
      type: imageType
    });
  } catch (error) {
    console.error('Error generating watermarked URL:', error);
    return null;
  }
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'artworks/private'
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder,
      resource_type: 'image',
      type: 'private', // Make images private by default
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

export { cloudinary };

