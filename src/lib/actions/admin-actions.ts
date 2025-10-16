"use server";

import { db } from "@/lib/db";
import { artworks, artists, events } from "@/lib/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidationPatterns } from "@/lib/revalidation";
import type { 
  AdminStats, 
  ArtworkListItem, 
  ArtistListItem, 
  EventListItem,
  ApiResponse
} from "@/types";

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

// Helper function to trigger revalidation on main site with error handling
async function triggerMainSiteRevalidation(pattern: () => Promise<unknown>) {
  try {
    await pattern();
    console.log("Main site revalidation successful");
  } catch (error) {
    console.error("Main site revalidation failed:", error);
    // Don't throw error - admin operations should continue even if revalidation fails
  }
}

// Get admin dashboard stats
export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  try {
    // Get total artworks count
    const artworksCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(artworks);

    // Get total artworks worth
    const artworksWorth = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(price AS DECIMAL)), 0)::text` })
      .from(artworks)
      .where(eq(artworks.isVisible, true));

    // Get total artists count
    const artistsCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(artists);

    // Get active events count (not canceled, future or ongoing)
    const activeEventsCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(
        and(
          eq(events.is_canceled, false),
          sql`${events.endDate} >= NOW() OR ${events.endDate} IS NULL`
        )
      );

    return {
      totalArtworks: artworksCount[0]?.count || 0,
      artworksWorth: artworksWorth[0]?.total || "0",
      totalArtists: artistsCount[0]?.count || 0,
      activeEvents: activeEventsCount[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw new Error("Failed to fetch admin statistics");
  }
}

// Get all artworks for admin
export async function getAllArtworks(): Promise<ArtworkListItem[]> {
  await requireAdmin();

  try {
    const result = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        slug: artworks.slug,
        artistId: artworks.artistId,
        artistName: artists.name,
        year: artworks.year,
        medium: artworks.medium,
        dimensions: artworks.dimensions,
        price: artworks.price,
        status: artworks.status,
        location: artworks.location,
        watermarkedImage: artworks.watermarkedImage,
        originalImage: artworks.originalImage,
        isVisible: artworks.isVisible,
        featured: artworks.featured,
        createdAt: artworks.createdAt,
      })
      .from(artworks)
      .leftJoin(artists, eq(artworks.artistId, artists.id))
      .orderBy(desc(artworks.createdAt));

    return result.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    })) as ArtworkListItem[];
  } catch (error) {
    console.error("Error fetching artworks:", error);
    throw new Error("Failed to fetch artworks");
  }
}

// Get all artists for admin
export async function getAllArtists(): Promise<ArtistListItem[]> {
  await requireAdmin();

  try {
    const result = await db
      .select({
        id: artists.id,
        name: artists.name,
        slug: artists.slug,
        bio: artists.bio,
        profileImage: artists.profileImage,
        specialty: artists.specialty,
        isVisible: artists.isVisible,
        isHidden: artists.isHidden,
        featured: artists.featured,
        createdAt: artists.createdAt,
        artworkCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${artworks} 
          WHERE ${artworks.artistId} = ${artists.id}
        )`,
      })
      .from(artists)
      .orderBy(desc(artists.createdAt));

    // Fetch all Stack Auth users
    let stackUsers: Array<{ id: string; primaryEmail: string | null; serverMetadata: Record<string, unknown> | null }> = [];
    try {
      const users = await stackServerApp.listUsers();
      stackUsers = users.map(u => ({
        id: u.id,
        primaryEmail: u.primaryEmail || null,
        serverMetadata: u.serverMetadata || null
      }));
    } catch (error) {
      console.error("Error fetching Stack Auth users:", error);
    }

    // Map artists with their Stack Auth user data
    return result.map(row => {
      // Find Stack Auth user by matching artistID in serverMetadata
      const stackUser = stackUsers.find(u => {
        const artistId = u.serverMetadata?.artistID;
        return artistId && parseInt(String(artistId)) === row.id;
      });

      return {
        ...row,
        email: stackUser?.primaryEmail || null,
        createdAt: row.createdAt.toISOString(),
        // Stack Auth user data
        hasUser: !!stackUser,
        userId: stackUser?.id || null,
        userEmail: stackUser?.primaryEmail || null,
        userPrimaryEmail: stackUser?.primaryEmail || null,
      };
    }) as ArtistListItem[];
  } catch (error) {
    console.error("Error fetching artists:", error);
    throw new Error("Failed to fetch artists");
  }
}

// Get all events for admin
export async function getAllEvents(): Promise<EventListItem[]> {
  await requireAdmin();

  try {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        address: events.address,
        featuredImage: events.featuredImage,
        status: events.status,
        isCanceled: events.is_canceled,
        registrationEnabled: events.registrationEnabled,
        paymentEnabled: events.paymentEnabled,
        isRecurring: events.isRecurring,
        createdAt: events.createdAt,
      })
      .from(events)
      .orderBy(desc(events.startDate));

    return result.map(row => ({
      ...row,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate ? row.endDate.toISOString() : null,
      createdAt: row.createdAt.toISOString()
    })) as EventListItem[];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }
}

