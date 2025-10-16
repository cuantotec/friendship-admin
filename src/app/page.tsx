import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/actions/signout";
import { isUserAdmin } from "@/lib/stack-auth-helpers";
import { getArtistById } from "@/lib/actions/get-artist";
import { getAdminStats, getAllArtworks } from "@/lib/actions/admin-actions";
import ArtistDashboard from "@/components/artist-dashboard";
import { 
  Users, 
  Palette, 
  Calendar, 
  Mail, 
  User,
  LogOut,
  DollarSign
} from "lucide-react";
import type { AdminStats, ArtworkListItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get user role
  const isAdmin = await isUserAdmin();
  
  // Get admin or artist data based on role
  let adminStats: AdminStats | null = null;
  let adminArtworks: ArtworkListItem[] | null = null;
  let artistData: { artist: import("@/types").Artist; artworks: import("@/types").ArtworkWithDisplayOrder[] } | null = null;
  
  if (isAdmin) {
    // Fetch admin data
    try {
      adminStats = await getAdminStats();
      adminArtworks = await getAllArtworks();
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  } else {
    // Get artist data using server action
    const artistResult = await getArtistById();
    
    if (!artistResult.success) {
      console.error("Failed to fetch artist data:", artistResult.error);
    }

    artistData = artistResult.success ? artistResult.data : null;
  }
  
  const artist = artistData?.artist;
  const artworks = artistData?.artworks || [];
  const errorMessage = !isAdmin && !artistData ? "Artist data not found" : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/logo.svg"
                  alt="Friendship Gallery Logo"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Friendship Gallery
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {isAdmin ? "Admin Dashboard" : "Artist Portal"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.displayName || user.primaryEmail || 'User'}</p>
                  <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'Artist'}</p>
                </div>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit" className="rounded-xl">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
            Welcome back, {user.displayName || user.primaryEmail?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-gray-600 text-lg">
            {isAdmin 
              ? "Manage your gallery, artists, and events from this dashboard."
              : "Manage your artworks and profile from this dashboard."
            }
          </p>
        </div>

        {isAdmin ? (
          <AdminDashboard stats={adminStats} recentArtworks={adminArtworks || []} />
        ) : errorMessage ? (
          <ErrorDisplay error={errorMessage} />
        ) : (
          <ArtistDashboard 
            artist={artist || null}
            artworks={artworks}
          />
        )}
      </main>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="space-y-8">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Artist Profile Not Found
          </h3>
          <p className="text-red-700 mb-4">
            {error}
          </p>
          <div className="space-y-2 text-sm text-red-600">
                <p>This usually means:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your artist ID in Stack Auth doesn&apos;t match any artist in the database</li>
                  <li>Your artist profile hasn&apos;t been created yet</li>
                  <li>There&apos;s a configuration issue with your account</li>
                </ul>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="rounded-xl">
              <Mail className="h-4 w-4 mr-2" />
              Contact Administrator
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ 
  stats, 
  recentArtworks 
}: { 
  stats: AdminStats | null; 
  recentArtworks: ArtworkListItem[];
}) {
  const activeArtworks = recentArtworks
    .filter((artwork) => artwork.isVisible)
    .slice(0, 8);

  const statsCards = stats ? [
    {
      name: "Total Artworks",
      value: stats.totalArtworks,
      icon: Palette,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Artworks Worth",
      value: `$${parseFloat(stats.artworksWorth).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Total Artists",
      value: stats.totalArtists,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Active Events",
      value: stats.activeEvents,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.name} className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/admin/artworks">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Palette className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Manage Artworks</span>
              </Button>
            </Link>
            <Link href="/admin/artists">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span className="font-medium">Manage Artists</span>
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Calendar className="h-6 w-6 text-orange-600" />
                <span className="font-medium">Manage Events</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Artworks Section */}
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Active Artworks</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Currently visible artworks in the gallery
            </p>
          </div>
          <Link href="/admin/artworks">
            <Button variant="outline">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activeArtworks.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No active artworks
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new artwork.
              </p>
              <div className="mt-6">
                <Link href="/admin/artworks">
                  <Button>
                    <Palette className="mr-2 h-4 w-4" />
                    Go to Artworks
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {activeArtworks.map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/admin/artworks`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {artwork.watermarkedImage ? (
                      <Image
                        src={artwork.watermarkedImage}
                        alt={artwork.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Palette className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 text-white">
                        {artwork.location}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {artwork.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {artwork.artistName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {artwork.status}
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        ${parseFloat(artwork.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
