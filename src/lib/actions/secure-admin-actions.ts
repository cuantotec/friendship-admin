"use server";

import { db } from "@/lib/db";
import { artworks, artists, events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import type { ApiResponse } from "@/types";

// Helper function to check admin access
async function requireAdmin() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // ONLY use serverMetadata for security (clientMetadata is not secure)
  const role = user.serverMetadata?.role;
  const hasAdminAccess = role === "admin" || role === "super_admin";

  if (!hasAdminAccess) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// SECURE: Artist-specific actions
export async function updateArtistVisibility(
  artistId: number,
  isVisible: boolean
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin(); // SECURITY CHECK
  
  try {
    const result = await db
      .update(artists)
      .set({ isVisible })
      .where(eq(artists.id, artistId))
      .returning({ id: artists.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Artist not found"
      };
    }

    revalidatePath("/admin/artists");
    revalidatePath("/admin");

    return {
      success: true,
      data: { updated: true },
      message: isVisible ? "Artist is now visible" : "Artist is now hidden"
    };
  } catch (error) {
    console.error("Error updating artist visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artist visibility"
    };
  }
}

export async function deleteArtistAdmin(
  artistId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdmin(); // SECURITY CHECK
  
  try {
    const result = await db
      .delete(artists)
      .where(eq(artists.id, artistId))
      .returning({ id: artists.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Artist not found"
      };
    }

    revalidatePath("/admin/artists");
    revalidatePath("/admin");

    return {
      success: true,
      data: { deleted: true },
      message: "Artist deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting artist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artist"
    };
  }
}

// SECURE: Event-specific actions
export async function updateEventStatus(
  eventId: number,
  status: string,
  isCanceled: boolean = false
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin(); // SECURITY CHECK
  
  try {
    const result = await db
      .update(events)
      .set({ 
        status,
        is_canceled: isCanceled
      })
      .where(eq(events.id, eventId))
      .returning({ id: events.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Event not found"
      };
    }

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return {
      success: true,
      data: { updated: true },
      message: "Event status updated successfully"
    };
  } catch (error) {
    console.error("Error updating event status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event status"
    };
  }
}

export async function deleteEventAdmin(
  eventId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdmin(); // SECURITY CHECK
  
  try {
    const result = await db
      .delete(events)
      .where(eq(events.id, eventId))
      .returning({ id: events.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Event not found"
      };
    }

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return {
      success: true,
      data: { deleted: true },
      message: "Event deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event"
    };
  }
}

// SECURE: Artwork-specific actions
export async function updateArtworkVisibility(
  artworkId: number,
  isVisible: boolean
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin(); // SECURITY CHECK
  
  try {
    const result = await db
      .update(artworks)
      .set({ isVisible })
      .where(eq(artworks.id, artworkId))
      .returning({ id: artworks.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    revalidatePath("/admin/artworks");
    revalidatePath("/admin");

    return {
      success: true,
      data: { updated: true },
      message: isVisible ? "Artwork is now visible" : "Artwork is now hidden"
    };
  } catch (error) {
    console.error("Error updating artwork visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artwork visibility"
    };
  }
}

export async function updateArtworkFeatured(
  artworkId: number,
  featured: boolean
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin(); // SECURITY CHECK
  
  try {
    const result = await db
      .update(artworks)
      .set({ featured: featured ? 1 : 0 })
      .where(eq(artworks.id, artworkId))
      .returning({ id: artworks.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    revalidatePath("/admin/artworks");
    revalidatePath("/admin");

    return {
      success: true,
      data: { updated: true },
      message: featured ? "Artwork is now featured" : "Artwork is no longer featured"
    };
  } catch (error) {
    console.error("Error updating artwork featured status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artwork featured status"
    };
  }
}