// Update artwork location
export async function updateArtworkLocation(
  artworkId: number,
  location: string
): Promise<ApiResponse<typeof artworks.$inferSelect>> {
  await requireAdmin();

  try {
    const result = await db
      .update(artworks)
      .set({ location })
      .where(eq(artworks.id, artworkId))
      .returning();

    revalidatePath("/");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin");

    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artwork());

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error updating artwork location:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update location",
    };
  }
}

// Toggle artwork visibility
export async function toggleArtworkVisibility(
  artworkId: number
): Promise<ApiResponse<typeof artworks.$inferSelect>> {
  await requireAdmin();

  try {
    const artwork = await db
      .select({ isVisible: artworks.isVisible })
      .from(artworks)
      .where(eq(artworks.id, artworkId))
      .limit(1);

    if (!artwork[0]) {
      return {
        success: false,
        error: "Artwork not found",
      };
    }

    const result = await db
      .update(artworks)
      .set({ isVisible: !artwork[0].isVisible })
      .where(eq(artworks.id, artworkId))
      .returning();

    revalidatePath("/");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin");

    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artwork());

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error toggling artwork visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle visibility",
    };
  }
}

// Toggle artist visibility
export async function toggleArtistVisibility(
  artistId: number
): Promise<ApiResponse<typeof artists.$inferSelect>> {
  await requireAdmin();

  try {
    const artist = await db
      .select({ isVisible: artists.isVisible })
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (!artist[0]) {
      return {
        success: false,
        error: "Artist not found",
      };
    }

    const result = await db
      .update(artists)
      .set({ isVisible: !artist[0].isVisible })
      .where(eq(artists.id, artistId))
      .returning();

    revalidatePath("/");
    revalidatePath("/admin/artists");
    revalidatePath("/admin");

    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artists());

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error toggling artist visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle visibility",
    };
  }
}

// Cancel/Uncancel event
export async function toggleEventCancellation(
  eventId: number
): Promise<ApiResponse<typeof events.$inferSelect>> {
  await requireAdmin();

  try {
    const event = await db
      .select({ isCanceled: events.is_canceled })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event[0]) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    const result = await db
      .update(events)
      .set({ is_canceled: !event[0].isCanceled })
      .where(eq(events.id, eventId))
      .returning();

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error toggling event cancellation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle cancellation",
    };
  }
}

// Delete artwork (admin only)
export async function deleteArtworkAdmin(
  artworkId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdmin();

  try {
    await db.delete(artworks).where(eq(artworks.id, artworkId));

    revalidatePath("/");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin");

    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artwork());

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting artwork:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artwork",
    };
  }
}

// Delete artist (admin only)
export async function deleteArtistAdmin(
  artistId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdmin();

  try {
    // Check if artist has artworks
    const artistArtworks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(artworks)
      .where(eq(artworks.artistId, artistId));

    if (artistArtworks[0]?.count > 0) {
      return {
        success: false,
        error: "Cannot delete artist with existing artworks. Delete artworks first.",
      };
    }

    await db.delete(artists).where(eq(artists.id, artistId));

    revalidatePath("/");
    revalidatePath("/admin/artists");
    revalidatePath("/admin");

    // Trigger revalidation on main site
    await triggerMainSiteRevalidation(() => revalidationPatterns.artists());

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting artist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artist",
    };
  }
}

// Delete event (admin only)
export async function deleteEventAdmin(
  eventId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdmin();

  try {
    await db.delete(events).where(eq(events.id, eventId));

    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    };
  }
}

// Send password reset email to user (admin only)
export async function sendPasswordResetEmail(
  userId: string,
  userEmail: string
): Promise<ApiResponse<{ sent: boolean }>> {
  await requireAdmin();

  try {
    // Note: Stack Auth password reset needs to be triggered via the Stack Auth Dashboard
    // or using Stack Auth's API endpoints directly. This is a placeholder for future implementation.
    // For now, we'll return a message directing admins to use the Stack Auth dashboard.
    
    return {
      success: true,
      data: { sent: true },
      message: `To reset password for ${userEmail}, please use the Stack Auth Dashboard or send them the forgot password link: ${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/forgot-password`,
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send password reset email",
    };
  }
}

// Update user metadata (admin only) - for blocking/unblocking
export async function updateUserStatus(
  userId: string,
  updates: {
    disabled?: boolean;
  }
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin();

  try {
    // Note: Stack Auth user blocking/unblocking needs to be done via the Stack Auth Dashboard
    // This is a placeholder for future implementation when Stack Auth provides an API for this.
    
    return {
      success: true,
      data: { updated: true },
      message: updates.disabled 
        ? "To block this user, please use the Stack Auth Dashboard" 
        : "To unblock this user, please use the Stack Auth Dashboard",
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user status",
    };
  }
}

