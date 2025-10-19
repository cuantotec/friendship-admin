"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteArtist } from "@/lib/actions/artist-invitation-actions";
import { toast } from "sonner";
import { 
  UserPlus, 
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  User,
  Shield
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
    preApproved: false
  });

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
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
      formDataObj.append("preApproved", formData.preApproved.toString());

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
          preApproved: false
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
      <DialogContent className="w-full max-w-md mx-4 bg-white">
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

          {/* Pre-Approval Toggle */}
          <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            formData.preApproved 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  formData.preApproved 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className={`text-base font-semibold ${
                      formData.preApproved ? 'text-emerald-900' : 'text-amber-900'
                    }`}>
                      Pre-Approved Artist
                    </Label>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      formData.preApproved 
                        ? 'bg-emerald-200 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-200 text-amber-800 border border-amber-300'
                    }`}>
                      {formData.preApproved ? '✓ ENABLED' : '⚠ DISABLED'}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${
                    formData.preApproved ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {formData.preApproved 
                      ? '✅ This artist can upload artworks directly to the website without admin review'
                      : '⏳ This artist\'s artworks will require admin approval before going live'
                    }
                  </p>
                  <div className={`text-xs px-3 py-1 rounded-md ${
                    formData.preApproved 
                      ? 'text-emerald-600 bg-emerald-100' 
                      : 'text-amber-600 bg-amber-100'
                  }`}>
                    💡 {formData.preApproved 
                      ? 'Artist has auto-approval enabled' 
                      : 'Toggle this on for trusted artists who don\'t need artwork review'
                    }
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out ${
                  formData.preApproved 
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.preApproved}
                    onChange={(e) => handleInputChange("preApproved", e.target.checked)}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("preApproved", !formData.preApproved)}
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-200 ease-in-out ${
                      formData.preApproved ? 'translate-x-6 shadow-xl' : 'translate-x-1 shadow-md'
                    }`}
                  />
                </div>
                <span className={`text-xs font-semibold transition-colors duration-200 ${
                  formData.preApproved ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {formData.preApproved ? 'Auto-approve' : 'Require review'}
                </span>
              </div>
            </div>
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
