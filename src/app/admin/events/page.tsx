import { getAllEvents } from "@/lib/actions/admin-actions";
import EventsTable from "@/components/admin/events-table";
import EventsFilters from "@/components/admin/events-filters";
import { Card, CardContent } from "@/components/ui/card";

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <p className="text-gray-600 mt-2">
          View, edit, and manage all events in the gallery
        </p>
      </div>

      {/* Filters - Client component for form interaction only */}
      <EventsFilters />

      {/* Stats - Server-rendered */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Events</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Events</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Canceled</div>
            <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Recurring</div>
            <div className="text-2xl font-bold text-blue-600">{stats.recurring}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table - Server-rendered with server actions */}
      <EventsTable events={filteredEvents} />
    </div>
  );
}
