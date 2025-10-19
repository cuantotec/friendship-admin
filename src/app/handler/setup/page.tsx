"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  User, 
  Palette,
  ArrowRight
} from "lucide-react";
import { createArtistFromInvitation } from "@/lib/actions/artist-invitation-actions";

export default function ArtistSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<{
    name: string;
    email: string;
    code: string;
    isValid: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    specialty: "",
    exhibitions: ""
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      toast.error("Invalid invitation link", {
        description: "No invitation code found in the URL"
      });
      router.push("/");
      return;
    }

    // Validate invitation code
    validateInvitation(code);
  }, [searchParams, router]);

  const validateInvitation = async (code: string) => {
    try {
      // This would typically be a server action to validate the invitation
      // For now, we'll simulate the validation
      const response = await fetch(`/api/validate-invitation?code=${code}`);
      const result = await response.json();
      
      if (result.success) {
        setInvitation({
          name: result.data.name,
          email: result.data.email,
          code: code,
          isValid: true
        });
      } else {
        setInvitation({
          name: "",
          email: "",
          code: code,
          isValid: false
        });
        toast.error("Invalid invitation", {
          description: result.error || "This invitation link is invalid or expired"
        });
      }
    } catch (error) {
      console.error("Error validating invitation:", error);
      setInvitation({
        name: "",
        email: "",
        code: code,
        isValid: false
      });
      toast.error("Error validating invitation", {
        description: "Failed to validate invitation code"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation?.isValid) {
      toast.error("Invalid invitation", {
        description: "Cannot proceed with invalid invitation"
      });
      return;
    }

    if (!formData.bio.trim() || !formData.specialty.trim()) {
      toast.error("Required fields missing", {
        description: "Please fill in your bio and specialty"
      });
      return;
    }

    setIsSubmitting(true);
    
    const loadingToast = toast.loading("Setting up your account...", {
      description: "Please wait while we create your artist profile."
    });

    try {
      // Create artist account using Stack Auth
      const result = await createArtistFromInvitation({
        invitationCode: invitation.code,
        bio: formData.bio,
        specialty: formData.specialty,
        exhibitions: formData.exhibitions
      });

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Account created successfully!", {
          description: "Welcome to the gallery! Redirecting to your dashboard...",
          icon: <CheckCircle className="h-4 w-4" />
        });
        
        // Redirect to artist dashboard
        setTimeout(() => {
          router.push("/artist-dashboard");
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to create account", {
          description: result.error || "An error occurred during setup",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create account", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Invitation</h2>
            <p className="text-gray-600">Please wait while we verify your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation?.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">
              This invitation link is invalid or has expired. Please contact the gallery administrator.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to The Friendship Center Gallery!
            </h1>
            <p className="text-gray-600">
              Complete your artist profile to get started
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Hello {invitation.name}!</p>
                <p className="text-sm text-blue-700">
                  You&apos;ve been invited to join our gallery. Let&apos;s set up your artist profile.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                Artist Biography <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="mt-1"
                rows={4}
                placeholder="Tell us about your artistic journey, inspirations, and philosophy..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed on your public artist page
              </p>
            </div>

            {/* Specialty */}
            <div>
              <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">
                Specialty / Medium <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange("specialty", e.target.value)}
                  className="pl-10"
                  placeholder="e.g., Oil Painting, Sculpture, Mixed Media"
                  required
                />
              </div>
            </div>

            {/* Exhibitions */}
            <div>
              <Label htmlFor="exhibitions" className="text-sm font-medium text-gray-700">
                Exhibitions & Achievements
              </Label>
              <Textarea
                id="exhibitions"
                value={formData.exhibitions}
                onChange={(e) => handleInputChange("exhibitions", e.target.value)}
                className="mt-1"
                rows={3}
                placeholder="List your exhibitions, awards, publications, and other achievements..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter one per line (press Enter for new line)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
