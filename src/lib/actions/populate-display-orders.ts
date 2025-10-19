"use server";

import { db } from "@/lib/db";
import { artworks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "./admin-actions";

export async function populateDisplayOrders(): Promise<{
  success: boolean;
  message: string;
  updatedCount?: number;
  error?: string;
}> {
  try {
    // Only allow admins to run this
    await requireAdmin();

    console.log('=== POPULATING DISPLAY ORDERS ===');
    
    // Get all artworks ordered by creation date
    const allArtworks = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        artistId: artworks.artistId,
        createdAt: artworks.createdAt,
        isVisible: artworks.isVisible
      })
      .from(artworks)
      .orderBy(asc(artworks.createdAt));

    console.log(`Found ${allArtworks.length} artworks total`);

    // Group artworks by artist
    const artworksByArtist: Record<number, typeof allArtworks> = {};
    allArtworks.forEach(artwork => {
      if (!artworksByArtist[artwork.artistId]) {
        artworksByArtist[artwork.artistId] = [];
      }
      artworksByArtist[artwork.artistId].push(artwork);
    });

    console.log(`Found ${Object.keys(artworksByArtist).length} artists`);

    let globalOrder = 1;
    const updates: Array<{
      id: number;
      title: string;
      artistDisplayOrder: number;
      globalDisplayOrder: number;
    }> = [];

    // Process each artist's artworks
    for (const [artistId, artistArtworks] of Object.entries(artworksByArtist)) {
      console.log(`\nProcessing artist ${artistId} with ${artistArtworks.length} artworks`);
      
      let artistOrder = 1;
      
      for (const artwork of artistArtworks) {
        // Only assign orders to visible artworks
        if (artwork.isVisible) {
          updates.push({
            id: artwork.id,
            title: artwork.title,
            artistDisplayOrder: artistOrder,
            globalDisplayOrder: globalOrder
          });
          
          console.log(`  ${artwork.title}: artistOrder=${artistOrder}, globalOrder=${globalOrder}`);
          artistOrder++;
          globalOrder++;
        } else {
          console.log(`  ${artwork.title}: SKIPPED (not visible)`);
        }
      }
    }

    console.log(`\n=== UPDATING DATABASE ===`);
    console.log(`Updating ${updates.length} artworks`);

    // Update each artwork
    for (const update of updates) {
      await db
        .update(artworks)
        .set({
          artistDisplayOrder: update.artistDisplayOrder,
          globalDisplayOrder: update.globalDisplayOrder
        })
        .where(eq(artworks.id, update.id));
      
      console.log(`Updated ${update.title}: A${update.artistDisplayOrder}, G${update.globalDisplayOrder}`);
    }

    console.log('\n=== DISPLAY ORDERS POPULATED SUCCESSFULLY ===');
    
    return {
      success: true,
      message: `Successfully populated display orders for ${updates.length} artworks`,
      updatedCount: updates.length
    };

  } catch (error) {
    console.error('Error populating display orders:', error);
    return {
      success: false,
      message: "Failed to populate display orders",
      error: error instanceof Error ? error.message : "Failed to populate display orders"
    };
  }
}
