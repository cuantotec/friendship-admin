"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateArtistSettings } from "@/lib/actions/artist-actions";
import { toast } from "sonner";
import { 
  Save, 
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  Star
} from "lucide-react";

type Artist = {
  id: number;
  name: string;
  featured?: boolean;
};

interface ArtistSettingsModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export default function ArtistSettingsModal({ 
  artist, 
  isOpen, 
  onClose,
  onSettingsUpdated
}: ArtistSettingsModalProps) {
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (artist && isOpen) {
      setIsFeatured(artist.featured || false);
    }
  }, [artist, isOpen]);

  const handleSave = async () => {
    if (!artist?.id) return;

    setIsLoading(true);
    
    const loadingToast = toast.loading("Updating settings...", {
      description: "Please wait while we save your changes."
    });
    
    try {
      const result = await updateArtistSettings({
        featured: isFeatured
      });
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Settings updated successfully!", {
          description: isFeatured 
            ? "You are now featured on the website!" 
            : "You have been removed from featured artists.",
          icon: <CheckCircle className="h-4 w-4" />
        });
        onSettingsUpdated();
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update settings", {
          description: result.error || "An error occurred",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update settings", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!artist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-white">
        <DialogHeader className="bg-white border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5">
                <Star className={`h-5 w-5 ${isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <Label htmlFor="featured" className="text-base font-semibold text-gray-900 cursor-pointer">
                  Featured on the Website
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Display your profile prominently on the homepage and gallery pages
                </p>
                {isFeatured && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    ✓ Your profile is currently featured
                  </p>
                )}
              </div>
            </div>
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
              className="ml-4"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">What does &quot;Featured&quot; mean?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Your artworks appear first in search results</li>
              <li>• Your profile gets highlighted on the homepage</li>
              <li>• Increased visibility to gallery visitors</li>
              <li>• Priority placement in artist listings</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

