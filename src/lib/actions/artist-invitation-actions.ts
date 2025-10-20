"use server";

import { db } from "@/lib/db";
import { artistInvitations, artists } from "@/lib/schema";
import { stackServerApp } from "@/stack/server";
import { sendArtistInvitation } from "@/lib/emailer";
import { generateConfirmationNumber } from "@/lib/emailer/helpers";
import type { ApiResponse } from "@/types";
import { z } from "zod";
import { eq, and, isNull, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { revalidationPatterns } from "@/lib/revalidation";

// Validation schema for artist invitation
const artistInvitationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  preApproved: z.boolean().optional().default(false),
});

export async function inviteArtist(formData: FormData): Promise<ApiResponse<{ invitationCode: string }>> {
  try {
    console.log("=== INVITE ARTIST ===");
    
    // Validate admin access
    const user = await stackServerApp.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = user.serverMetadata?.role;
    const hasAdminAccess = role === "admin" || role === "super_admin";
    if (!hasAdminAccess) {
      return { success: false, error: "Admin access required" };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      preApproved: formData.get("preApproved") === "true",
    };

    const validatedData = artistInvitationSchema.parse(rawData);
    console.log("Validated data:", validatedData);

    // Check if artist already exists
    const existingArtist = await db
      .select({ id: artistInvitations.id, name: artistInvitations.name })
      .from(artistInvitations)
      .where(eq(artistInvitations.email, validatedData.email))
      .limit(1);

    if (existingArtist.length > 0) {
      return {
        success: false,
        error: `Artist with email ${validatedData.email} already exists`
      };
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db
      .select({ id: artistInvitations.id })
      .from(artistInvitations)
      .where(
        and(
          eq(artistInvitations.email, validatedData.email),
          isNull(artistInvitations.usedAt)
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return {
        success: false,
        error: `Artist with email ${validatedData.email} already has a pending invitation`
      };
    }

    // Generate unique invitation code
    const invitationCode = generateConfirmationNumber('INVITE-');
    const adminName = user.displayName || user.primaryEmail || "Gallery Admin";

    // Create Stack Auth user for the artist
    let stackUserId: string | null = null;
    try {
      // Check if user already exists in Stack Auth
      const existingUsers = await stackServerApp.listUsers();
      const existingUser = existingUsers.find(u => u.primaryEmail === validatedData.email);
      
      if (existingUser) {
        stackUserId = existingUser.id;
        console.log("User already exists in Stack Auth:", existingUser.id);
      } else {
        // Create new user in Stack Auth
        const newUser = await stackServerApp.createUser({
          primaryEmail: validatedData.email,
          displayName: validatedData.name,
          serverMetadata: {
            role: "artist",
            invitationCode: invitationCode,
            invitedBy: adminName
          }
        });
        stackUserId = newUser.id;
        console.log("Created new Stack Auth user:", newUser.id);
      }
    } catch (error) {
      console.error("Error creating Stack Auth user:", error);
      console.error("Stack Auth error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Continue with invitation creation even if Stack Auth user creation fails
      // The user can still complete setup manually
    }

    // Store invitation in database
    await db.insert(artistInvitations).values({
      email: validatedData.email,
      name: validatedData.name,
      specialty: null,
      message: validatedData.preApproved ? "Pre-approved artist" : null,
      code: invitationCode,
      invitedBy: adminName,
      stackUserId: stackUserId, // Store the Stack Auth user ID
    });

    // Send magic link for auto-login
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://artist.friendshipcentergallery.org' 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    const setupUrl = `${baseUrl}/handler/setup?code=${invitationCode}`;
    
    // Note: Magic link generation removed - artists will use forgot password flow instead
    if (stackUserId) {
      console.log("Stack Auth user created for:", validatedData.email);
      console.log("Artist should use 'Forgot Password' to set their password and log in");
    }
    
    const emailResult = await sendArtistInvitation({
      artistName: validatedData.name,
      artistEmail: validatedData.email,
      invitationCode, // Still pass it but it's optional now
      adminName,
      setupUrl,
      baseUrl
    });

    if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error);
      return {
        success: false,
        error: `Invitation created but email failed to send: ${emailResult.error}`
      };
    }

    console.log("Artist invitation sent successfully:", invitationCode);

    return {
      success: true,
      data: { invitationCode },
      message: "Invitation sent successfully"
    };

  } catch (error) {
    console.error("Error inviting artist:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation error"
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation"
    };
  }
}

export async function createArtistFromAuth(data: {
  bio: string;
  specialty: string;
  exhibitions?: string;
  profileImage?: string | null;
}): Promise<ApiResponse<{ artistId: number; userId: string }>> {
  try {
    console.log("=== CREATE ARTIST FROM AUTH ===");

    // Get current user from Stack Auth
    const user = await stackServerApp.getUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to complete this setup"
      };
    }

    // Check if artist already exists
    const existingArtist = await db
      .select({ id: artists.id })
      .from(artists)
      .where(eq(artists.name, user.displayName || "Artist"))
      .limit(1);

    if (existingArtist.length > 0) {
      return {
        success: false,
        error: "Artist profile already exists"
      };
    }

    // Generate slug from name
    const name = user.displayName || "Artist";
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Parse exhibitions if provided
    let exhibitionsArray: string[] | null = null;
    if (data.exhibitions) {
      exhibitionsArray = data.exhibitions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    // Create artist record
    const newArtist = await db.insert(artists).values({
      name: name,
      slug: slug,
      bio: data.bio,
      specialty: data.specialty,
      exhibitions: exhibitionsArray,
      profileImage: data.profileImage || null,
      isVisible: true,
      isHidden: false,
      featured: false,
    }).returning({ id: artists.id });

    const artistId = newArtist[0].id;

    // Update Stack Auth user with artist ID
    await user.update({
      serverMetadata: {
        ...user.serverMetadata,
        artistID: artistId,
        role: "artist"
      }
    });

    console.log("Artist created successfully:", artistId);

    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath("/admin/artists");
    revalidatePath("/admin");

    await revalidationPatterns.artists();

    return {
      success: true,
      data: { artistId, userId: user.id },
      message: "Artist profile created successfully"
    };

  } catch (error) {
    console.error("Error creating artist from auth:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create artist profile"
    };
  }
}

