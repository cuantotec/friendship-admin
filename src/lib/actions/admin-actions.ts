"use server";

import { db } from "@/lib/db";
import { artworks, artists, events, artistInvitations } from "@/lib/schema";
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

// Helper function to check admin access
export async function requireAdmin() {
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
export async function getAdminStats(user?: StackAuthUser): Promise<AdminStats> {
  if (user) {
    // Use provided user data to avoid getUser() call
    const role = user.serverMetadata?.role;
    const hasAdminAccess = role === "admin" || role === "super_admin";
    if (!hasAdminAccess) {
      throw new Error("Unauthorized: Admin access required");
    }
  } else {
    // Fallback to original method
    await requireAdmin();
  }

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
export async function getAllArtworks(user?: StackAuthUser): Promise<ArtworkListItem[]> {
  if (user) {
    // Use provided user data to avoid getUser() call
    const role = user.serverMetadata?.role;
    const hasAdminAccess = role === "admin" || role === "super_admin";
    if (!hasAdminAccess) {
      throw new Error("Unauthorized: Admin access required");
    }
  } else {
    // Fallback to original method
    await requireAdmin();
  }

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
        description: artworks.description,
        price: artworks.price,
        status: artworks.status,
        location: artworks.location,
        watermarkedImage: artworks.watermarkedImage,
        originalImage: artworks.originalImage,
        isVisible: artworks.isVisible,
        featured: artworks.featured,
        widthCm: artworks.widthCm,
        heightCm: artworks.heightCm,
        depthCm: artworks.depthCm,
        approvalStatus: artworks.approvalStatus,
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
    // Get all existing artists
    const artistsResult = await db
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

    // Get all pending invitations
    const invitationsResult = await db
      .select({
        id: artistInvitations.id,
        name: artistInvitations.name,
        email: artistInvitations.email,
        specialty: artistInvitations.specialty,
        code: artistInvitations.code,
        invitedBy: artistInvitations.invitedBy,
        createdAt: artistInvitations.createdAt,
        usedAt: artistInvitations.usedAt,
        stackUserId: artistInvitations.stackUserId,
      })
      .from(artistInvitations)
      .where(sql`${artistInvitations.usedAt} IS NULL`) // Only pending invitations
      .orderBy(desc(artistInvitations.createdAt));

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

    // Map existing artists with their Stack Auth user data
    const mappedArtists = artistsResult.map(row => {
      // Find Stack Auth user by matching artistID in serverMetadata
      const stackUser = stackUsers.find(u => {
        const artistId = u.serverMetadata?.artistID;
        return artistId && parseInt(String(artistId)) === row.id;
      });

      return {
        ...row,
        email: stackUser?.primaryEmail || null,
        createdAt: row.createdAt.toISOString(),
        preApproved: false, // Default value since column doesn't exist yet
        hasUser: !!stackUser,
        userId: stackUser?.id || null,
        userEmail: stackUser?.primaryEmail || null,
        userPrimaryEmail: stackUser?.primaryEmail || null,
        isInvitation: false,
        invitationCode: null,
        invitedBy: null,
      };
    });

    // Map pending invitations as "artists" for display
    const mappedInvitations = invitationsResult.map(invitation => {
      // Check if there's a Stack Auth user for this invitation
      const stackUser = stackUsers.find(u => u.id === invitation.stackUserId);

      return {
        id: -invitation.id, // Use negative ID to distinguish from real artists
        name: invitation.name,
        slug: `invitation-${invitation.id}`, // Temporary slug
        bio: null,
        profileImage: null,
        specialty: invitation.specialty,
        isVisible: false,
        isHidden: true,
        featured: false,
        createdAt: invitation.createdAt.toISOString(),
        artworkCount: 0,
        email: invitation.email,
        userId: stackUser?.id || null,
        userEmail: stackUser?.primaryEmail || invitation.email,
        userPrimaryEmail: stackUser?.primaryEmail || invitation.email,
        hasUser: !!stackUser,
        preApproved: false,
        isInvitation: true,
        invitationCode: invitation.code,
        invitedBy: invitation.invitedBy,
      };
    });

    // Combine and sort by creation date
    const allItems = [...mappedArtists, ...mappedInvitations];
    return allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as ArtistListItem[];

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
        externalUrl: events.externalUrl,
        registrationUrl: events.registrationUrl,
        registrationType: events.registrationType,
        featuredImage: events.featuredImage,
        status: events.status,
        isCanceled: events.is_canceled,
        registrationEnabled: events.registrationEnabled,
        paymentEnabled: events.paymentEnabled,
        isFreeEvent: events.isFreeEvent,
        isRecurring: events.isRecurring,
        chabadPay: events.chabad_pay,
        recurringType: events.recurringType,
        recurringStartTime: events.recurringStartTime,
        recurringStartAmpm: events.recurringStartAmPm,
        recurringEndTime: events.recurringEndTime,
        recurringEndAmpm: events.recurringEndAmPm,
        featuredArtists: events.featuredArtists,
        parentEventId: events.parentEventId,
        isRecurringInstance: events.isRecurringInstance,
        paymentTiers: events.paymentTiers,
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
    // Get artist details first
    const artist = await db
      .select()
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (artist.length === 0) {
      return {
        success: false,
        error: "Artist not found",
      };
    }

    const artistData = artist[0];

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

    // Note: Stack Auth user deletion is not available in the current SDK
    // The user will remain in Stack Auth but will be orphaned
    // This is acceptable as the database cleanup is the primary concern
    try {
      const stackUsers = await stackServerApp.listUsers();
      const stackUser = stackUsers.find(u => {
        const userArtistId = u.serverMetadata?.artistID;
        return userArtistId && parseInt(String(userArtistId)) === artistId;
      });

      if (stackUser) {
        console.log(`Stack Auth user ${stackUser.id} will remain (SDK doesn't support deletion)`);
        console.log(`Artist database record will be deleted, but Stack Auth user remains orphaned`);
      }
    } catch (error) {
      console.error("Error checking Stack Auth user:", error);
      // Continue with artist deletion even if Stack Auth user check fails
    }

    // Delete artist invitations associated with this artist
    try {
      // Find invitations by email (if we have the artist's email from Stack Auth)
      const stackUsers = await stackServerApp.listUsers();
      const stackUser = stackUsers.find(u => {
        const userArtistId = u.serverMetadata?.artistID;
        return userArtistId && parseInt(String(userArtistId)) === artistId;
      });

      if (stackUser?.primaryEmail) {
        await db
          .delete(artistInvitations)
          .where(eq(artistInvitations.email, stackUser.primaryEmail));
        console.log(`Deleted invitations for email: ${stackUser.primaryEmail}`);
      }
    } catch (error) {
      console.error("Error deleting artist invitations:", error);
      // Continue with artist deletion even if invitation deletion fails
    }

    // Delete the artist record
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

// Delete invitation (admin only)
export async function deleteInvitationAdmin(
  invitationId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdmin();

  try {
    // Get invitation details first
    const invitation = await db
      .select()
      .from(artistInvitations)
      .where(eq(artistInvitations.id, invitationId))
      .limit(1);

    if (invitation.length === 0) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    const invitationData = invitation[0];

    // Note: Stack Auth user deletion is not available in the current SDK
    // The user will remain in Stack Auth but will be orphaned
    if (invitationData.stackUserId) {
      console.log(`Stack Auth user ${invitationData.stackUserId} will remain (SDK doesn't support deletion)`);
      console.log(`Invitation database record will be deleted, but Stack Auth user remains orphaned`);
    }

    // Delete the invitation record
    await db.delete(artistInvitations).where(eq(artistInvitations.id, invitationId));

    revalidatePath("/admin/artists");
    revalidatePath("/admin");

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete invitation",
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
    // Use Stack Auth SDK to send password reset email
    const result = await stackServerApp.sendForgotPasswordEmail(userEmail);
    
    if (result.status === "ok") {
      return {
        success: true,
        data: { sent: true },
        message: `Password reset instructions have been sent to ${userEmail}`
      };
    } else {
      return {
        success: false,
        error: result.error?.message || "Failed to send password reset email"
      };
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send password reset email"
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
    // Use Stack Auth REST API to update user status
    // For blocking/unblocking, we'll disable/enable email authentication
    const response = await fetch(`https://api.stack-auth.com/api/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SECRET_SERVER_KEY}`,
      },
      body: JSON.stringify({
        primary_email_auth_enabled: !updates.disabled
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    await response.json();
    
    return {
      success: true,
      data: { updated: true },
      message: updates.disabled 
        ? "User has been blocked (email authentication disabled)" 
        : "User has been unblocked (email authentication enabled)",
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user status",
    };
  }
}

// Get pending artworks for admin
export async function getPendingArtworks(): Promise<ArtworkListItem[]> {
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
        description: artworks.description,
        price: artworks.price,
        status: artworks.status,
        location: artworks.location,
        watermarkedImage: artworks.watermarkedImage,
        originalImage: artworks.originalImage,
        isVisible: artworks.isVisible,
        featured: artworks.featured,
        widthCm: artworks.widthCm,
        heightCm: artworks.heightCm,
        depthCm: artworks.depthCm,
        approvalStatus: artworks.approvalStatus,
        createdAt: artworks.createdAt,
      })
      .from(artworks)
      .leftJoin(artists, eq(artworks.artistId, artists.id))
      .where(eq(artworks.approvalStatus, 'pending'))
      .orderBy(desc(artworks.createdAt));

    return result.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    })) as ArtworkListItem[];
  } catch (error) {
    console.error("Error fetching pending artworks:", error);
    throw new Error("Failed to fetch pending artworks");
  }
}

