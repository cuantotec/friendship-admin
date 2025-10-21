"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Phone,
  Calendar,
  ArrowLeft,
  Filter,
  MoreVertical
} from "lucide-react";
import { formatEventDateTime, formatEasternDate } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BreadcrumbNav from "./breadcrumb-nav";
import type { EventListItem, EventRegistration } from "@/types";

interface EventRegistrationsPageProps {
  event: EventListItem;
  registrations: EventRegistration[];
  stats: {
    total: number;
    totalAttendees: number;
    recentRegistrations: number;
  };
}


export default function EventRegistrationsPage({
  event,
  registrations: initialRegistrations,
  stats
}: EventRegistrationsPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter registrations based on search term
  const filteredRegistrations = initialRegistrations.filter(registration => {
    const matchesSearch = 
      registration.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registration.phoneNumber && registration.phoneNumber.includes(searchTerm));
    
    return matchesSearch;
  });


  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ["Name", "Email", "Phone", "Number of Attendees", "Registered At", "Additional Information"],
      ...filteredRegistrations.map(reg => [
        reg.fullName,
        reg.email,
        reg.phoneNumber || "",
        reg.numberOfAttendees.toString(),
        formatEasternDate(reg.createdAt, "yyyy-MM-dd HH:mm:ss"),
        reg.additionalInformation || ""
      ])
    ].map(row => row.join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        items={[
          { label: "Events", href: "/admin/events" },
          { label: event.title, href: `/admin/events/${event.id}` },
          { label: "Registrations" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Event Registrations
            </h1>
            <p className="text-gray-600 mt-1">
              {event.title} • {formatEventDateTime(event)}
            </p>
          </div>
        </div>
        
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">
              {stats.total}
            </div>
            <div className="text-sm text-blue-700">Total Registrations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {stats.totalAttendees}
            </div>
            <div className="text-sm text-green-700">Total Attendees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-900">
              {stats.recentRegistrations}
            </div>
            <div className="text-sm text-purple-700">Recent (7 days)</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registrations ({filteredRegistrations.length})</span>
            <div className="text-sm font-normal text-gray-500">
              Showing {filteredRegistrations.length} of {initialRegistrations.length} registrations
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Additional Info</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm 
                        ? "No registrations match your search" 
                        : "No registrations found for this event"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.fullName}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {registration.email}
                          </div>
                          {registration.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {registration.phoneNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {registration.numberOfAttendees} {registration.numberOfAttendees === 1 ? 'person' : 'people'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatEasternDate(registration.createdAt, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatEasternDate(registration.createdAt, "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.additionalInformation ? (
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {registration.additionalInformation}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No additional info</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Registration</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Cancel Registration
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
