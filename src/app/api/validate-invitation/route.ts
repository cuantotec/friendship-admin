import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artistInvitations } from "@/lib/schema";
import { eq, and, isNull, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({
        success: false,
        error: "No invitation code provided"
      }, { status: 400 });
    }

    // Find the invitation
    const invitation = await db
      .select({
        id: artistInvitations.id,
        name: artistInvitations.name,
        email: artistInvitations.email,
        code: artistInvitations.code,
        usedAt: artistInvitations.usedAt,
        expiresAt: artistInvitations.expiresAt,
        createdAt: artistInvitations.createdAt
      })
      .from(artistInvitations)
      .where(eq(artistInvitations.code, code))
      .limit(1);

    if (invitation.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid invitation code"
      }, { status: 404 });
    }

    const inv = invitation[0];

    // Check if invitation has been used
    if (inv.usedAt) {
      return NextResponse.json({
        success: false,
        error: "This invitation has already been used"
      }, { status: 400 });
    }

    // Check if invitation has expired
    const now = new Date();
    if (inv.expiresAt && new Date(inv.expiresAt) < now) {
      return NextResponse.json({
        success: false,
        error: "This invitation has expired"
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: inv.name,
        email: inv.email,
        code: inv.code,
        createdAt: inv.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
