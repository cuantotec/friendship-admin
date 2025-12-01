"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Separator removed as it's not used
import { toast } from "sonner";
import { updateEvent } from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Trash2,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import type { EventListItem } from "@/types";

interface EventEditModalProps {
  event: EventListItem;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to extract time from ISO string
function extractTimeFromISO(isoString: string): string {
  try {
    // Parse the ISO string and convert to EST
    const date = new Date(isoString);
    
    // Use Intl.DateTimeFormat to get the Eastern time components
    const easternFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = easternFormatter.formatToParts(date);
    const hours = parts.find(part => part.type === 'hour')?.value || '00';
    const minutes = parts.find(part => part.type === 'minute')?.value || '00';
    
    return `${hours}:${minutes}`;
  } catch {
    return '12:00';
  }
}

// Helper function to format time for HTML input
function formatTimeForInput(time: string): string {
  if (!time || time === '12:00') return '12:00';
  return time.substring(0, 5);
}

export default function EventEditModal({
  event,
  isOpen,
  onClose
}: EventEditModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    // Basic Information
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    slug: event.slug,
    status: event.status || 'Upcoming',
    
    // Dates and Times
    startDate: event.startDate.split('T')[0], // Convert to YYYY-MM-DD format
    startTime: extractTimeFromISO(event.startDate), // Extract time using helper function
    endDate: event.endDate ? event.endDate.split('T')[0] : '',
    endTime: event.endDate ? extractTimeFromISO(event.endDate) : '',
    
    // Location
    location: event.location || '',
    address: event.address || '',
    
    // Image
    featuredImage: event.featuredImage || '',
    
    // Registration Settings
    registrationEnabled: event.registrationEnabled,
    registrationType: event.registrationType,
    registrationUrl: event.registrationUrl || '',
    paymentEnabled: event.paymentEnabled,
    isFreeEvent: event.isFreeEvent,
    chabadPay: event.chabadPay || false,
    
    
    // Recurring Settings
    isRecurring: event.isRecurring,
    recurringType: event.recurringType || '',
    recurringStartTime: event.recurringStartTime || '',
    recurringStartAmpm: event.recurringStartAmpm || 'AM',
    recurringEndTime: event.recurringEndTime || '',
    recurringEndAmpm: event.recurringEndAmpm || 'PM',
    
    // Additional Fields
    parentEventId: event.parentEventId?.toString() || '',
    isRecurringInstance: event.isRecurringInstance || false,
    paymentTiers: event.paymentTiers ? JSON.stringify(event.paymentTiers, null, 2) : '',
  });

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(event.featuredImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when event prop changes
  useEffect(() => {
    if (isOpen && event) {
      setFormData({
        // Basic Information
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        slug: event.slug,
        status: event.status || 'Upcoming',
        
        // Dates and Times
        startDate: event.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        startTime: extractTimeFromISO(event.startDate), // Extract time using helper function
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        endTime: event.endDate ? extractTimeFromISO(event.endDate) : '',
        
        // Location
        location: event.location || '',
        address: event.address || '',
        
        // Image
        featuredImage: event.featuredImage || '',
        
        // Registration Settings
        registrationEnabled: event.registrationEnabled,
        registrationType: event.registrationType,
        registrationUrl: event.registrationUrl || '',
        paymentEnabled: event.paymentEnabled,
        isFreeEvent: event.isFreeEvent,
        chabadPay: event.chabadPay || false,
        
        
        // Recurring Settings
        isRecurring: event.isRecurring,
        recurringType: event.recurringType || '',
        recurringStartTime: event.recurringStartTime || '',
        recurringStartAmpm: event.recurringStartAmpm || 'AM',
        recurringEndTime: event.recurringEndTime || '',
        recurringEndAmpm: event.recurringEndAmpm || 'PM',
        
        // Additional Fields
        parentEventId: event.parentEventId?.toString() || '',
        isRecurringInstance: event.isRecurringInstance || false,
        paymentTiers: event.paymentTiers ? JSON.stringify(event.paymentTiers, null, 2) : '',
      });
      
      // Reset image preview and file when event changes
      setImagePreview(event.featuredImage);
      setImageFile(null);
    }
  }, [event, isOpen]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    // Ensure time is in HH:MM format
    const formattedTime = value.substring(0, 5);
    setFormData(prev => ({
      ...prev,
      [field]: formattedTime
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    const uploadToast = toast.loading("Uploading image...", {
      description: "Please wait while we upload your event image."
    });

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      toast.dismiss(uploadToast);
      toast.success("Image uploaded successfully!", {
        description: "Your event image has been updated.",
        icon: <CheckCircle className="h-4 w-4" />
      });

      return result.originalUrl;
    } catch (error) {
      toast.dismiss(uploadToast);
      toast.error("Failed to upload image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      featuredImage: ''
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.registrationEnabled && formData.registrationType === 'external' && !formData.registrationUrl.trim()) {
      toast.error("Registration URL is required when using external registration");
      return;
    }
    
    startTransition(async () => {
      try {
        // Combine date and time for start and end dates
        const startTime = formatTimeForInput(formData.startTime);
        const endTime = formData.endTime ? formatTimeForInput(formData.endTime) : '12:00';
        
        // Create EST/EDT datetime objects and convert to UTC ISO strings
        // Parse the date and time as Eastern Time, then convert to UTC
        const startDateStr = `${formData.startDate}T${startTime}:00`;
        const endDateStr = formData.endDate ? `${formData.endDate}T${endTime}:00` : null;
        
        // Import the unified time conversion function
        const { convertEasternToUTC } = await import('@/lib/dateUtils');
        
        const startDateTime = convertEasternToUTC(startDateStr);
        const endDateTime = endDateStr ? convertEasternToUTC(endDateStr) : null;
        
        // Parse JSON fields
        let paymentTiers = null;
        
        try {
          if (formData.paymentTiers && formData.paymentTiers.trim()) {
            paymentTiers = JSON.parse(formData.paymentTiers);
          }
        } catch {
          toast.error("Invalid JSON format for Payment Tiers");
          return;
        }

        // Upload image if a new one was selected
        let featuredImageUrl = formData.featuredImage;
        if (imageFile) {
          const uploadResult = await uploadImage();
          if (uploadResult) {
            featuredImageUrl = uploadResult;
          } else {
            toast.error("Image upload failed", {
              description: "Please try again",
              icon: <XCircle className="h-4 w-4" />
            });
            return;
          }
        }

        const result = await updateEvent(event.id, {
          title: formData.title,
          description: formData.description,
          eventType: formData.eventType,
          slug: formData.slug,
          status: formData.status,
          startDate: startDateTime,
          endDate: endDateTime,
          location: formData.location || null,
          address: formData.address || null,
          featuredImage: featuredImageUrl || null,
          registrationEnabled: formData.registrationEnabled,
          registrationType: formData.registrationType,
          registrationUrl: formData.registrationType === 'external' && formData.registrationUrl.trim() ? formData.registrationUrl.trim() : null,
          paymentEnabled: formData.paymentEnabled,
          isFreeEvent: formData.isFreeEvent,
          chabadPay: formData.chabadPay,
          isCanceled: false, // Default to not canceled
          isRecurring: formData.isRecurring,
          recurringType: formData.recurringType || null,
          recurringStartTime: formData.recurringStartTime || null,
          recurringStartAmpm: formData.recurringStartAmpm || null,
          recurringEndTime: formData.recurringEndTime || null,
          recurringEndAmpm: formData.recurringEndAmpm || null,
          parentEventId: formData.parentEventId ? parseInt(String(formData.parentEventId)) : null,
          isRecurringInstance: formData.isRecurringInstance,
          paymentTiers,
        });
        
        if (result.success) {
          toast.success("Event updated successfully");
          router.refresh();
          onClose();
        } else {
          toast.error(result.error || "Failed to update event");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Error updating event:", error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Event preview"
                        width={800}
                        height={400}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2"
                      disabled={isUploadingImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-2"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Click to upload an event image (max 5MB)
                  </p>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Event Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-1"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    className="mt-1"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType" className="text-sm font-medium text-gray-700">
                    Event Type
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => handleInputChange("eventType", value)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Exhibition">Exhibition</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Past">Past</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="mt-1"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleTimeChange("startTime", e.target.value)}
                    className="mt-1"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="mt-1"
                    disabled={isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange("endTime", e.target.value)}
                    className="mt-1"
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="mt-1"
                  disabled={isPending}
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="mt-1"
                  rows={2}
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>


          {/* Registration & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationType" className="text-sm font-medium text-gray-700">
                    Registration Type
                  </Label>
                  <Select
                    value={formData.registrationType}
                    onValueChange={(value) => handleInputChange("registrationType", value)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modal">Modal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {formData.registrationType === 'external' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="registrationUrl" className="text-sm font-medium text-gray-700">
                      Registration URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registrationUrl"
                      type="url"
                      value={formData.registrationUrl}
                      onChange={(e) => handleInputChange("registrationUrl", e.target.value)}
                      placeholder="https://example.com/register"
                      className="mt-1"
                      disabled={isPending}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the external registration link
                    </p>
                  </div>

                  {formData.registrationUrl && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 mb-1">Preview</p>
                          <p className="text-sm text-gray-600 truncate" title={formData.registrationUrl}>
                            {formData.registrationUrl}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formData.registrationUrl, '_blank', 'noopener,noreferrer')}
                          className="flex items-center gap-2 shrink-0"
                          disabled={isPending}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="registrationEnabled"
                    checked={formData.registrationEnabled}
                    onCheckedChange={(checked) => handleInputChange("registrationEnabled", checked)}
                    disabled={isPending}
                  />
                  <Label htmlFor="registrationEnabled">Registration Enabled</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="paymentEnabled"
                    checked={formData.paymentEnabled}
                    onCheckedChange={(checked) => handleInputChange("paymentEnabled", checked)}
                    disabled={isPending}
                  />
                  <Label htmlFor="paymentEnabled">Payment Enabled</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFreeEvent"
                    checked={formData.isFreeEvent}
                    onCheckedChange={(checked) => handleInputChange("isFreeEvent", checked)}
                    disabled={isPending}
                  />
                  <Label htmlFor="isFreeEvent">Free Event</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="chabadPay"
                    checked={formData.chabadPay}
                    onCheckedChange={(checked) => handleInputChange("chabadPay", checked)}
                    disabled={isPending}
                  />
                  <Label htmlFor="chabadPay">Chabad Pay</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentTiers" className="text-sm font-medium text-gray-700">
                  Payment Tiers (JSON)
                </Label>
                <Textarea
                  id="paymentTiers"
                  value={formData.paymentTiers}
                  onChange={(e) => handleInputChange("paymentTiers", e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder='[{"name": "General", "price": 25}, {"name": "VIP", "price": 50}]'
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recurring Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recurring Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                  disabled={isPending}
                />
                <Label htmlFor="isRecurring">Recurring Event</Label>
              </div>

              {formData.isRecurring && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringType" className="text-sm font-medium text-gray-700">
                        Recurring Type
                      </Label>
                      <Select
                        value={formData.recurringType}
                        onValueChange={(value) => handleInputChange("recurringType", value)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="parentEventId" className="text-sm font-medium text-gray-700">
                        Parent Event ID
                      </Label>
                      <Input
                        id="parentEventId"
                        type="number"
                        value={formData.parentEventId}
                        onChange={(e) => handleInputChange("parentEventId", e.target.value)}
                        className="mt-1"
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringStartTime" className="text-sm font-medium text-gray-700">
                        Start Time
                      </Label>
                      <Input
                        id="recurringStartTime"
                        value={formData.recurringStartTime}
                        onChange={(e) => handleInputChange("recurringStartTime", e.target.value)}
                        className="mt-1"
                        placeholder="12:00"
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <Label htmlFor="recurringStartAmpm" className="text-sm font-medium text-gray-700">
                        Start AM/PM
                      </Label>
                      <Select
                        value={formData.recurringStartAmpm}
                        onValueChange={(value) => handleInputChange("recurringStartAmpm", value)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringEndTime" className="text-sm font-medium text-gray-700">
                        End Time
                      </Label>
                      <Input
                        id="recurringEndTime"
                        value={formData.recurringEndTime}
                        onChange={(e) => handleInputChange("recurringEndTime", e.target.value)}
                        className="mt-1"
                        placeholder="2:00"
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <Label htmlFor="recurringEndAmpm" className="text-sm font-medium text-gray-700">
                        End AM/PM
                      </Label>
                      <Select
                        value={formData.recurringEndAmpm}
                        onValueChange={(value) => handleInputChange("recurringEndAmpm", value)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRecurringInstance"
                      checked={formData.isRecurringInstance}
                      onCheckedChange={(checked) => handleInputChange("isRecurringInstance", checked)}
                      disabled={isPending}
                    />
                    <Label htmlFor="isRecurringInstance">Is Recurring Instance</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>


          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              {isPending ? "Updating..." : "Update Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}