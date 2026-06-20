"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { revalidateProductsCache } from "@/actions/products";

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing products from Shopify...", {
      position: "top-right",
    });

    try {
      const res = await fetch("/api/products/sync", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to sync products");
      }

      const data = await res.json();
      toast.success(data.message || "Successfully synced products", {
        id: toastId,
      });

      await revalidateProductsCache();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all select-none ${
        isSyncing
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E5E5]"
          : "bg-[#627426] text-white hover:bg-[#627426]/90 shadow-sm cursor-pointer border border-transparent"
      }`}
    >
      <RefreshCcw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
      <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
    </button>
  );
}
