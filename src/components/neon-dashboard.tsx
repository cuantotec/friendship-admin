import { getNeonUser, signOutNeon } from "@/lib/neon-auth-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Palette, 
  Calendar, 
  Mail, 
  BarChart3, 
  Settings,
  User,
  Shield,
  LogOut
} from "lucide-react";

export async function NeonDashboard() {
  const user = await getNeonUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Not Authenticated</h2>
            <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Friendship Gallery
              </h1>
              <Badge variant="secondary" className="ml-3">
                {isAdmin ? "Admin" : "User"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
              </div>
              <form action={signOutNeon}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.displayName || user.email}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isAdmin 
                ? "Manage your gallery, artists, and events from this dashboard."
                : "Manage your artworks and profile from this dashboard."
              }
            </p>
          </div>

          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <UserDashboard />
          )}
        </div>
      </main>
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Manage Artists
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Palette className="h-6 w-6 mb-2" />
              Manage Artworks
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Manage Events
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              View Inquiries
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserDashboard() {
  const stats = [
    { name: "My Artworks", value: "12", icon: Palette, change: "+1", changeType: "positive" },
    { name: "Featured Pieces", value: "3", icon: Shield, change: "+1", changeType: "positive" },
    { name: "Total Views", value: "1,234", icon: BarChart3, change: "+89", changeType: "positive" },
    { name: "Inquiries", value: "7", icon: Mail, change: "+2", changeType: "positive" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your artist profile and artworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Palette className="h-6 w-6 mb-2" />
              Add New Artwork
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <User className="h-6 w-6 mb-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              View Inquiries
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              My Events
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
