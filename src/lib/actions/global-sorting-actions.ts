"use server";

import { db } from "@/lib/db";
import { artworks, artists } from "@/lib/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/types";

export interface ArtworkForSorting {
  id: number;
  title: string;
  artistName: string;
  watermarkedImage: string | null;
  globalDisplayOrder: number;
  isVisible: boolean;
}

export interface GlobalSortingUpdate {
  id: number;
  globalDisplayOrder: number;
}

// Get all artworks for global sorting
export async function getAllArtworksForSorting(): Promise<ArtworkForSorting[]> {
  try {
    const result = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        artistName: artists.name,
        watermarkedImage: artworks.watermarkedImage,
        globalDisplayOrder: artworks.globalDisplayOrder,
        isVisible: artworks.isVisible,
      })
      .from(artworks)
      .leftJoin(artists, eq(artworks.artistId, artists.id))
      .orderBy(asc(artworks.globalDisplayOrder), desc(artworks.createdAt));

    return result.map(row => ({
      id: row.id,
      title: row.title,
      artistName: row.artistName || "Unknown Artist",
      watermarkedImage: row.watermarkedImage,
      globalDisplayOrder: row.globalDisplayOrder || 0,
      isVisible: row.isVisible,
    }));
  } catch (error) {
    console.error("Error fetching artworks for sorting:", error);
    throw new Error("Failed to fetch artworks for sorting");
  }
}

// Update global display orders
export async function updateGlobalDisplayOrders(
  updates: GlobalSortingUpdate[]
): Promise<ApiResponse<{ updatedCount: number }>> {
  try {
    console.log("=== UPDATE GLOBAL DISPLAY ORDERS ===");
    console.log("Updates:", updates);

    if (!updates || updates.length === 0) {
      return {
        success: false,
        error: "No updates provided"
      };
    }

    // Update each artwork's global display order
    for (const update of updates) {
      await db
        .update(artworks)
        .set({ globalDisplayOrder: update.globalDisplayOrder })
        .where(eq(artworks.id, update.id));
    }

    console.log(`Successfully updated ${updates.length} artworks`);

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/sorting");

    return {
      success: true,
      data: { updatedCount: updates.length }
    };
  } catch (error) {
    console.error("Error updating global display orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update display orders"
    };
  }
}

// Generate random display order values for all artworks
export async function generateRandomDisplayOrders(): Promise<ApiResponse<{ updatedCount: number }>> {
  try {
    console.log("=== GENERATE RANDOM DISPLAY ORDERS ===");

    // Get all artworks
    const allArtworks = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        createdAt: artworks.createdAt,
      })
      .from(artworks)
      .orderBy(desc(artworks.createdAt));

    if (allArtworks.length === 0) {
      return {
        success: false,
        error: "No artworks found to update"
      };
    }

    // Generate unique random numbers between 1 and number of artworks
    const totalArtworks = allArtworks.length;
    const randomNumbers = Array.from({ length: totalArtworks }, (_, i) => i + 1);
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = randomNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomNumbers[i], randomNumbers[j]] = [randomNumbers[j], randomNumbers[i]];
    }

    // Create updates with unique random display orders
    const updates = allArtworks.map((artwork, index) => ({
      id: artwork.id,
      globalDisplayOrder: randomNumbers[index]
    }));

    console.log("Generated unique random display orders:", randomNumbers);

    // Update all artworks with random display orders
    for (const update of updates) {
      await db
        .update(artworks)
        .set({ globalDisplayOrder: update.globalDisplayOrder })
        .where(eq(artworks.id, update.id));
    }

    console.log(`Successfully generated random display orders for ${updates.length} artworks`);

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/sorting");

    return {
      success: true,
      data: { updatedCount: updates.length }
    };
  } catch (error) {
    console.error("Error generating random display orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate random display orders"
    };
  }
}
