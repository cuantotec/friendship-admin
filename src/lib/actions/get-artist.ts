"use server";

import { db } from "@/lib/simple-db";
import { getArtistId } from "@/lib/stack-auth-helpers";

export async function getArtistById(artistId?: number) {
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

    // Simple query: get artist and artworks in one query with JOIN
    const result = await db.execute(`
      SELECT 
        a.id as artist_id,
        a.name as artist_name,
        a.slug as artist_slug,
        a.bio as artist_bio,
        a.profile_image,
        a.specialty,
        a.exhibitions,
        a.is_hidden,
        a.is_visible,
        a.featured as artist_featured,
        a.created_at as artist_created_at,
        w.id as artwork_id,
        w.title as artwork_title,
        w.slug as artwork_slug,
        w.year,
        w.medium,
        w.dimensions,
        w.description,
        w.price,
        w.status,
        w.original_image,
        w.watermarked_image,
        w.featured as artwork_featured,
        w.artist_display_order,
        w.created_at as artwork_created_at
      FROM artists a
      LEFT JOIN artworks w ON a.id = w.artist_id
      WHERE a.id = ${currentArtistId}
      ORDER BY w.artist_display_order ASC, w.created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log(`Artist with ID ${currentArtistId} not found in database`);
      return {
        success: false,
        error: `Artist with ID ${currentArtistId} not found.`
      };
    }

    // Process the JOIN result
    const firstRow = result.rows[0];
    const artist = {
      id: firstRow.artist_id,
      name: firstRow.artist_name,
      slug: firstRow.artist_slug,
      bio: firstRow.artist_bio,
      profileImage: firstRow.profile_image,
      specialty: firstRow.specialty,
      exhibitions: firstRow.exhibitions,
      isHidden: firstRow.is_hidden,
      isVisible: firstRow.is_visible,
      featured: firstRow.artist_featured,
      createdAt: firstRow.artist_created_at
    };

    // Extract artworks (filter out null artwork rows)
    const allArtworks = result.rows.filter(row => row.artwork_id !== null);
    
    // Get total count of available artworks for global location ID
    const totalAvailableArtworks = await db.execute(`
      SELECT COUNT(*) as count FROM artworks WHERE status = 'Available'
    `);
    const totalAvailable = parseInt(totalAvailableArtworks.rows[0].count as string);
    
    // Calculate location IDs for each artwork
    const artworks = allArtworks.map((row, index) => ({
      id: row.artwork_id,
      title: row.artwork_title,
      slug: row.artwork_slug,
      artistId: row.artist_id,
      year: row.year,
      medium: row.medium,
      dimensions: row.dimensions,
      description: row.description,
      price: row.price,
      status: row.status,
      originalImage: row.original_image,
      watermarkedImage: row.watermarked_image,
      featured: row.artwork_featured,
      createdAt: row.artwork_created_at,
      // Location IDs
      globalLocationId: Math.floor(Math.random() * totalAvailable) + 1, // Random between 1 and total available
      artistLocationId: row.artist_display_order || index + 1 // Use database order or fallback to index
    }));

    console.log(`Found artist: ${artist.name} with ${artworks.length} artworks`);
    console.log('Artwork location IDs:', artworks.map(a => ({
      title: a.title,
      globalLocationId: a.globalLocationId,
      artistLocationId: a.artistLocationId
    })));

    return {
      success: true,
      data: {
        artist,
        artworks
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
