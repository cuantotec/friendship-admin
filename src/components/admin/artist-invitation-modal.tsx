"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inviteArtist } from "@/lib/actions/artist-invitation-actions";
import { toast } from "sonner";
import { 
  UserPlus, 
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  User,
  Palette
} from "lucide-react";

interface ArtistInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
}

export default function ArtistInvitationModal({ 
  isOpen, 
  onClose,
  onInvitationSent
}: ArtistInvitationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    message: ""
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required", {
        description: "Please fill in all required fields",
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    setIsLoading(true);
    
    const loadingToast = toast.loading("Sending invitation...", {
      description: "Please wait while we send the invitation email."
    });
    
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("specialty", formData.specialty);
      formDataObj.append("message", formData.message);

      const result = await inviteArtist(formDataObj);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Invitation sent successfully!", {
          description: `Invitation code: ${result.data?.invitationCode}`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          specialty: "",
          message: ""
        });
        
        onInvitationSent();
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to send invitation", {
          description: result.error || "An error occurred",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send invitation", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Invite New Artist
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Artist Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Artist Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="pl-10"
                placeholder="Enter artist's full name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10"
                placeholder="artist@example.com"
                required
              />
            </div>
          </div>

          {/* Specialty */}
          <div>
            <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">
              Specialty / Medium
            </Label>
            <div className="relative mt-1">
              <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                className="pl-10"
                placeholder="e.g., Oil Painting, Sculpture, Mixed Media"
              />
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Personal Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Add a personal message to the invitation..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the invitation email
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Send Invitation
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
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
