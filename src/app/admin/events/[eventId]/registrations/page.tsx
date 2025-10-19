import { getAllEvents } from "@/lib/actions/admin-actions";
import { getEventRegistrations, getEventRegistrationStats } from "@/lib/actions/event-registration-actions";
import { notFound } from "next/navigation";
import EventRegistrationsPage from "@/components/admin/event-registrations-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    eventId: string;
  };
}

export default async function EventRegistrationsPageRoute({
  params,
}: PageProps) {
  const eventId = parseInt(params.eventId);
  
  if (isNaN(eventId)) {
    notFound();
  }

  // Get all events to find the specific event
  const allEvents = await getAllEvents();
  const event = allEvents.find(e => e.id === eventId);

  if (!event) {
    notFound();
  }

  // Get actual registration data
  const registrations = await getEventRegistrations(eventId);
  const stats = await getEventRegistrationStats(eventId);

  return (
    <EventRegistrationsPage 
      event={event} 
      registrations={registrations}
      stats={stats}
    />
  );
}
