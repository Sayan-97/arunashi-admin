"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { syncNow } from "@/actions/sync";

export function SyncButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await syncNow();
      if (res.error) {
        toast.error(res.error, { position: "top-right" });
      } else {
        toast.success(
          "Shopify products and requests synchronized successfully!",
          {
            position: "top-right",
          },
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during sync", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="h-8 px-4 rounded-[6px] border border-[#bec36c] text-[#627426] hover:bg-[#627426] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold cursor-pointer flex items-center justify-center min-w-[90px] gap-1.5"
    >
      {loading ? (
        <>
          <RefreshCw className="size-3 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : (
        "Sync Now"
      )}
    </button>
  );
}
