"use server";

import { db } from "@/lib/db";
import { artists, artworks } from "@/lib/schema";
import { getArtistId } from "@/lib/stack-auth-helpers";
import type { Artist, ArtworkWithDisplayOrder, ApiResponse } from "@/types";
import { requireArtistAccess } from "@/lib/auth-helpers";
import { eq, count, asc, desc } from "drizzle-orm";
// Define user type based on Stack Auth user object structure
type StackAuthUser = {
  id: string;
  displayName?: string | null;
  primaryEmail?: string | null;
  serverMetadata?: {
    role?: string;
    artistID?: string | number;
  };
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
};

export async function getArtistById(
  artistId?: number,
  user?: StackAuthUser
): Promise<ApiResponse<{ artist: Artist; artworks: ArtworkWithDisplayOrder[] }>> {
  try {
    // If no artistId provided, get from current user
    const currentArtistId = artistId || await getArtistId();
    
    console.log("getArtistById - currentArtistId:", currentArtistId);
    
    if (!currentArtistId) {
      console.log("No artist ID found in user metadata");
      return {
        success: false,
        error: "No artist ID found in user metadata. Please contact an administrator to set up your artist profile."
      };
    }

    // Check authorization: must be admin or the artist themselves
    // If user data is provided, use it directly to avoid another getUser() call
    if (user) {
      const role = user.serverMetadata?.role || 'artist';
      const isAdmin = role === 'admin' || role === 'super_admin';
      const userArtistId = user.serverMetadata?.artistID ? parseInt(user.serverMetadata.artistID.toString()) : null;
      
      if (!isAdmin && userArtistId !== currentArtistId) {
        throw new Error("Unauthorized: You can only access your own profile");
      }
    } else {
      // Fallback to the original method if no user data provided
      await requireArtistAccess(currentArtistId);
    }

    // Get artist with artworks using Drizzle query
    const artistData = await db.query.artists.findFirst({
      where: eq(artists.id, currentArtistId),
      with: {
        artworks: {
          orderBy: [asc(artworks.artistDisplayOrder), desc(artworks.createdAt)]
        }
      }
    });
    
    if (!artistData) {
      console.log(`Artist with ID ${currentArtistId} not found in database`);
      return {
        success: false,
        error: `Artist with ID ${currentArtistId} not found.`
      };
    }

    // Get total count of available artworks for global location ID
    const totalAvailableResult = await db
      .select({ count: count() })
      .from(artworks)
      .where(eq(artworks.status, 'Available'));
    
    const totalAvailable = totalAvailableResult[0]?.count || 0;
    
    // Map artworks with location IDs
    const artworksWithLocation: ArtworkWithDisplayOrder[] = artistData.artworks.map((artwork, index) => ({
      id: artwork.id,
      title: artwork.title,
      slug: artwork.slug || '',
      artistId: artwork.artistId,
      year: artwork.year,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      description: artwork.description,
      price: artwork.price,
      status: artwork.status,
      originalImage: artwork.originalImage || null,
      watermarkedImage: artwork.watermarkedImage || null,
      watermarkedImagesHistory: artwork.watermarkedImagesHistory || [],
      privateImages: artwork.privateImages || [],
      featured: artwork.featured || 0,
      widthCm: artwork.widthCm || null,
      heightCm: artwork.heightCm || null,
      depthCm: artwork.depthCm || null,
      model3dUrl: artwork.model3dUrl || null,
      has3dModel: artwork.has3dModel || false,
      studioVisualizationUrl: artwork.studioVisualizationUrl || null,
      hasStudioVisualization: artwork.hasStudioVisualization || false,
      show3D: artwork.show3D || false,
      isSculpture: artwork.isSculpture || false,
      isFramed: artwork.isFramed || false,
      location: artwork.location || 'Gallery',
      isVisible: artwork.isVisible !== false,
      artistDisplayOrder: artwork.artistDisplayOrder || null,
      globalDisplayOrder: artwork.globalDisplayOrder || null,
      createdAt: artwork.createdAt,
      approvalStatus: artwork.approvalStatus || 'pending',
      // Location IDs
      globalLocationId: artwork.globalDisplayOrder || index + 1, // Use database global order or fallback to index
      artistLocationId: artwork.artistDisplayOrder || index + 1 // Use database artist order or fallback to index
    }));

    const artist: Artist = {
      id: artistData.id,
      name: artistData.name,
      slug: artistData.slug,
      bio: artistData.bio || null,
      profileImage: artistData.profileImage || null,
      specialty: artistData.specialty || null,
      exhibitions: artistData.exhibitions || null,
      isHidden: artistData.isHidden || false,
      isVisible: artistData.isVisible,
      featured: artistData.featured,
      createdAt: artistData.createdAt
    };

    console.log(`Found artist: ${artist.name} with ${artworksWithLocation.length} artworks`);
    console.log('Artwork location IDs:', artworksWithLocation.map(a => ({
      title: a.title,
      globalLocationId: a.globalLocationId,
      artistLocationId: a.artistLocationId
    })));

    return {
      success: true,
      data: {
        artist,
        artworks: artworksWithLocation
      }
    };
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch artist data"
    };
  }
}
