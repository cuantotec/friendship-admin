import { getAllEvents } from "@/lib/actions/admin-actions";
import EventsTable from "@/components/admin/events-table";
import EventsFilters from "@/components/admin/events-filters";
import EventsPageClient from "@/components/admin/events-page-client";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const allEvents = await getAllEvents();

  // Server-side filtering
  const filteredEvents = allEvents.filter((event) => {
    if (!searchParams.search) return true;
    
    const searchLower = searchParams.search.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats on server
  const activeEvents = allEvents.filter(
    (event) =>
      !event.isCanceled &&
      (new Date(event.endDate || event.startDate) >= new Date() ||
        !event.endDate)
  ).length;

  const stats = {
    total: allEvents.length,
    active: activeEvents,
    canceled: allEvents.filter((e) => e.isCanceled).length,
    recurring: allEvents.filter((e) => e.isRecurring).length,
  };

  return (
    <div className="space-y-6">
      {/* Client component for interactive features */}
      <EventsPageClient events={filteredEvents} stats={stats} />

      {/* Filters - Client component for form interaction only */}
      <EventsFilters />

      {/* Table - Server-rendered with server actions */}
      <EventsTable events={filteredEvents} />
    </div>
  );
}
