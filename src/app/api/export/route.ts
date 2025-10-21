import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { db } from "@/lib/db";
import { events, artworks, artists, inquiries, eventRegistrations } from "@/lib/schema";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const format = searchParams.get("format");

    if (!type) {
      return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
    }

    // Only support Excel format
    if (format && format !== "excel") {
      return NextResponse.json({ error: "Only Excel format is supported" }, { status: 400 });
    }

    let data: Record<string, unknown>[] = [];
    let filename = "";

    // Fetch data based on type
    switch (type) {
      case "events":
        data = await db.select().from(events);
        filename = "events";
        break;
      case "artworks":
        data = await db.select().from(artworks);
        filename = "artworks";
        break;
      case "artists":
        data = await db.select().from(artists);
        filename = "artists";
        break;
      case "inquiries":
        data = await db.select().from(inquiries);
        filename = "inquiries";
        break;
      case "event-registrations":
        data = await db.select().from(eventRegistrations);
        filename = "event-registrations";
        break;
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    // Generate Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
