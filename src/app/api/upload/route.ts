import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, generateWatermarkedUrl } from '@/lib/cloudinary';
import { stackServerApp } from '@/stack/server';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(base64, 'artworks/private');
    
    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Generate watermarked URL
    const watermarkedUrl = generateWatermarkedUrl(uploadResult.url);
    
    if (!watermarkedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate watermarked image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      originalUrl: uploadResult.url,
      watermarkedUrl,
      publicId: uploadResult.publicId
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

