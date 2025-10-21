"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/data-table";
import StatsCard from "@/components/ui/stats-card";
import ActionButton from "@/components/ui/action-button";
import EventModal from "./event-modal";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Users,
  Edit,
  Trash2,
  XCircle,
  Plus
} from "lucide-react";
import { updateEventStatus, deleteEventAdmin } from "@/lib/actions/secure-admin-actions";
import { formatEventDateTime } from "@/lib/dateUtils";
import { toast } from "sonner";
import type { EventListItem } from "@/types";

interface SimplifiedEventsPageProps {
  events: EventListItem[];
  stats: {
    total: number;
    upcoming: number;
    ongoing: number;
    past: number;
  };
}

export default function SimplifiedEventsPage({ events, stats }: SimplifiedEventsPageProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: EventListItem) => {
    setEditingEvent(event);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCancelEvent = (event: EventListItem) => {
    if (!confirm(`Are you sure you want to cancel "${event.title}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await updateEventStatus(event.id, "Canceled", true);

      if (result.success) {
        toast.success("Event canceled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel event");
      }
    });
  };

  const handleDelete = (event: EventListItem) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEventAdmin(event.id);
      
      if (result.success) {
        toast.success("Event deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete event");
      }
    });
  };

  const handleRowAction = (action: string, event: EventListItem) => {
    switch (action) {
      case "edit":
        handleEditEvent(event);
        break;
      case "cancel":
        handleCancelEvent(event);
        break;
      case "delete":
        handleDelete(event);
        break;
      case "view-registrations":
        router.push(`/admin/events/${event.id}/registrations`);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "bg-blue-100 text-blue-800";
      case "Ongoing": return "bg-green-100 text-green-800";
      case "Past": return "bg-gray-100 text-gray-800";
      case "Canceled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "title" as keyof EventListItem,
      label: "Event",
      render: (value: string | number | boolean | null | undefined, event: EventListItem) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-sm text-gray-500">{event.eventType}</div>
        </div>
      )
    },
    {
      key: "startDate" as keyof EventListItem,
      label: "Date & Time",
      render: (value: string | number | boolean | null | undefined, event: EventListItem) => (
        <div className="text-sm">
          <div className="font-medium">{formatEventDateTime(event)}</div>
          {event.location && (
            <div className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </div>
          )}
        </div>
      )
    },
    {
      key: "status" as keyof EventListItem,
      label: "Status",
      render: (value: string | number | boolean | null | undefined) => (
        <Badge className={getStatusColor((value as string) || "")}>
          {value as string}
        </Badge>
      )
    },
    {
      key: "registrationEnabled" as keyof EventListItem,
      label: "Registration",
      render: (value: string | number | boolean | null | undefined, event: EventListItem) => (
        <div className="text-sm">
          {value ? (
            <Badge variant="outline">Enabled</Badge>
          ) : (
            <Badge variant="secondary">Disabled</Badge>
          )}
        </div>
      )
    }
  ];

  const rowActions = [
    {
      label: "View Registrations",
      action: "view-registrations",
      icon: Users
    },
    {
      label: "Edit",
      action: "edit",
      icon: Edit
    },
    {
      label: "Cancel Event",
      action: "cancel",
      icon: XCircle,
      variant: "destructive" as const
    },
    {
      label: "Delete",
      action: "delete",
      icon: Trash2,
      variant: "destructive" as const
    }
  ];

  const statsCards = [
    {
      title: "Total Events",
      value: stats.total,
      icon: Calendar,
      color: "default" as const
    },
    {
      title: "Upcoming",
      value: stats.upcoming,
      icon: Calendar,
      color: "blue" as const
    },
    {
      title: "Ongoing",
      value: stats.ongoing,
      icon: Calendar,
      color: "green" as const
    },
    {
      title: "Past",
      value: stats.past,
      icon: Calendar,
      color: "purple" as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all events
          </p>
        </div>
        <ActionButton
          onClick={handleCreateEvent}
          icon={Plus}
        >
          Create Event
        </ActionButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Events Table */}
      <DataTable
        data={events}
        columns={columns}
        title="All Events"
        searchable
        exportable
        onExport={async () => {
          try {
            const response = await fetch('/api/export?type=events&format=excel');
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "events.xlsx";
            a.click();
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
          }
        }}
        onRowAction={handleRowAction}
        rowActions={rowActions}
        emptyMessage="No events found"
      />

      {/* Event Modal */}
      <EventModal
        event={editingEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />
    </div>
  );
}
