"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Table } from "lucide-react";
import { toast } from "sonner";

interface ExportDataModalProps {
  children: React.ReactNode;
}

type DataType = "events" | "artworks" | "artists" | "inquiries" | "event-registrations";

export function ExportDataModal({ children }: ExportDataModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataType, setDataType] = useState<DataType>("events");
  const [isLoading, setIsLoading] = useState(false);

  const dataTypeOptions = [
    { value: "events", label: "Events" },
    { value: "artworks", label: "Artworks" },
    { value: "artists", label: "Artists" },
    { value: "inquiries", label: "Inquiries" },
    { value: "event-registrations", label: "Event Registrations" },
  ];

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // Create the export URL with parameters (Excel only)
      const exportUrl = `/api/export?type=${dataType}&format=excel`;
      
      // Fetch the file data
      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataType}-export.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      toast.success(`Export completed for ${dataType} in Excel format`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </DialogTitle>
          <DialogDescription>
            Choose the data type to export as Excel file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Data Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="data-type">Data Table</Label>
            <Select value={dataType} onValueChange={(value: DataType) => setDataType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Format Info */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Table className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">Export will be generated as Excel (.xlsx) file</span>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate & Download
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
