"use client";

import { Eye, Globe, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function EcommerceUrlForm({
  productId,
  initialLink,
}: {
  productId: string;
  initialLink?: string | null;
}) {
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving E-commerce Site URL...", {
      position: "top-right",
    });

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ecommerceUrl: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save URL");
      }

      toast.success("E-commerce URL saved successfully", { id: toastId });
      setUrl("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this E-commerce URL?"))
      return;
    setIsSaving(true);
    const toastId = toast.loading("Deleting E-commerce URL...", {
      position: "top-right",
    });

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ecommerceUrl: null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete URL");
      }

      toast.success("E-commerce URL deleted successfully", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {initialLink ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] rounded-[6px] p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-[4px] text-blue-500">
              <Globe className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 line-clamp-1">
                {initialLink}
              </span>
              <span className="text-xs text-gray-500">E-commerce Site URL</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={
                initialLink.startsWith("http")
                  ? initialLink
                  : `https://${initialLink}`
              }
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[6px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Eye className="size-3.5" />
              Visit Site
            </a>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="h-9 px-3 border border-red-100 hover:bg-red-50 text-red-600 rounded-[6px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center border border-[#d1d1d1] rounded-[6px] bg-white px-3 h-10 overflow-hidden">
            <Globe className="size-4 text-gray-400 shrink-0 mr-2" />
            <input
              type="url"
              placeholder="e.g. https://www.arunashi.com/products/ring"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs text-gray-900 focus:outline-none bg-transparent"
              disabled={isSaving}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!url.trim() || isSaving}
            className={`h-10 px-5 rounded-[6px] text-sm font-semibold transition-all shrink-0 select-none inline-flex items-center justify-center gap-1.5 ${
              url.trim() && !isSaving
                ? "bg-[#627426] text-white hover:bg-[#627426]/90 cursor-pointer shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E5E5]"
            }`}
          >
            <Save className="size-4" />
            Save URL
          </button>
        </div>
      )}
    </div>
  );
}