// Update artwork approval status
export async function updateArtworkApprovalStatus(
  artworkId: number,
  approvalStatus: 'pending' | 'approved' | 'rejected',
  isVisible?: boolean
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin();

  try {
    const updateData: {
      approvalStatus: string;
      isVisible?: boolean;
    } = {
      approvalStatus
    };
    
    // If approving, also set visibility
    if (approvalStatus === 'approved' && isVisible !== undefined) {
      updateData.isVisible = isVisible;
    }

    const result = await db
      .update(artworks)
      .set(updateData)
      .where(eq(artworks.id, artworkId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    return {
      success: true,
      data: { updated: true },
      message: `Artwork ${approvalStatus} successfully`
    };
  } catch (error) {
    console.error("Error updating artwork approval status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update approval status"
    };
  }
}

// Bulk approve all pending artworks
export async function approveAllPendingArtworks(
  isVisible: boolean = true
): Promise<ApiResponse<{ updatedCount: number }>> {
  await requireAdmin();

  try {
    const result = await db
      .update(artworks)
      .set({
        approvalStatus: 'approved',
        isVisible: isVisible
      })
      .where(eq(artworks.approvalStatus, 'pending'))
      .returning();

    return {
      success: true,
      data: { updatedCount: result.length },
      message: `${result.length} artworks approved successfully`
    };
  } catch (error) {
    console.error("Error bulk approving artworks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve artworks"
    };
  }
}

// Update event (admin only)
export async function createEvent(
  eventData: {
    title: string;
    description: string;
    eventType: string;
    slug: string;
    startDate: string;
    endDate?: string | null;
    location?: string | null;
    address?: string | null;
    externalUrl?: string | null;
    registrationUrl?: string | null;
    registrationType: string;
    status: string;
    featuredImage?: string | null;
    registrationEnabled: boolean;
    paymentEnabled: boolean;
    isCanceled: boolean;
    isRecurring: boolean;
    isFreeEvent: boolean;
    chabadPay?: boolean;
    recurringType?: string | null;
    recurringStartTime?: string | null;
    recurringStartAmpm?: string | null;
    recurringEndTime?: string | null;
    recurringEndAmpm?: string | null;
    featuredArtists?: unknown;
    parentEventId?: number | null;
    isRecurringInstance?: boolean;
    paymentTiers?: unknown;
  }
): Promise<ApiResponse<{ eventId: number }>> {
  await requireAdmin();

  try {
    const result = await db
      .insert(events)
      .values({
        title: eventData.title,
        description: eventData.description,
        eventType: eventData.eventType,
        slug: eventData.slug,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        location: eventData.location || "The Friendship Center Gallery", // Hardcoded default location
        address: eventData.address,
        externalUrl: eventData.externalUrl,
        registrationUrl: eventData.registrationUrl,
        registrationType: eventData.registrationType,
        status: eventData.status,
        featuredImage: eventData.featuredImage,
        registrationEnabled: eventData.registrationEnabled,
        paymentEnabled: eventData.paymentEnabled,
        is_canceled: eventData.isCanceled,
        isRecurring: eventData.isRecurring,
        isFreeEvent: eventData.isFreeEvent,
        chabad_pay: eventData.chabadPay ?? true,
        recurringType: eventData.recurringType,
        recurringStartTime: eventData.recurringStartTime,
        recurringStartAmPm: eventData.recurringStartAmpm,
        recurringEndTime: eventData.recurringEndTime,
        recurringEndAmPm: eventData.recurringEndAmpm,
        featuredArtists: eventData.featuredArtists as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        parentEventId: eventData.parentEventId,
        isRecurringInstance: eventData.isRecurringInstance ?? false,
        paymentTiers: eventData.paymentTiers as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      })
      .returning({ id: events.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to create event"
      };
    }

    const eventId = result[0].id;

    // Revalidate relevant pages
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    await triggerMainSiteRevalidation(() => revalidationPatterns.events());

    return {
      success: true,
      data: { eventId },
      message: "Event created successfully"
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event"
    };
  }
}

export async function updateEvent(
  eventId: number,
  updates: {
    title: string;
    description: string;
    eventType: string;
    slug: string;
    startDate: string;
    endDate?: string | null;
    location?: string | null;
    address?: string | null;
    externalUrl?: string | null;
    registrationUrl?: string | null;
    registrationType: string;
    status: string;
    featuredImage?: string | null;
    registrationEnabled: boolean;
    paymentEnabled: boolean;
    isCanceled: boolean;
    isRecurring: boolean;
    isFreeEvent: boolean;
    chabadPay?: boolean;
    recurringType?: string | null;
    recurringStartTime?: string | null;
    recurringStartAmpm?: string | null;
    recurringEndTime?: string | null;
    recurringEndAmpm?: string | null;
    featuredArtists?: unknown;
    parentEventId?: number | null;
    isRecurringInstance?: boolean;
    paymentTiers?: unknown;
  }
): Promise<ApiResponse<{ updated: boolean }>> {
  await requireAdmin();

  try {
    const result = await db
      .update(events)
      .set({
        title: updates.title,
        description: updates.description,
        eventType: updates.eventType,
        slug: updates.slug,
        startDate: new Date(updates.startDate),
        endDate: updates.endDate ? new Date(updates.endDate) : null,
        location: updates.location,
        address: updates.address,
        externalUrl: updates.externalUrl,
        registrationUrl: updates.registrationUrl,
        registrationType: updates.registrationType,
        status: updates.status,
        featuredImage: updates.featuredImage,
        registrationEnabled: updates.registrationEnabled,
        paymentEnabled: updates.paymentEnabled,
        is_canceled: updates.isCanceled,
        isRecurring: updates.isRecurring,
        isFreeEvent: updates.isFreeEvent,
        chabad_pay: updates.chabadPay ?? true,
        recurringType: updates.recurringType,
        recurringStartTime: updates.recurringStartTime,
        recurringStartAmPm: updates.recurringStartAmpm,
        recurringEndTime: updates.recurringEndTime,
        recurringEndAmPm: updates.recurringEndAmpm,
        featuredArtists: updates.featuredArtists as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        parentEventId: updates.parentEventId,
        isRecurringInstance: updates.isRecurringInstance ?? false,
        paymentTiers: updates.paymentTiers as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      })
      .where(eq(events.id, eventId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Event not found"
      };
    }

    return {
      success: true,
      data: { updated: true },
      message: "Event updated successfully"
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event"
    };
  }
}

