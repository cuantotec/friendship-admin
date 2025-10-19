"use client";

import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { populateDisplayOrders } from "@/lib/actions/populate-display-orders";

export default function PopulateDisplayOrdersButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePopulate = async () => {
    if (!confirm("This will populate display orders for all artworks. Continue?")) {
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Populating display orders...", {
      description: "Setting up initial order values for all artworks."
    });

    try {
      const result = await populateDisplayOrders();
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Display orders populated!", {
          description: `Updated ${result.updatedCount} artworks with initial order values.`,
          icon: <Database className="h-4 w-4" />
        });
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to populate display orders", {
          description: result.error,
          icon: <Database className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to populate display orders", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <Database className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePopulate}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Database className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Populating..." : "Populate Display Orders"}
    </Button>
  );
}
