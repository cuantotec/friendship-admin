import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, MapPin, RotateCcw } from "lucide-react";
import type { EventListItem } from "@/types";

interface EventsPageHeaderProps {
  events: EventListItem[];
  stats: {
    total: number;
    active: number;
    canceled: number;
    recurring: number;
  };
}

export default function EventsPageHeader({ events, stats }: EventsPageHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all events in the gallery
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Add New Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Canceled</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.canceled}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Recurring</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.recurring}</p>
        </div>
      </div>

      {/* Events Count */}
      <div className="text-sm text-gray-600">
        Showing {events.length} event{events.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
