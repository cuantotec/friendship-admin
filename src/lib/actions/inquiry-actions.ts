"use server";

import { db } from "@/lib/db";
import { inquiries, artworks } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdminAccess } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";

export interface InquiryListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  artworkId: number;
  artworkTitle: string | null;
  createdAt: string;
}

// Get all inquiries for admin
export async function getAllInquiries(): Promise<InquiryListItem[]> {
  await requireAdminAccess();

  try {
    const result = await db
      .select({
        id: inquiries.id,
        name: inquiries.name,
        email: inquiries.email,
        phone: inquiries.phone,
        message: inquiries.message,
        artworkId: inquiries.artworkId,
        artworkTitle: artworks.title,
        createdAt: inquiries.createdAt,
      })
      .from(inquiries)
      .leftJoin(artworks, eq(inquiries.artworkId, artworks.id))
      .orderBy(desc(inquiries.createdAt));

    return result.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString()
    })) as InquiryListItem[];
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    throw new Error("Failed to fetch inquiries");
  }
}

// Delete an inquiry
export async function deleteInquiry(inquiryId: number): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdminAccess();

  try {
    const result = await db
      .delete(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Inquiry not found"
      };
    }

    return {
      success: true,
      data: { deleted: true },
      message: "Inquiry deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete inquiry"
    };
  }
}

// Get inquiry statistics
export async function getInquiryStats(): Promise<{
  total: number;
  recent: number;
  thisWeek: number;
  thisMonth: number;
}> {
  await requireAdminAccess();

  try {
    const allInquiries = await getAllInquiries();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent = allInquiries.filter(inquiry => {
      const inquiryDate = new Date(inquiry.createdAt);
      return inquiryDate >= oneWeekAgo;
    }).length;

    const thisWeek = allInquiries.filter(inquiry => {
      const inquiryDate = new Date(inquiry.createdAt);
      return inquiryDate >= oneWeekAgo;
    }).length;

    const thisMonth = allInquiries.filter(inquiry => {
      const inquiryDate = new Date(inquiry.createdAt);
      return inquiryDate >= oneMonthAgo;
    }).length;

    return {
      total: allInquiries.length,
      recent,
      thisWeek,
      thisMonth
    };
  } catch (error) {
    console.error("Error fetching inquiry stats:", error);
    return {
      total: 0,
      recent: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }
}
