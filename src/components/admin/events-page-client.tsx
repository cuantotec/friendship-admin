"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";
import type { EventListItem } from "@/types";

interface EventsPageClientProps {
  events: EventListItem[];
  stats: {
    total: number;
    active: number;
    canceled: number;
    recurring: number;
  };
}

export default function EventsPageClient({ events, stats }: EventsPageClientProps) {
  const [showAddMessage, setShowAddMessage] = useState(false);

  useEffect(() => {
    // Check if we're on the add page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add') === 'true') {
      setShowAddMessage(true);
      // Remove the add parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('add');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Add Event Message */}
      {showAddMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Event Creation</h3>
              <p className="text-sm text-blue-700">
                Event creation functionality is coming soon. For now, you can manage existing events by clicking the edit button on any event card.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddMessage(false)}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all events in the gallery
          </p>
        </div>
        
        <Button
          onClick={() => window.location.href = '/admin/events?add=true'}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Total Events</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Active</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Canceled</div>
          <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.canceled}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Recurring</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.recurring}</div>
        </div>
      </div>

      {/* Upcoming Events - Mobile Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
        <div className="space-y-3">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    {event.isRecurring && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Recurring</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.isCanceled 
                      ? 'bg-red-100 text-red-800' 
                      : new Date(event.endDate || event.startDate) >= new Date()
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.isCanceled ? 'Canceled' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events will be rendered by the server component */}
    </div>
  );
}
