"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  Eye,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteInquiry } from "@/lib/actions/inquiry-actions";
import { toast } from "sonner";
import type { InquiryListItem } from "@/lib/actions/inquiry-actions";

interface InquiriesPageClientProps {
  inquiries: InquiryListItem[];
  stats: {
    total: number;
    recent: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export default function InquiriesPageClient({ inquiries, stats }: InquiriesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (inquiryId: number) => {
    if (!confirm("Are you sure you want to delete this inquiry? This action cannot be undone.")) {
      return;
    }

    setDeletingId(inquiryId);
    startTransition(async () => {
      const result = await deleteInquiry(inquiryId);
      if (result.success) {
        toast.success("Inquiry deleted successfully");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete inquiry");
      }
      setDeletingId(null);
    });
  };

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.artworkTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inquiries Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage all artwork inquiries from potential buyers
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.thisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Recent</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.recent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
              <p className="text-gray-500">
                {searchTerm ? "No inquiries match your search criteria." : "No inquiries have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{inquiry.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(inquiry.createdAt)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{inquiry.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(inquiry.id)}
                      disabled={isPending && deletingId === inquiry.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Message:</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{inquiry.message}</p>
                  </div>
                  {inquiry.artworkTitle && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">About Artwork:</h4>
                      <p className="text-blue-600 text-sm font-medium">{inquiry.artworkTitle}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
