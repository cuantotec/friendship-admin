"use server";

import { db } from "@/lib/db";
import { artworks } from "@/lib/schema";
import type { Artwork, ApiResponse } from "@/types";
import { updateArtworkSchema, createArtworkSchema } from "@/lib/validations";
import type { ZodError } from "zod";
import { requireArtworkAccess } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { revalidationPatterns } from "@/lib/revalidation";

// Helper function to trigger revalidation on main site with error handling
async function triggerMainSiteRevalidation(pattern: () => Promise<unknown>) {
  try {
    await pattern();
    console.log("Main site revalidation successful");
  } catch (error) {
    console.error("Main site revalidation failed:", error);
    // Don't throw error - artwork operations should continue even if revalidation fails
  }
}

export async function updateArtwork(
  artworkId: number,
  updates: Partial<Artwork>
): Promise<ApiResponse<Artwork>> {
  try {
    console.log("=== UPDATE ARTWORK ===");
    console.log("Artwork ID:", artworkId);
    console.log("Updates:", updates);

    // First, get the artwork to check ownership
    const existingArtwork = await db.query.artworks.findFirst({
      where: eq(artworks.id, artworkId),
      columns: {
        artistId: true
      }
    });

    if (!existingArtwork) {
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    // Check authorization: must be admin or artwork owner
    await requireArtworkAccess(existingArtwork.artistId);

    // Validate with Zod
    const validatedData = updateArtworkSchema.parse({
      ...updates,
      id: artworkId
    });

    // Build update object with proper field names
    const updateData: Partial<typeof artworks.$inferInsert> = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.year !== undefined) updateData.year = validatedData.year;
    if (validatedData.medium !== undefined) updateData.medium = validatedData.medium;
    if (validatedData.dimensions !== undefined) updateData.dimensions = validatedData.dimensions;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) updateData.price = validatedData.price.toString();
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.featured !== undefined) updateData.featured = validatedData.featured ? 1 : 0;
    if (validatedData.originalImage !== undefined) updateData.originalImage = validatedData.originalImage;
    if (validatedData.watermarkedImage !== undefined) updateData.watermarkedImage = validatedData.watermarkedImage;

    console.log("Update data:", updateData);

    if (Object.keys(updateData).length === 0) {
      console.log("No valid fields to update");
      return {
        success: false,
        error: "No valid fields to update"
      };
    }

    // Perform update with Drizzle
    const result = await db
      .update(artworks)
      .set(updateData)
      .where(eq(artworks.id, artworkId))
      .returning();

    if (result.length === 0) {
      console.log("No artwork found with ID:", artworkId);
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    console.log("Artwork updated successfully:", result[0]);
    
    // Revalidate ISR for all pages that display artwork data
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/artworks");
    
    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artwork());
    
    return {
      success: true,
      data: result[0] as Artwork
    };
  } catch (error) {
    console.error("Error updating artwork:", error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as ZodError;
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError.message,
        details: zodError.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artwork"
    };
  }
}

export async function deleteArtwork(
  artworkId: number
): Promise<ApiResponse<Artwork>> {
  try {
    console.log("=== DELETE ARTWORK ===");
    console.log("Artwork ID:", artworkId);

    // First, get the artwork to check ownership
    const existingArtwork = await db.query.artworks.findFirst({
      where: eq(artworks.id, artworkId),
      columns: {
        artistId: true
      }
    });

    if (!existingArtwork) {
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    // Check authorization: must be admin or artwork owner
    await requireArtworkAccess(existingArtwork.artistId);

    console.log("Deleting artwork with ID:", artworkId);

    const result = await db
      .delete(artworks)
      .where(eq(artworks.id, artworkId))
      .returning();

    console.log("Delete result:", result);

    if (result.length === 0) {
      console.log("No artwork found with ID:", artworkId);
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    console.log("Artwork deleted successfully:", result[0]);
    
    // Revalidate ISR for all pages that display artwork data
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/artworks");
    
    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artwork());
    
    return {
      success: true,
      data: result[0] as Artwork
    };
  } catch (error) {
    console.error("Error deleting artwork:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artwork"
    };
  }
}

export async function createArtwork(
  artworkData: Record<string, unknown>
): Promise<ApiResponse<Artwork>> {
  try {
    console.log("=== CREATE ARTWORK ===");
    console.log("Artwork data:", artworkData);

    // Check authorization: must be admin or the artist creating their own artwork
    if (artworkData.artistId) {
      await requireArtworkAccess(Number(artworkData.artistId));
    } else {
      return {
        success: false,
        error: "Artist ID is required"
      };
    }

    // Validate with Zod
    const validatedData = createArtworkSchema.parse(artworkData);

    const {
      title,
      year,
      medium,
      dimensions,
      description,
      price,
      status = 'Draft',
      featured = 0,
      artistId,
      originalImage,
      watermarkedImage
    } = validatedData;

    // Generate slug from title
    const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const insertData = {
      title,
      slug,
      year,
      medium,
      dimensions,
      description,
      price: price.toString(),
      status,
      featured,
      artistId,
      originalImage: originalImage || null,
      watermarkedImage: watermarkedImage || null
    };

    console.log("Creating artwork with data:", insertData);

    const result = await db
      .insert(artworks)
      .values(insertData)
      .returning();

    console.log("Create result:", result);

    console.log("Artwork created successfully:", result[0]);
    
    // Revalidate ISR for all pages that display artwork data
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/artworks");
    
    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artwork());
    
    return {
      success: true,
      data: result[0] as Artwork
    };
  } catch (error) {
    console.error("Error creating artwork:", error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as ZodError;
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError.message,
        details: zodError.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create artwork"
    };
  }
}
