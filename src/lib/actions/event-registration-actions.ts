"use server";

import { db } from "@/lib/db";
import { eventRegistrations } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdminAccess } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";
import type { EventRegistration } from "@/types";

// Get all registrations for an event
export async function getEventRegistrations(
  eventId: number
): Promise<EventRegistration[]> {
  await requireAdminAccess();

  try {
    const result = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.createdAt));

    return result.map(registration => ({
      ...registration,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
    })) as EventRegistration[];
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    throw new Error("Failed to fetch event registrations");
  }
}

// Create a new event registration
export async function createEventRegistration(
  eventId: number,
  registrationData: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    numberOfAttendees: number;
    additionalInformation?: string;
  }
): Promise<ApiResponse<EventRegistration>> {
  try {
    const result = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        fullName: registrationData.fullName,
        email: registrationData.email,
        phoneNumber: registrationData.phoneNumber || null,
        numberOfAttendees: registrationData.numberOfAttendees,
        additionalInformation: registrationData.additionalInformation || null,
        registrationData: {
          eventTitle: "AI For Life And Business Workshop", // Default event title
          registrationFields: {
            fullName: registrationData.fullName,
            email: registrationData.email,
            phoneNumber: registrationData.phoneNumber,
            numberOfAttendees: registrationData.numberOfAttendees,
            additionalInformation: registrationData.additionalInformation,
          }
        },
      })
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to create registration"
      };
    }

    const registration = result[0];
    return {
      success: true,
      data: {
        ...registration,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      } as EventRegistration,
      message: "Registration created successfully"
    };
  } catch (error) {
    console.error("Error creating event registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create registration"
    };
  }
}

// Update an event registration
export async function updateEventRegistration(
  registrationId: number,
  updates: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    numberOfAttendees?: number;
    additionalInformation?: string;
  }
): Promise<ApiResponse<EventRegistration>> {
  await requireAdminAccess();

  try {
    const result = await db
      .update(eventRegistrations)
      .set({
        fullName: updates.fullName,
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        numberOfAttendees: updates.numberOfAttendees,
        additionalInformation: updates.additionalInformation,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(eventRegistrations.id, registrationId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Registration not found"
      };
    }

    const registration = result[0];
    return {
      success: true,
      data: {
        ...registration,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      } as EventRegistration,
      message: "Registration updated successfully"
    };
  } catch (error) {
    console.error("Error updating event registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update registration"
    };
  }
}

// Delete an event registration
export async function deleteEventRegistration(
  registrationId: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  await requireAdminAccess();

  try {
    const result = await db
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Registration not found"
      };
    }

    return {
      success: true,
      data: { deleted: true },
      message: "Registration deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting event registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete registration"
    };
  }
}

// Get registration statistics for an event
export async function getEventRegistrationStats(
  eventId: number
): Promise<{
  total: number;
  totalAttendees: number;
  recentRegistrations: number;
}> {
  await requireAdminAccess();

  try {
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    const total = registrations.length;
    const totalAttendees = registrations.reduce((sum, reg) => sum + reg.numberOfAttendees, 0);
    
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = registrations.filter(reg => 
      new Date(reg.createdAt) > sevenDaysAgo
    ).length;

    return {
      total,
      totalAttendees,
      recentRegistrations,
    };
  } catch (error) {
    console.error("Error fetching registration stats:", error);
    throw new Error("Failed to fetch registration statistics");
  }
}
