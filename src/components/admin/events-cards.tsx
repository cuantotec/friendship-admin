"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  MapPin, 
  MoreVertical, 
  Edit, 
  Users,
  Clock,
  DollarSign,
  RotateCcw,
  XCircle
} from "lucide-react";
import { formatEventDateTime } from "@/lib/dateUtils";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import EventEditModal from "@/components/admin/event-edit-modal";
import { updateEvent } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import type { EventListItem } from "@/types";

interface EventsCardsProps {
  events: EventListItem[];
}

function getEventStatus(event: EventListItem): string {
  if (event.isCanceled) return "Canceled";
  const now = new Date();
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : start;

  if (now < start) return "Upcoming";
  if (now > end) return "Past";
  return "Ongoing";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Canceled":
      return "bg-red-100 text-red-800 border-red-200";
    case "Ongoing":
      return "bg-green-100 text-green-800 border-green-200";
    case "Upcoming":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Past":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}


export default function EventsCards({ events }: EventsCardsProps) {
  const router = useRouter();
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancelEvent = (event: EventListItem) => {
    if (!confirm(`Are you sure you want to cancel "${event.title}"? This will hide the event from the frontend.`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateEvent(event.id, {
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          slug: event.slug,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          address: event.address,
          featuredImage: event.featuredImage,
          registrationEnabled: event.registrationEnabled,
          registrationType: event.registrationType,
          paymentEnabled: event.paymentEnabled,
          isFreeEvent: event.isFreeEvent,
          chabadPay: event.chabadPay,
          isRecurring: event.isRecurring,
          recurringType: event.recurringType,
          recurringStartTime: event.recurringStartTime,
          recurringStartAmpm: event.recurringStartAmpm,
          recurringEndTime: event.recurringEndTime,
          recurringEndAmpm: event.recurringEndAmpm,
          parentEventId: event.parentEventId,
          isRecurringInstance: event.isRecurringInstance,
          paymentTiers: event.paymentTiers,
          status: 'Canceled', // Set status to Canceled
          isCanceled: true // Also set isCanceled flag
        });

        if (result.success) {
          toast.success("Event canceled successfully", {
            description: "The event has been hidden from the frontend."
          });
          router.refresh();
        } else {
          toast.error("Failed to cancel event", {
            description: result.error || "An error occurred while canceling the event."
          });
        }
      } catch (error) {
        toast.error("Failed to cancel event", {
          description: error instanceof Error ? error.message : "An unexpected error occurred."
        });
      }
    });
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No events found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or create a new event
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const status = getEventStatus(event);
        const statusColor = getStatusColor(status);
        
        return (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Event Image */}
                <div className="flex-shrink-0">
                  {event.featuredImage ? (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                      <Image
                        src={event.featuredImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <Badge className={`ml-2 ${statusColor}`}>
                      {status}
                    </Badge>
                  </div>

                  {/* Event Info */}
                  <div className="mt-3 space-y-2">
                    {/* Date & Time */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {formatEventDateTime(event)}
                      </span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {/* Event Type & Features */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.eventType}
                      </Badge>
                      
                      {event.registrationEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Registration
                        </Badge>
                      )}
                      
                      {event.paymentEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      )}
                      
                      {event.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => setEditingEvent(event)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/admin/events/${event.id}/registrations`)}
                        className="cursor-pointer"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Registrations
                      </DropdownMenuItem>
                      {event.status !== 'Canceled' && (
                        <DropdownMenuItem 
                          onClick={() => handleCancelEvent(event)}
                          className="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          disabled={isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Event
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Modals */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}
