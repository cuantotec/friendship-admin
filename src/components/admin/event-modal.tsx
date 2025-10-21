"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import BaseModal from "@/components/ui/base-modal";
import FormField from "@/components/ui/form-field";
import ImageUpload from "@/components/ui/image-upload";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent, updateEvent } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import type { EventListItem } from "@/types";

interface EventModalProps {
  event?: EventListItem | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

// Helper function to extract time from ISO string
function extractTimeFromISO(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5);
  } catch {
    return "00:00";
  }
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EventModal({ event, isOpen, onClose, mode }: EventModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Exhibition",
    slug: "",
    status: "Upcoming",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "The Friendship Center Gallery",
    address: "",
    featuredImage: "",
    registrationEnabled: false,
    registrationType: "internal",
    paymentEnabled: false,
    isFreeEvent: true,
    chabadPay: false,
    isRecurring: false,
    recurringType: "",
    recurringStartTime: "",
    recurringStartAmpm: "AM",
    recurringEndTime: "",
    recurringEndAmpm: "PM",
    parentEventId: "",
    isRecurringInstance: false,
    paymentTiers: ""
  });

  // Initialize form data when event changes
  useEffect(() => {
    if (mode === "edit" && event) {
      setFormData({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        slug: event.slug,
        status: event.status || "Upcoming",
        startDate: event.startDate.split('T')[0],
        startTime: extractTimeFromISO(event.startDate),
        endDate: event.endDate ? event.endDate.split('T')[0] : "",
        endTime: event.endDate ? extractTimeFromISO(event.endDate) : "",
        location: event.location || "The Friendship Center Gallery",
        address: event.address || "",
        featuredImage: event.featuredImage || "",
        registrationEnabled: event.registrationEnabled,
        registrationType: event.registrationType,
        paymentEnabled: event.paymentEnabled,
        isFreeEvent: event.isFreeEvent,
        chabadPay: event.chabadPay || false,
        isRecurring: event.isRecurring,
        recurringType: event.recurringType || "",
        recurringStartTime: event.recurringStartTime || "",
        recurringStartAmpm: event.recurringStartAmpm || "AM",
        recurringEndTime: event.recurringEndTime || "",
        recurringEndAmpm: event.recurringEndAmpm || "PM",
        parentEventId: event.parentEventId?.toString() || "",
        isRecurringInstance: event.isRecurringInstance || false,
        paymentTiers: event.paymentTiers ? JSON.stringify(event.paymentTiers, null, 2) : ""
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        eventType: "Exhibition",
        slug: "",
        status: "Upcoming",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "The Friendship Center Gallery",
        address: "",
        featuredImage: "",
        registrationEnabled: false,
        registrationType: "internal",
        paymentEnabled: false,
        isFreeEvent: true,
        chabadPay: false,
        isRecurring: false,
        recurringType: "",
        recurringStartTime: "",
        recurringStartAmpm: "AM",
        recurringEndTime: "",
        recurringEndAmpm: "PM",
        parentEventId: "",
        isRecurringInstance: false,
        paymentTiers: ""
      });
    }
  }, [event, mode]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === "title" && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(String(value))
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const eventData = {
          title: formData.title,
          description: formData.description,
          eventType: formData.eventType,
          slug: formData.slug,
          startDate: `${formData.startDate}T${formData.startTime}:00`,
          endDate: formData.endDate ? `${formData.endDate}T${formData.endTime}:00` : null,
          location: formData.location,
          address: formData.address,
          featuredImage: formData.featuredImage,
          registrationEnabled: formData.registrationEnabled,
          registrationType: formData.registrationType,
          paymentEnabled: formData.paymentEnabled,
          isFreeEvent: formData.isFreeEvent,
          chabadPay: formData.chabadPay,
          isRecurring: formData.isRecurring,
          recurringType: formData.recurringType,
          recurringStartTime: formData.recurringStartTime,
          recurringStartAmpm: formData.recurringStartAmpm,
          recurringEndTime: formData.recurringEndTime,
          recurringEndAmpm: formData.recurringEndAmpm,
          parentEventId: formData.parentEventId ? parseInt(formData.parentEventId) : null,
          isRecurringInstance: formData.isRecurringInstance,
          paymentTiers: formData.paymentTiers ? JSON.parse(formData.paymentTiers) as Record<string, unknown> : null,
          status: formData.status,
          isCanceled: formData.status === "Canceled"
        };

        let result;
        if (mode === "create") {
          result = await createEvent(eventData);
        } else {
          result = await updateEvent(event!.id, eventData);
        }

        if (result.success) {
          toast.success(
            mode === "create" ? "Event created successfully" : "Event updated successfully"
          );
          router.refresh();
          onClose();
        } else {
          toast.error(result.error || "Failed to save event");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Error saving event:", error);
      }
    });
  };

  const eventTypeOptions = [
    { value: "Exhibition", label: "Exhibition" },
    { value: "Opening", label: "Opening" },
    { value: "Workshop", label: "Workshop" },
    { value: "Lecture", label: "Lecture" },
    { value: "Performance", label: "Performance" },
    { value: "Other", label: "Other" }
  ];

  const statusOptions = [
    { value: "Upcoming", label: "Upcoming" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Completed", label: "Completed" },
    { value: "Canceled", label: "Canceled" }
  ];

  const registrationTypeOptions = [
    { value: "internal", label: "Internal" },
    { value: "external", label: "External" }
  ];


  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create New Event" : "Edit Event"}
      size="2xl"
      isLoading={isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="input"
                label="Event Title"
                id="title"
                value={formData.title}
                onChange={(value) => handleInputChange("title", value)}
                placeholder="Enter event title"
                required
              />
              <FormField
                type="input"
                label="URL Slug"
                id="slug"
                value={formData.slug}
                onChange={(value) => handleInputChange("slug", value)}
                placeholder="event-url-slug"
              />
            </div>

            <FormField
              type="textarea"
              label="Description"
              id="description"
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Enter event description"
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="select"
                label="Event Type"
                id="eventType"
                value={formData.eventType}
                onChange={(value) => handleInputChange("eventType", value)}
                options={eventTypeOptions}
              />
              <FormField
                type="select"
                label="Status"
                id="status"
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                options={statusOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Date and Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="input"
                label="Start Date"
                id="startDate"
                value={formData.startDate}
                onChange={(value) => handleInputChange("startDate", value)}
                required
              />
              <FormField
                type="input"
                label="Start Time"
                id="startTime"
                value={formData.startTime}
                onChange={(value) => handleInputChange("startTime", value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="input"
                label="End Date"
                id="endDate"
                value={formData.endDate}
                onChange={(value) => handleInputChange("endDate", value)}
              />
              <FormField
                type="input"
                label="End Time"
                id="endTime"
                value={formData.endTime}
                onChange={(value) => handleInputChange("endTime", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              type="input"
              label="Location"
              id="location"
              value={formData.location}
              onChange={(value) => handleInputChange("location", value)}
              placeholder="Event location"
            />
            <FormField
              type="textarea"
              label="Address"
              id="address"
              value={formData.address}
              onChange={(value) => handleInputChange("address", value)}
              placeholder="Full address"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={formData.featuredImage}
              onChange={(url) => handleInputChange("featuredImage", url)}
              placeholder="Upload event image"
            />
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="switch"
                label="Enable Registration"
                id="registrationEnabled"
                checked={formData.registrationEnabled}
                onChange={(checked) => handleInputChange("registrationEnabled", checked)}
              />
              <FormField
                type="select"
                label="Registration Type"
                id="registrationType"
                value={formData.registrationType}
                onChange={(value) => handleInputChange("registrationType", value)}
                options={registrationTypeOptions}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="switch"
                label="Enable Payment"
                id="paymentEnabled"
                checked={formData.paymentEnabled}
                onChange={(checked) => handleInputChange("paymentEnabled", checked)}
              />
              <FormField
                type="switch"
                label="Free Event"
                id="isFreeEvent"
                checked={formData.isFreeEvent}
                onChange={(checked) => handleInputChange("isFreeEvent", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <ActionButton
            onClick={onClose}
            variant="outline"
            disabled={isPending}
          >
            Cancel
          </ActionButton>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
              </div>
            ) : (
              mode === "create" ? "Create Event" : "Update Event"
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
