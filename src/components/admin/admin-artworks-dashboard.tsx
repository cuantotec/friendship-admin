"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  BarChart3, 
  DollarSign,
  Users,
  Grid,
  List,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import type { AdminStats, ArtworkListItem } from "@/types";

interface AdminArtworksDashboardProps {
  stats: AdminStats;
  featuredArtworks: ArtworkListItem[];
  totalArtworks: number;
}

export default function AdminArtworksDashboard({ 
  stats, 
  featuredArtworks,
  totalArtworks 
}: AdminArtworksDashboardProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Pagination
  const totalPages = Math.ceil(featuredArtworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArtworks = featuredArtworks.slice(startIndex, endIndex);

  const statsCards = [
    { 
      name: "Total Artworks", 
      value: stats.totalArtworks.toString(), 
      icon: Palette, 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      name: "Total Value", 
      value: `$${parseFloat(stats.artworksWorth).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      name: "Artists", 
      value: stats.totalArtists.toString(), 
      icon: Users, 
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      name: "Analytics", 
      value: "View Stats", 
      icon: BarChart3, 
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your gallery, artworks, and artists</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.name} className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Artworks Section */}
      <Card className="border-gray-200">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="space-y-4">
            {/* Title and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Featured Artworks</CardTitle>
                <CardDescription>Highlighted pieces from your collection</CardDescription>
              </div>
              <Link href="/admin/artworks">
                <Button size="sm" variant="outline" className="gap-2">
                  View All Artworks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-600">View:</span>
                <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 p-0"
                    title="Grid view"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 w-7 p-0"
                    title="List view"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Pagination Info */}
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-xs font-semibold text-purple-700">
                  Page {currentPage} of {totalPages} • {featuredArtworks.length} featured
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {currentArtworks.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Palette className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No featured artworks yet
              </h3>
              <p className="text-gray-600 mb-4">
                Mark artworks as featured to showcase them here
              </p>
              <Link href="/admin/artworks">
                <Button>Browse All Artworks</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Artworks Grid/List */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
              }>
                {currentArtworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      viewMode === 'list' ? 'flex gap-4 p-4 border rounded-lg' : ''
                    }`}
                    onClick={() => router.push(`/admin/artworks?id=${artwork.id}`)}
                  >
                    <div className={viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'}>
                      <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                        {artwork.watermarkedImage ? (
                          <Image
                            src={artwork.watermarkedImage}
                            alt={artwork.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={viewMode === 'list' ? '96px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Palette className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1' : 'mt-3'}>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-semibold text-gray-900 truncate flex-1">
                          {artwork.title}
                        </h5>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                          Featured
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1">
                        {artwork.artistName || 'Unknown Artist'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-green-600">
                          ${parseFloat(artwork.price).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {artwork.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/artworks">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Manage Artworks</p>
                  <p className="text-lg font-semibold text-gray-900">{totalArtworks} total</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/artists">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Manage Artists</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalArtists} artists</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/events">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Manage Events</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.activeEvents} active</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}


