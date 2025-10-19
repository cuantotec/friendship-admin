"use server";

import { db } from "@/lib/db";
import { artists } from "@/lib/schema";
import { getArtistId } from "@/lib/stack-auth-helpers";
import type { ApiResponse, Artist } from "@/types";
import { artistProfileSchema, artistSettingsSchema } from "@/lib/validations";
import type { ZodError } from "zod";
import { requireArtistAccess } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";

export async function updateArtistProfile(
  data: Record<string, unknown>
): Promise<ApiResponse<Artist>> {
  try {
    console.log("=== UPDATE ARTIST PROFILE ===");
    console.log("Profile data:", data);

    // Validate with Zod
    const validatedData = artistProfileSchema.parse(data);

    // Get current artist ID from authenticated user
    const artistId = await getArtistId();
    
    if (!artistId) {
      return {
        success: false,
        error: "No artist ID found. Please contact an administrator."
      };
    }

    // Check authorization: must be admin or the artist themselves
    await requireArtistAccess(artistId);

    // Generate slug from name if not provided
    const slug = validatedData.slug || 
      validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Parse exhibitions if it's a string (split by newlines)
    let exhibitionsArray: string[] | null = null;
    if (validatedData.exhibitions) {
      // Split by newlines and filter out empty lines
      exhibitionsArray = validatedData.exhibitions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    console.log("Updating artist with data:", {
      name: validatedData.name,
      slug,
      bio: validatedData.bio || null,
      specialty: validatedData.specialty || null,
      exhibitions: exhibitionsArray,
      profileImage: validatedData.profileImage || null,
      preApproved: validatedData.preApproved
    });

    const result = await db
      .update(artists)
      .set({
        name: validatedData.name,
        slug,
        bio: validatedData.bio || null,
        specialty: validatedData.specialty || null,
        exhibitions: exhibitionsArray,
        profileImage: validatedData.profileImage || null,
        // pre_approved: validatedData.preApproved ?? false // TODO: Add when database column exists
      })
      .where(eq(artists.id, artistId))
      .returning();

    if (result.length === 0) {
      console.log("No artist found with ID:", artistId);
      return {
        success: false,
        error: "Artist not found"
      };
    }

    console.log("Profile updated successfully:", result[0]);
    return {
      success: true,
      data: result[0] as Artist
    };
  } catch (error) {
    console.error("Error updating artist profile:", error);
    
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
      error: error instanceof Error ? error.message : "Failed to update profile"
    };
  }
}

export async function updateArtistSettings(
  data: Record<string, unknown>
): Promise<ApiResponse<Artist>> {
  try {
    console.log("=== UPDATE ARTIST SETTINGS ===");
    console.log("Settings data:", data);

    // Validate with Zod
    const validatedData = artistSettingsSchema.parse(data);

    // Get current artist ID from authenticated user
    const artistId = await getArtistId();
    
    if (!artistId) {
      return {
        success: false,
        error: "No artist ID found. Please contact an administrator."
      };
    }

    console.log("Updating artist settings for ID:", artistId, "with featured:", validatedData.featured);

    const result = await db
      .update(artists)
      .set({
        featured: validatedData.featured
      })
      .where(eq(artists.id, artistId))
      .returning();

    if (result.length === 0) {
      console.log("No artist found with ID:", artistId);
      return {
        success: false,
        error: "Artist not found"
      };
    }

    console.log("Settings updated successfully:", result[0]);
    return {
      success: true,
      data: result[0] as Artist
    };
  } catch (error) {
    console.error("Error updating artist settings:", error);
    
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
      error: error instanceof Error ? error.message : "Failed to update settings"
    };
  }
}
