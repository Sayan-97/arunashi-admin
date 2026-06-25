"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LinesheetForm({
  productId,
  initialLink,
}: {
  productId: string;
  initialLink?: string | null;
}) {
  const [link, setLink] = useState(initialLink || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const isChanged = link !== (initialLink || "");

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving linesheet link...", {
      position: "top-right",
    });

    try {
      const res = await fetch(`/api/products/${productId}/linesheet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save linesheet link");
      }

      toast.success("Linesheet link saved successfully", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-1">
      <div className="flex-1">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://example.com/linesheet.pdf"
          className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-[#3a3a3a] placeholder:text-[#868686] focus:outline-none focus:border-[#627426]/50 transition-colors"
          disabled={isSaving}
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={!isChanged || isSaving}
        className={`h-10 px-5 rounded-[6px] text-sm font-semibold transition-all shrink-0 select-none ${
          isChanged && !isSaving
            ? "bg-[#627426] text-white hover:bg-[#627426]/90 cursor-pointer shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E5E5]"
        }`}
      >
        Save Link
      </button>
    </div>
  );
}
