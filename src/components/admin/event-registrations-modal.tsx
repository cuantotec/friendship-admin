"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Phone,
  Calendar,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import type { EventListItem } from "@/types";

interface EventRegistrationsModalProps {
  event: EventListItem;
  isOpen: boolean;
  onClose: () => void;
}

// Mock registration data - replace with actual API call
const mockRegistrations = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    registeredAt: "2024-01-15T10:30:00Z",
    status: "confirmed",
    paymentStatus: "paid",
    notes: "VIP guest"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    registeredAt: "2024-01-14T14:20:00Z",
    status: "pending",
    paymentStatus: "pending",
    notes: ""
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+1 (555) 456-7890",
    registeredAt: "2024-01-13T09:15:00Z",
    status: "confirmed",
    paymentStatus: "paid",
    notes: "Dietary restrictions: vegetarian"
  }
];

export default function EventRegistrationsModal({
  event,
  isOpen,
  onClose
}: EventRegistrationsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState(mockRegistrations);

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter(registration =>
    registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ["Name", "Email", "Phone", "Registered At", "Status", "Payment Status", "Notes"],
      ...filteredRegistrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone,
        format(new Date(reg.registeredAt), "MMM d, yyyy 'at' h:mm a"),
        reg.status,
        reg.paymentStatus,
        reg.notes
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Registrations
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-1">
            {event.title} • {format(new Date(event.startDate), "MMM d, yyyy")}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {registrations.length}
              </div>
              <div className="text-sm text-blue-700">Total Registrations</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {registrations.filter(r => r.status === "confirmed").length}
              </div>
              <div className="text-sm text-green-700">Confirmed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {registrations.filter(r => r.status === "pending").length}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {registrations.filter(r => r.paymentStatus === "paid").length}
              </div>
              <div className="text-sm text-green-700">Paid</div>
            </div>
          </div>

          {/* Search and Actions */}
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
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Registrations Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No registrations match your search" : "No registrations found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {registration.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {registration.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(registration.registeredAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(registration.registeredAt), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(registration.status)}>
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(registration.paymentStatus)}>
                          {registration.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-gray-600 truncate">
                          {registration.notes || "—"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
