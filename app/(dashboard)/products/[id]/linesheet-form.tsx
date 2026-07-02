"use client";

import { Eye, FileText, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function LinesheetForm({
  productId,
  initialLink,
}: {
  productId: string;
  initialLink?: string | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsSaving(true);
    const toastId = toast.loading("Uploading linesheet PDF...", {
      position: "top-right",
    });

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await fetch(`/api/products/${productId}/linesheet`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload linesheet");
      }

      toast.success("Linesheet uploaded successfully", { id: toastId });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this linesheet?")) return;
    setIsSaving(true);
    const toastId = toast.loading("Deleting linesheet...", {
      position: "top-right",
    });

    try {
      const formData = new FormData();
      formData.append("deleteFile", "true");

      const res = await fetch(`/api/products/${productId}/linesheet`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete linesheet");
      }

      toast.success("Linesheet deleted successfully", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Extract filename from path (e.g. "/public/uploads/linesheets/Lotus Flower.pdf" -> "Lotus Flower.pdf")
  const getFilename = (pathStr: string) => {
    const parts = pathStr.split("/");
    return decodeURIComponent(parts[parts.length - 1]);
  };

  return (
    <div className="space-y-4">
      {initialLink ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] rounded-[6px] p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-[4px] text-red-500">
              <FileText className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 line-clamp-1">
                {getFilename(initialLink)}
              </span>
              <span className="text-xs text-gray-500">PDF Linesheet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={initialLink}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[6px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Eye className="size-3.5" />
              View PDF
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
          <div className="flex-1 flex items-center gap-2 border border-dashed border-[#d1d1d1] rounded-[6px] bg-white px-3 h-10 overflow-hidden">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="linesheet-pdf-file"
              disabled={isSaving}
            />
            <label
              htmlFor="linesheet-pdf-file"
              className="cursor-pointer h-7 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[4px] text-xs font-medium text-gray-700 inline-flex items-center transition-colors select-none shrink-0"
            >
              Choose PDF
            </label>
            <span className="text-xs text-gray-500 truncate flex-1">
              {file ? file.name : "No file selected"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isSaving}
            className={`h-10 px-5 rounded-[6px] text-sm font-semibold transition-all shrink-0 select-none inline-flex items-center justify-center gap-1.5 ${
              file && !isSaving
                ? "bg-[#627426] text-white hover:bg-[#627426]/90 cursor-pointer shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E5E5]"
            }`}
          >
            <Upload className="size-4" />
            Upload PDF
          </button>
        </div>
      )}
    </div>
  );
}
