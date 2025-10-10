import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/actions/signout";
import { isUserAdmin } from "@/lib/stack-auth-helpers";
import { getArtistById } from "@/lib/actions/get-artist";
import ArtistDashboard from "@/components/artist-dashboard";
import { 
  Users, 
  Palette, 
  Calendar, 
  Mail, 
  BarChart3, 
  Settings,
  User,
  LogOut
} from "lucide-react";

export default async function Dashboard() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get user role
  const isAdmin = await isUserAdmin();
  
  // Get artist data using server action
  const artistResult = await getArtistById();
  
  if (!artistResult.success) {
    console.error("Failed to fetch artist data:", artistResult.error);
  }

  const artistData = artistResult.success ? artistResult.data : null;
  const artist = artistData?.artist;
  const artworks = artistData?.artworks || [];
  const errorMessage = artistResult.success ? null : artistResult.error;

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
          <AdminDashboard />
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

function AdminDashboard() {
  const stats = [
    { name: "Total Artists", value: "24", icon: Users, change: "+2", changeType: "positive" },
    { name: "Active Artworks", value: "156", icon: Palette, change: "+12", changeType: "positive" },
    { name: "Upcoming Events", value: "8", icon: Calendar, change: "+1", changeType: "positive" },
    { name: "New Inquiries", value: "23", icon: Mail, change: "+5", changeType: "positive" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-gray-600">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300">
              <Users className="h-6 w-6 mb-2 text-blue-600" />
              <span className="font-medium">Manage Artists</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-purple-300">
              <Palette className="h-6 w-6 mb-2 text-purple-600" />
              <span className="font-medium">Manage Artworks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-green-300">
              <Calendar className="h-6 w-6 mb-2 text-green-600" />
              <span className="font-medium">Manage Events</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-orange-300">
              <Mail className="h-6 w-6 mb-2 text-orange-600" />
              <span className="font-medium">View Inquiries</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-indigo-300">
              <BarChart3 className="h-6 w-6 mb-2 text-indigo-600" />
              <span className="font-medium">Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-400">
              <Settings className="h-6 w-6 mb-2 text-gray-600" />
              <span className="font-medium">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
