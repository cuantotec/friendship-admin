"use server";

import { db } from "@/lib/db";
import { artistInvitations } from "@/lib/schema";
import { stackServerApp } from "@/stack/server";
import { sendArtistInvitation } from "@/lib/emailer";
import { generateConfirmationNumber } from "@/lib/emailer/helpers";
import type { ApiResponse } from "@/types";
import { z } from "zod";
import { eq, and, isNull, desc, count, sql } from "drizzle-orm";

// Validation schema for artist invitation
const artistInvitationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  specialty: z.string().optional(),
  message: z.string().optional(),
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
      specialty: formData.get("specialty") as string,
      message: formData.get("message") as string,
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

    // Store invitation in database
    await db.insert(artistInvitations).values({
      email: validatedData.email,
      name: validatedData.name,
      specialty: validatedData.specialty || null,
      message: validatedData.message || null,
      code: invitationCode,
      invitedBy: adminName,
    });

    // Send invitation email
    const setupUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/handler/setup?code=${invitationCode}`;
    
    const emailResult = await sendArtistInvitation({
      artistName: validatedData.name,
      artistEmail: validatedData.email,
      invitationCode,
      adminName,
      setupUrl
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
