"use server";

import { db } from "@/lib/db";
import { artworks } from "@/lib/schema";
import type { ArtworkUpdateOrderData, ApiResponse } from "@/types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateArtworkOrder(
  artworkUpdates: ArtworkUpdateOrderData[]
): Promise<ApiResponse<{ updatedCount: number }>> {
  try {
    console.log("=== UPDATE ARTWORK ORDER ===");
    console.log("Artwork updates:", artworkUpdates);

    if (!artworkUpdates || artworkUpdates.length === 0) {
      return {
        success: false,
        error: "No artwork updates provided"
      };
    }

    // Update each artwork's artist location ID using Drizzle
    for (const update of artworkUpdates) {
      console.log(`Updating artwork ${update.id} with artist_display_order ${update.artistLocationId}`);
      
      const result = await db
        .update(artworks)
        .set({
          artistDisplayOrder: update.artistLocationId
        })
        .where(eq(artworks.id, update.id))
        .returning({
          id: artworks.id,
          title: artworks.title,
          artistDisplayOrder: artworks.artistDisplayOrder
        });
      
      if (result.length === 0) {
        console.log(`No artwork found with ID: ${update.id}`);
        return {
          success: false,
          error: `Artwork with ID ${update.id} not found`
        };
      }
      
      console.log(`Successfully updated artwork ${update.id}:`, result[0]);
    }

    console.log("All artwork orders updated successfully");
    
    // Revalidate ISR for all pages that display artwork data
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/artworks");
    
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
