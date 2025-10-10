"use server";

import { db } from "@/lib/simple-db";

export async function updateArtworkOrder(artworkUpdates: Array<{ id: number; artistLocationId: number }>) {
  try {
    console.log("=== UPDATE ARTWORK ORDER ===");
    console.log("Artwork updates:", artworkUpdates);

    if (!artworkUpdates || artworkUpdates.length === 0) {
      return {
        success: false,
        error: "No artwork updates provided"
      };
    }

    // Update each artwork's artist location ID
    for (const update of artworkUpdates) {
      const query = `
        UPDATE artworks 
        SET artist_display_order = $1
        WHERE id = $2
        RETURNING id, title, artist_display_order
      `;
      
      const params = [update.artistLocationId, update.id];
      
      console.log(`Updating artwork ${update.id} with artist_display_order ${update.artistLocationId}`);
      console.log("Query:", query);
      console.log("Params:", params);
      
      const result = await db.execute(query, params);
      
      if (result.rows.length === 0) {
        console.log(`No artwork found with ID: ${update.id}`);
        return {
          success: false,
          error: `Artwork with ID ${update.id} not found`
        };
      }
      
      console.log(`Successfully updated artwork ${update.id}:`, result.rows[0]);
    }

    console.log("All artwork orders updated successfully");
    return {
      success: true,
      data: { updatedCount: artworkUpdates.length }
    };
  } catch (error) {
    console.error("Error updating artwork order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artwork order"
    };
  }
}
