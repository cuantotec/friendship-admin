"use server";

import { db } from "@/lib/db";
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

// Generic create function - ADMIN ONLY
export async function createRecord<T extends Record<string, unknown>>(
  table: { id: { name: string } },
  data: Partial<T>,
  revalidatePaths: string[] = []
): Promise<ApiResponse<{ id: number }>> {
  // SECURITY: Require admin authentication
  await requireAdmin();
  
  try {
    const result = await db
      .insert(table as never)
      .values(data)
      .returning({ id: table.id as never });

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to create record"
      };
    }

    // Revalidate specified paths
    revalidatePaths.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: { id: result[0].id as number },
      message: "Record created successfully"
    };
  } catch (error) {
    console.error("Error creating record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create record"
    };
  }
}

// Generic update function - ADMIN ONLY
export async function updateRecord<T extends Record<string, unknown>>(
  table: { id: { name: string } },
  id: number,
  data: Partial<T>,
  revalidatePaths: string[] = []
): Promise<ApiResponse<{ updated: boolean }>> {
  // SECURITY: Require admin authentication
  await requireAdmin();
  
  try {
    const result = await db
      .update(table as never)
      .set(data)
      .where(eq(table.id as never, id))
      .returning({ id: table.id as never });

    if (result.length === 0) {
      return {
        success: false,
        error: "Record not found"
      };
    }

    // Revalidate specified paths
    revalidatePaths.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: { updated: true },
      message: "Record updated successfully"
    };
  } catch (error) {
    console.error("Error updating record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update record"
    };
  }
}

// Generic delete function - ADMIN ONLY
export async function deleteRecord(
  table: { id: { name: string } },
  id: number,
  revalidatePaths: string[] = []
): Promise<ApiResponse<{ deleted: boolean }>> {
  // SECURITY: Require admin authentication
  await requireAdmin();
  
  try {
    const result = await db
      .delete(table as never)
      .where(eq(table.id as never, id))
      .returning({ id: table.id as never });

    if (result.length === 0) {
      return {
        success: false,
        error: "Record not found"
      };
    }

    // Revalidate specified paths
    revalidatePaths.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: { deleted: true },
      message: "Record deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete record"
    };
  }
}

// Generic toggle function for boolean fields - ADMIN ONLY
export async function toggleRecordField<T extends Record<string, unknown>>(
  table: { id: { name: string } },
  id: number,
  field: keyof T,
  revalidatePaths: string[] = []
): Promise<ApiResponse<{ updated: boolean }>> {
  // SECURITY: Require admin authentication
  await requireAdmin();
  
  try {
    // First get the current value
    const currentRecord = await db
      .select({ [field]: (table as never)[field] })
      .from(table as never)
      .where(eq(table.id as never, id))
      .limit(1);

    if (currentRecord.length === 0) {
      return {
        success: false,
        error: "Record not found"
      };
    }

    const currentValue = currentRecord[0][field as keyof typeof currentRecord[0]];
    const newValue = !currentValue;

    const result = await db
      .update(table as never)
      .set({ [field]: newValue } as Record<string, unknown>)
      .where(eq(table.id as never, id))
      .returning({ id: table.id as never });

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to update record"
      };
    }

    // Revalidate specified paths
    revalidatePaths.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: { updated: true },
      message: "Record updated successfully"
    };
  } catch (error) {
    console.error("Error toggling record field:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update record"
    };
  }
}