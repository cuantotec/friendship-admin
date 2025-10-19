import { getAllInquiries, getInquiryStats } from "@/lib/actions/inquiry-actions";
import InquiriesPageClient from "@/components/admin/inquiries-page-client";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await getAllInquiries();
  const stats = await getInquiryStats();

  return (
    <div className="space-y-6">
      {/* Client component for interactive features */}
      <InquiriesPageClient inquiries={inquiries} stats={stats} />
    </div>
  );
}
