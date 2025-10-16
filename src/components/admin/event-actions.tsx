"use client";

import { Button } from "@/components/ui/button";
import { XCircle, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  toggleEventCancellation,
  deleteEventAdmin,
} from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface EventActionsProps {
  eventId: number;
  eventTitle: string;
  isCanceled: boolean;
}

export default function EventActions({
  eventId,
  eventTitle,
  isCanceled,
}: EventActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleCancellation = () => {
    startTransition(async () => {
      const result = await toggleEventCancellation(eventId);
      if (result.success) {
        toast.success("Event status updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update event status");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete event "${eventTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEventAdmin(eventId);
      if (result.success) {
        toast.success("Event deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete event");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleCancellation}
        disabled={isPending}
        title={isCanceled ? "Uncancel event" : "Cancel event"}
      >
        {isCanceled ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-orange-600" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