export async function getInvitationStats(): Promise<ApiResponse<{
  total: number;
  pending: number;
  used: number;
  recent: Array<{
    id: number;
    name: string;
    email: string;
    code: string;
    invitedBy: string;
    createdAt: string;
    usedAt: string | null;
  }>;
}>> {
  try {
    // Validate admin access
    const user = await stackServerApp.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = user.serverMetadata?.role;
    const hasAdminAccess = role === "admin" || role === "super_admin";
    if (!hasAdminAccess) {
      return { success: false, error: "Admin access required" };
    }

    // Get invitation statistics
    const stats = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(CASE WHEN ${artistInvitations.usedAt} IS NULL THEN 1 END)`,
        used: sql<number>`COUNT(CASE WHEN ${artistInvitations.usedAt} IS NOT NULL THEN 1 END)`,
      })
      .from(artistInvitations);

    // Get recent invitations
    const recent = await db
      .select({
        id: artistInvitations.id,
        name: artistInvitations.name,
        email: artistInvitations.email,
        code: artistInvitations.code,
        invitedBy: artistInvitations.invitedBy,
        createdAt: artistInvitations.createdAt,
        usedAt: artistInvitations.usedAt,
      })
      .from(artistInvitations)
      .orderBy(desc(artistInvitations.createdAt))
      .limit(10);

    return {
      success: true,
      data: {
        total: stats[0].total,
        pending: stats[0].pending,
        used: stats[0].used,
        recent: recent.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          code: row.code,
          invitedBy: row.invitedBy,
          createdAt: row.createdAt.toISOString(),
          usedAt: row.usedAt?.toISOString() || null
        }))
      }
    };

  } catch (error) {
    console.error("Error getting invitation stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invitation stats"
    };
  }
}

// Create artist from invitation with Stack Auth
export async function createArtistFromInvitation(data: {
  invitationCode: string;
  bio: string;
  specialty: string;
  exhibitions?: string;
  profileImage?: string | null;
}): Promise<ApiResponse<{ artistId: number; userId: string }>> {
  try {
    console.log("=== CREATE ARTIST FROM INVITATION ===");
    console.log("Invitation code:", data.invitationCode);

    // Find and validate invitation
    const invitation = await db
      .select({
        id: artistInvitations.id,
        name: artistInvitations.name,
        email: artistInvitations.email,
        code: artistInvitations.code,
        usedAt: artistInvitations.usedAt,
        expiresAt: artistInvitations.expiresAt
      })
      .from(artistInvitations)
      .where(eq(artistInvitations.code, data.invitationCode))
      .limit(1);

    if (invitation.length === 0) {
      return {
        success: false,
        error: "Invalid invitation code"
      };
    }

    const inv = invitation[0];

    // Check if invitation has been used
    if (inv.usedAt) {
      return {
        success: false,
        error: "This invitation has already been used"
      };
    }

    // Check if invitation has expired
    const now = new Date();
    if (inv.expiresAt && new Date(inv.expiresAt) < now) {
      return {
        success: false,
        error: "This invitation has expired"
      };
    }

    // Get current user from Stack Auth
    const user = await stackServerApp.getUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to complete this setup"
      };
    }

    // Verify email matches invitation
    if (user.primaryEmail !== inv.email) {
      return {
        success: false,
        error: "Email address does not match invitation"
      };
    }

    // Generate slug from name
    const slug = inv.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Parse exhibitions if provided
    let exhibitionsArray: string[] | null = null;
    if (data.exhibitions) {
      exhibitionsArray = data.exhibitions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    // Create artist record
    const newArtist = await db.insert(artists).values({
      name: inv.name,
      slug: slug,
      bio: data.bio,
      specialty: data.specialty,
      exhibitions: exhibitionsArray,
      profileImage: data.profileImage || null,
      isVisible: true,
      isHidden: false,
      featured: false,
      // preApproved: inv.message === "Pre-approved artist" // TODO: Add when database column exists
    }).returning({ id: artists.id });

    const artistId = newArtist[0].id;

    // Mark invitation as used
    await db
      .update(artistInvitations)
      .set({ usedAt: new Date() })
      .where(eq(artistInvitations.id, inv.id));

    // Note: Stack Auth user metadata is typically set during user creation
    // The artist ID will be stored in the database and can be retrieved via serverMetadata
    // For now, we'll rely on the database relationship between artists and users

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/admin/artists");
    revalidatePath("/admin");
    revalidatePath("/artist-dashboard");

    // Trigger revalidation on main site
    try {
      await revalidationPatterns.artists();
    } catch (error) {
      console.error("Main site revalidation failed:", error);
    }

    console.log("Artist created successfully:", artistId);

    return {
      success: true,
      data: {
        artistId: artistId,
        userId: user.id
      },
      message: "Artist account created successfully"
    };

  } catch (error) {
    console.error("Error creating artist from invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create artist account"
    };
  }
}
