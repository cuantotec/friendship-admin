"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, Trash2, MoreVertical, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  toggleArtistVisibility,
  deleteArtistAdmin,
  sendPasswordResetEmail,
  updateUserStatus,
} from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface ArtistActionsProps {
  artistId: number;
  artistName: string;
  isVisible: boolean;
  artworkCount: number;
  hasUser: boolean;
  userId: string | null;
  userEmail: string | null;
}

export default function ArtistActions({
  artistId,
  artistName,
  isVisible,
  artworkCount,
  hasUser,
  userId,
  userEmail,
}: ArtistActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleVisibility = () => {
    startTransition(async () => {
      const result = await toggleArtistVisibility(artistId);
      if (result.success) {
        toast.success("Visibility updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete artist "${artistName}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteArtistAdmin(artistId);
      if (result.success) {
        toast.success("Artist deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete artist");
      }
    });
  };

  const handleResetPassword = () => {
    if (!userId || !userEmail) return;
    
    startTransition(async () => {
      const result = await sendPasswordResetEmail(userId, userEmail);
      if (result.success) {
        toast.info(result.message || "Password reset instructions", {
          duration: 8000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to send password reset email");
      }
    });
  };

  const handleBlockUser = () => {
    if (!userId) return;
    
    startTransition(async () => {
      const result = await updateUserStatus(userId, { disabled: true });
      if (result.success) {
        toast.info(result.message || "User management instructions", {
          duration: 8000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to block user");
      }
    });
  };

  const handleUnblockUser = () => {
    if (!userId) return;
    
    startTransition(async () => {
      const result = await updateUserStatus(userId, { disabled: false });
      if (result.success) {
        toast.info(result.message || "User management instructions", {
          duration: 8000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unblock user");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleVisibility}
        disabled={isPending}
        title={isVisible ? "Hide artist" : "Show artist"}
      >
        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
      
      {hasUser && userId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleResetPassword}>
              <KeyRound className="h-4 w-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBlockUser}>
              <ShieldAlert className="h-4 w-4 mr-2 text-orange-600" />
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUnblockUser}>
              <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
              Unblock User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending || artworkCount > 0}
        title={
          artworkCount > 0
            ? "Cannot delete artist with artworks"
            : "Delete artist"
        }
      >
        <Trash2
          className={`h-4 w-4 ${
            artworkCount > 0 ? "text-gray-400" : "text-red-600"
          }`}
        />
      </Button>
    </div>
  );
}

