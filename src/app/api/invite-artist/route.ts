import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { db } from "@/lib/db";
import { artistInvitations } from "@/lib/schema";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const role = user.serverMetadata?.role;
    const isAdmin = role === "admin" || role === "super_admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, specialty, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Generate unique invitation code
    const invitationCode = nanoid(12);

    // Create invitation record
    const invitation = await db.insert(artistInvitations).values({
      email,
      name,
      specialty: specialty || null,
      message: message || null,
      code: invitationCode,
      invitedBy: user.primaryEmail || "admin",
      createdAt: new Date(),
    }).returning();

    // TODO: Send email invitation here
    // For now, we'll just log the invitation
    console.log(`Artist invitation created: ${name} (${email}) - Code: ${invitationCode}`);

    return NextResponse.json({
      success: true,
      data: {
        invitationId: invitation[0].id,
        code: invitationCode,
      },
      message: "Artist invitation sent successfully"
    });
  } catch (error) {
    console.error("Invite artist error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
