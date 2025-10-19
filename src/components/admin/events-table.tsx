import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { formatEventDateTime } from "@/lib/dateUtils";
import EventActions from "./event-actions";
import type { EventListItem } from "@/types";

interface EventsTableProps {
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


export default function EventsTable({ events }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No events found
          </h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => {
                const status = getEventStatus(event);
                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {event.featuredImage && (
                          <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden mr-4 relative">
                            <Image
                              src={event.featuredImage}
                              alt={event.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {event.description}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {event.registrationEnabled && (
                              <Badge variant="outline" className="text-xs">
                                Registration
                              </Badge>
                            )}
                            {event.paymentEnabled && (
                              <Badge variant="outline" className="text-xs">
                                Paid
                              </Badge>
                            )}
                            {event.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">{event.eventType}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatEventDateTime(event)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        {event.location ? (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          status === "Canceled"
                            ? "destructive"
                            : status === "Ongoing"
                            ? "default"
                            : status === "Upcoming"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EventActions
                        eventId={event.id}
                        eventTitle={event.title}
                        isCanceled={event.isCanceled}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

