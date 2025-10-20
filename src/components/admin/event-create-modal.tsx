"use client";

import { useState, useRef } from "react";
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
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { 
  Loader2, 
  CheckCircle, 
  XCircle,
  MapPin
} from "lucide-react";
import Image from "next/image";

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format time for HTML input
function formatTimeForInput(time: string): string {
  if (!time || time === '12:00') return '12:00';
  return time.substring(0, 5);
}

export default function EventCreateModal({
  isOpen,
  onClose
}: EventCreateModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    eventType: 'Exhibition',
    slug: '',
    status: 'Upcoming',
    
    // Dates and Times
    startDate: '',
    startTime: '12:00',
    endDate: '',
    endTime: '12:00',
    
    // Location (hardcoded and locked)
    location: 'The Friendship Center Gallery',
    address: '',
    
    // Image
    featuredImage: '',
    
    // Registration Settings
    registrationEnabled: false,
    registrationType: 'modal',
    paymentEnabled: false,
    isFreeEvent: true,
    chabadPay: false,
    
    // Recurring Settings
    isRecurring: false,
    recurringType: '',
    recurringStartTime: '',
    recurringStartAmpm: 'AM',
    recurringEndTime: '',
    recurringEndAmpm: 'PM',
    
    // Additional Fields
    parentEventId: '',
    isRecurringInstance: false,
    paymentTiers: '',
  });

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Event description is required");
      return;
    }

    if (!formData.startDate) {
      toast.error("Start date is required");
      return;
    }

    startTransition(async () => {
      try {
        // Upload image if selected
        let imageUrl = formData.featuredImage;
        if (imageFile) {
          const uploadedUrl = await uploadImage();
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          }
        }

        // Generate slug if not provided
        const slug = formData.slug || generateSlug(formData.title);

        // Import the unified time conversion function
        const { convertEasternToUTC } = await import('@/lib/dateUtils');

        const startTime = formatTimeForInput(formData.startTime);
        const endTime = formData.endTime ? formatTimeForInput(formData.endTime) : '12:00';
        
        const startDateStr = `${formData.startDate}T${startTime}:00`;
        const endDateStr = formData.endDate ? `${formData.endDate}T${endTime}:00` : null;
        
        const startDateTime = convertEasternToUTC(startDateStr);
        const endDateTime = endDateStr ? convertEasternToUTC(endDateStr) : null;

        // Parse payment tiers if provided
        let paymentTiers = null;
        if (formData.paymentTiers.trim()) {
          try {
            paymentTiers = JSON.parse(formData.paymentTiers);
          } catch {
            toast.error("Invalid payment tiers JSON format");
            return;
          }
        }

        const result = await createEvent({
          title: formData.title.trim(),
          description: formData.description.trim(),
          eventType: formData.eventType,
          slug: slug,
          startDate: startDateTime,
          endDate: endDateTime,
          location: formData.location, // Hardcoded to "The Friendship Center Gallery"
          address: formData.address || null,
          externalUrl: null,
          registrationUrl: null,
          registrationType: formData.registrationType,
          status: formData.status,
          featuredImage: imageUrl || null,
          registrationEnabled: formData.registrationEnabled,
          paymentEnabled: formData.paymentEnabled,
          isCanceled: false,
          isRecurring: formData.isRecurring,
          isFreeEvent: formData.isFreeEvent,
          chabadPay: formData.chabadPay,
          recurringType: formData.isRecurring ? formData.recurringType : null,
          recurringStartTime: formData.isRecurring ? formData.recurringStartTime : null,
          recurringStartAmpm: formData.isRecurring ? formData.recurringStartAmpm : null,
          recurringEndTime: formData.isRecurring ? formData.recurringEndTime : null,
          recurringEndAmpm: formData.isRecurring ? formData.recurringEndAmpm : null,
          featuredArtists: null,
          parentEventId: formData.parentEventId ? parseInt(formData.parentEventId) : null,
          isRecurringInstance: formData.isRecurringInstance,
          paymentTiers: paymentTiers,
        });

        if (result.success) {
          toast.success("Event created successfully!", {
            description: "The event has been added to the gallery.",
            icon: <CheckCircle className="h-4 w-4" />
          });
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            eventType: 'Exhibition',
            slug: '',
            status: 'Upcoming',
            startDate: '',
            startTime: '12:00',
            endDate: '',
            endTime: '12:00',
            location: 'The Friendship Center Gallery',
            address: '',
            featuredImage: '',
            registrationEnabled: false,
            registrationType: 'modal',
            paymentEnabled: false,
            isFreeEvent: true,
            chabadPay: false,
            isRecurring: false,
            recurringType: '',
            recurringStartTime: '',
            recurringStartAmpm: 'AM',
            recurringEndTime: '',
            recurringEndAmpm: 'PM',
            parentEventId: '',
            isRecurringInstance: false,
            paymentTiers: '',
          });
          setImagePreview(null);
          setImageFile(null);
          
          onClose();
          router.refresh();
        } else {
          toast.error("Failed to create event", {
            description: result.error || "An unexpected error occurred",
            icon: <XCircle className="h-4 w-4" />
          });
        }
      } catch (error) {
        console.error("Error creating event:", error);
        toast.error("Failed to create event", {
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      handleInputChange('title', e.target.value);
                      if (!formData.slug) {
                        handleInputChange('slug', generateSlug(e.target.value));
                      }
                    }}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="event-url-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter event description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => handleInputChange('eventType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Exhibition">Exhibition</SelectItem>
                      <SelectItem value="Opening">Opening</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location - Hardcoded and Locked */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Location is set to &quot;The Friendship Center Gallery&quot; by default
                </p>
              </div>
              <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter specific address or room"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: 1200x630px, max 5MB
                  </p>
                </div>
                {isUploadingImage && (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                )}
              </div>

              {imagePreview && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Event preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registrationEnabled">Enable Registration</Label>
                  <p className="text-sm text-gray-500">Allow people to register for this event</p>
                </div>
                <Switch
                  id="registrationEnabled"
                  checked={formData.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                />
              </div>

              {formData.registrationEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  <div>
                    <Label htmlFor="registrationType">Registration Type</Label>
                    <Select
                      value={formData.registrationType}
                      onValueChange={(value) => handleInputChange('registrationType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modal">Modal Form</SelectItem>
                        <SelectItem value="external">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isFreeEvent">Free Event</Label>
                      <p className="text-sm text-gray-500">This event is free to attend</p>
                    </div>
                    <Switch
                      id="isFreeEvent"
                      checked={formData.isFreeEvent}
                      onCheckedChange={(checked) => handleInputChange('isFreeEvent', checked)}
                    />
                  </div>

                  {!formData.isFreeEvent && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="paymentEnabled">Enable Payment</Label>
                        <p className="text-sm text-gray-500">Collect payment for this event</p>
                      </div>
                      <Switch
                        id="paymentEnabled"
                        checked={formData.paymentEnabled}
                        onCheckedChange={(checked) => handleInputChange('paymentEnabled', checked)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
