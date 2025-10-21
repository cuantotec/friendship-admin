"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import DataTable from "@/components/ui/data-table";
import StatsCard from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  BarChart3, 
  DollarSign, 
  Users,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  User
} from "lucide-react";
import { updateArtistVisibility, deleteArtistAdmin } from "@/lib/actions/secure-admin-actions";
import { toast } from "sonner";
import type { ArtistListItem } from "@/types";

interface SimplifiedArtistsPageProps {
  artists: ArtistListItem[];
  stats: {
    total: number;
    visible: number;
    featured: number;
    totalArtworks: number;
  };
}

export default function SimplifiedArtistsPage({ artists, stats }: SimplifiedArtistsPageProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleVisibilityToggle = (artist: ArtistListItem) => {
    startTransition(async () => {
      const result = await updateArtistVisibility(artist.id, !artist.isVisible);
      
      if (result.success) {
        toast.success(
          artist.isVisible ? "Artist hidden from frontend" : "Artist made visible"
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    });
  };

  const handleDelete = (artist: ArtistListItem) => {
    if (artist.artworkCount > 0) {
      toast.error("Cannot delete artist with existing artworks");
      return;
    }

    if (!confirm(`Are you sure you want to delete artist "${artist.name}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteArtistAdmin(artist.id);
      
      if (result.success) {
        toast.success("Artist deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete artist");
      }
    });
  };

  const handleRowAction = (action: string, artist: ArtistListItem) => {
    switch (action) {
      case "toggle-visibility":
        handleVisibilityToggle(artist);
        break;
      case "edit":
        router.push(`/admin/artists/${artist.id}/edit`);
        break;
      case "delete":
        handleDelete(artist);
        break;
      case "view-profile":
        router.push(`/admin/artists/${artist.id}`);
        break;
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: string | number | boolean | null | undefined, artist: ArtistListItem) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value as string}</div>
            <div className="text-sm text-gray-500">{artist.email}</div>
          </div>
        </div>
      )
    },
    {
      key: "artworkCount",
      label: "Artworks",
      render: (value: string | number | boolean | null | undefined) => (
        <Badge variant="secondary">{value as number}</Badge>
      )
    },
    {
      key: "isVisible",
      label: "Status",
      render: (value: string | number | boolean | null | undefined, artist: ArtistListItem) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Visible" : "Hidden"}
          </Badge>
          {artist.featured && (
            <Badge variant="outline">Featured</Badge>
          )}
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string | number | boolean | null | undefined) => (
        <span className="text-sm text-gray-500">
          {new Date(value as string).toLocaleDateString()}
        </span>
      )
    }
  ];

  const rowActions = [
    {
      label: "View Profile",
      action: "view-profile",
      icon: Eye
    },
    {
      label: "Edit",
      action: "edit",
      icon: Edit
    },
    {
      label: (artist: ArtistListItem) => artist.isVisible ? "Hide" : "Show",
      action: "toggle-visibility",
      icon: EyeOff
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
      title: "Total Artists",
      value: stats.total,
      icon: Users,
      color: "default" as const
    },
    {
      title: "Visible",
      value: stats.visible,
      icon: Eye,
      color: "green" as const
    },
    {
      title: "Featured",
      value: stats.featured,
      icon: BarChart3,
      color: "blue" as const
    },
    {
      title: "Total Artworks",
      value: stats.totalArtworks,
      icon: Palette,
      color: "purple" as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Artists Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all artists in the gallery
          </p>
        </div>
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

      {/* Artists Table */}
      <DataTable
        data={artists}
        columns={columns}
        title="All Artists"
        searchable
        exportable
        onExport={async () => {
          try {
            const response = await fetch('/api/export?type=artists&format=excel');
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "artists.xlsx";
            a.click();
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
          }
        }}
        onRowAction={handleRowAction}
        rowActions={rowActions}
        emptyMessage="No artists found"
      />
    </div>
  );
}
