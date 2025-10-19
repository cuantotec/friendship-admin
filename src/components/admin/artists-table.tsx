import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail } from "lucide-react";
import ArtistActions from "./artist-actions";
import type { ArtistListItem } from "@/types";

interface ArtistsTableProps {
  artists: ArtistListItem[];
}

export default function ArtistsTable({ artists }: ArtistsTableProps) {
  if (artists.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No artists found
          </h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artworks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {artists.map((artist) => (
                <tr key={artist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden relative">
                        {artist.profileImage ? (
                          <Image
                            src={artist.profileImage}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {artist.name}
                        </div>
                        {artist.featured && (
                          <Badge variant="secondary" className="mt-1">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      {artist.email ? (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          {artist.email}
                        </>
                      ) : (
                        <span className="text-gray-400">No email</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {artist.specialty || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline">{artist.artworkCount}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {artist.hasUser ? (
                      <Badge variant="default" className="bg-green-600">
                        Active User
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        No Account
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={artist.isVisible ? "default" : "secondary"}>
                      {artist.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ArtistActions
                      artistId={artist.id}
                      artistName={artist.name}
                      isVisible={artist.isVisible}
                      artworkCount={artist.artworkCount}
                      hasUser={artist.hasUser}
                      userId={artist.userId}
                      userEmail={artist.userEmail}
                      artistEmail={artist.email}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

