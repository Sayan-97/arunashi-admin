"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
}

interface ProductCollectionsFormProps {
  productId: string;
  initialCollections: { id: string; title: string; handle: string }[];
}

export function ProductCollectionsForm({
  productId,
  initialCollections,
}: ProductCollectionsFormProps) {
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialCollections.map((c) => c.id),
  );
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("/api/products/collections");
        if (!res.ok) throw new Error("Failed to fetch collections");
        const data = await res.json();
        setAllCollections(data.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load collections list");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving collection assignments...", {
      position: "top-right",
    });

    try {
      const res = await fetch(`/api/products/${productId}/collections`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collectionIds: selectedIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update collections");
      }

      toast.success("Collections updated successfully", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update collections", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500 font-medium select-none">
        <Loader2 className="size-4 animate-spin text-[#627426]" />
        <span>Loading collections...</span>
      </div>
    );
  }

  if (allCollections.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">
        No collections available. Create collections first in the Collections
        dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {allCollections.map((col) => {
          const isChecked = selectedIds.includes(col.id);
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => handleToggle(col.id)}
              className={`px-4 py-3 rounded-[8px] border text-left text-sm font-medium transition-all select-none cursor-pointer flex items-center justify-between gap-3 ${
                isChecked
                  ? "bg-[#EEEEE2] border-[#627426]/30 text-[#627426] font-semibold"
                  : "bg-white border-[#E5E5E5] text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-normal"
              }`}
            >
              <span className="truncate">{col.title}</span>
              <div
                className={`size-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isChecked
                    ? "bg-[#627426] border-[#627426] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isChecked && (
                  <svg
                    className="size-3 stroke-[3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`h-10 px-5 rounded-[6px] text-sm font-semibold transition-all select-none inline-flex items-center justify-center gap-1.5 ${
            isSaving
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E5E5]"
              : "bg-[#627426] text-white hover:bg-[#627426]/90 cursor-pointer shadow-sm"
          }`}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Collection Mappings
        </button>
      </div>
    </div>
  );
}
