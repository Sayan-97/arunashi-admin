"use client";

import { Check, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ProductCategoriesForm } from "./categories-form";
import { CertificateForm } from "./certificate-form";
import { ProductCollectionsForm } from "./collections-form";
import { LinesheetForm } from "./linesheet-form";

interface ProductDetailsClientProps {
  initialProduct: any;
}

export function ProductDetailsClient({
  initialProduct,
}: ProductDetailsClientProps) {
  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Media states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Format price helper (adding space after $)
  const formatPrice = (priceVal: any) => {
    if (!priceVal) return "N/A";
    const cleanPrice = String(priceVal).replace(/[$,]/g, "");
    const num = Number(cleanPrice);
    if (Number.isNaN(num)) return "N/A";
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
    return formatted.replace("$", "$ ");
  };

  // Safe video URL resolution (keeping `/public` for proxy)
  const getVideoSrc = (src: string) => {
    return src;
  };

  const handleUpdateField = async (field: string, value: any) => {
    setIsSaving((prev) => ({ ...prev, [field]: true }));
    const toastId = toast.loading(`Updating ${field}...`);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }

      const updated = await res.json();
      setProduct(updated.data);
      toast.success("Updated successfully", { id: toastId });
      setEditingField(null);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Network error", { id: toastId });
    } finally {
      setIsSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  const startEditing = (field: string, currentVal: string) => {
    setEditingField(field);
    setEditValue(currentVal || "");
  };

  // Image Upload & Delete
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsUploadingImage(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/products/${product.id}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const updated = await res.json();
      setProduct(updated.data);
      toast.success("Image uploaded successfully", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const toastId = toast.loading("Deleting image...");

    try {
      const res = await fetch(`/api/products/${product.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete image");
      }

      const updated = await res.json();
      setProduct(updated.data);
      toast.success("Image deleted successfully", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // Video Upload & Delete
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsUploadingVideo(true);
    const toastId = toast.loading("Uploading video...");

    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch(`/api/products/${product.id}/videos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload video");
      }

      const updated = await res.json();
      setProduct(updated.data);
      toast.success("Video uploaded successfully", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleDeleteVideo = async (videoPath: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    const toastId = toast.loading("Deleting video...");

    try {
      const res = await fetch(`/api/products/${product.id}/videos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete video");
      }

      const updated = await res.json();
      setProduct(updated.data);
      toast.success("Video deleted successfully", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // Extract filename
  const _getFilename = (pathStr: string) => {
    const parts = pathStr.split("/");
    return decodeURIComponent(parts[parts.length - 1]);
  };

  return (
    <div className="max-w-7xl space-y-10 p-10 bg-white">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#EEEEEE] pb-6">
        <div className="flex-1 space-y-2">
          {editingField === "title" ? (
            <div className="flex items-center gap-2 max-w-2xl">
              <input
                className="border-b border-[#bec36c] pb-1 text-2xl md:text-3xl font-serif font-light text-[#111111] uppercase tracking-wider bg-transparent focus:outline-none w-full"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleUpdateField("title", editValue)}
                className="p-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition shrink-0"
              >
                <Check className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="p-2 bg-gray-50 text-gray-500 rounded hover:bg-gray-100 transition shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1>{product.title}</h1>
              <button
                type="button"
                onClick={() => startEditing("title", product.title)}
                className="text-gray-400 hover:text-gray-600 transition self-center pt-1 shrink-0"
              >
                <Pencil className="size-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[#868686] font-sans">
            Status:
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSaving.status}
              className="border border-[#E5E5E5] rounded-full pl-4 pr-10 py-1.5 text-sm bg-white font-semibold text-gray-900 focus:outline-none focus:border-[#bec36c] disabled:opacity-50 select-none cursor-pointer min-w-[120px] transition-all hover:bg-gray-50 flex items-center justify-between text-left"
            >
              <span>
                {product.status?.charAt(0).toUpperCase() +
                  product.status?.slice(1)}
              </span>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 pointer-events-none">
                <svg
                  className="size-4 animate-in fade-in"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-full min-w-[120px] bg-white border border-[#E5E5E5] rounded-[8px] shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateField("status", "active");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${
                      product.status === "active"
                        ? "bg-[#627426]/10 text-[#627426]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateField("status", "draft");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${
                      product.status === "draft"
                        ? "bg-[#627426]/10 text-[#627426]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans">
            Images
          </h4>
          <div>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleUploadImage}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImage}
              className="px-3 py-1.5 bg-[#627426] text-white text-xs font-semibold rounded-[6px] hover:bg-[#627426]/90 transition inline-flex items-center gap-1.5 cursor-pointer select-none"
            >
              {isUploadingImage ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              Add Image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {product.images?.length > 0 ? (
            product.images.map((img: any, index: number) => (
              <div
                key={img.src || index}
                className="group relative aspect-square bg-[#FAF9F6] border border-[#EEEEEE] rounded-[12px] overflow-hidden flex items-center justify-center p-3"
              >
                <img
                  src={img.src}
                  alt=""
                  className="size-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.src)}
                  className="absolute top-2 right-2 p-1.5 bg-white text-red-600 rounded-full shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-2 col-span-full">
              No images uploaded
            </p>
          )}
        </div>
      </div>

      {/* Videos Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans">
            Videos
          </h4>
          <div>
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleUploadVideo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploadingVideo}
              className="px-3 py-1.5 bg-[#627426] text-white text-xs font-semibold rounded-[6px] hover:bg-[#627426]/90 transition inline-flex items-center gap-1.5 cursor-pointer select-none"
            >
              {isUploadingVideo ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              Add Video
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {product.media?.filter((m: any) => m.type === "video").length > 0 ? (
            product.media
              ?.filter((m: any) => m.type === "video")
              .map((vid: any, index: number) => (
                <div
                  key={vid.src || index}
                  className="group relative aspect-square bg-black border border-[#EEEEEE] rounded-[12px] overflow-hidden flex items-center justify-center"
                >
                  <video
                    src={getVideoSrc(vid.src)}
                    className="size-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(vid.src)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-red-600 rounded-full shadow border border-gray-100 z-10 opacity-0 group-hover:opacity-100 transition hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
          ) : (
            <p className="text-xs text-gray-400 py-2 col-span-full">
              No videos uploaded
            </p>
          )}
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Product Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-6 text-sm">
          {/* MSRP */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              MSRP Price ($)
            </span>
            {editingField === "msrp" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField("msrp", editValue)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {formatPrice(product.variants?.[0]?.price)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing("msrp", product.variants?.[0]?.price || "")
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Wholesale Price */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Wholesale Price ($)
            </span>
            {editingField === "wholesalePrice" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField("wholesalePrice", editValue)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {formatPrice(product.wholesalePrice)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing("wholesalePrice", product.wholesalePrice || "")
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Inventory Quantity
            </span>
            {editingField === "inventory" ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField("inventory", editValue)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {product.variants?.[0]?.inventory_quantity ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing(
                      "inventory",
                      String(product.variants?.[0]?.inventory_quantity ?? 0),
                    )
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Item Number (renamed from SKU) */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Item Number
            </span>
            {editingField === "sku" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField("sku", editValue)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {product.variants?.[0]?.sku || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing("sku", product.variants?.[0]?.sku || "")
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Metal (Variant 1) */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Metal (Variant 1)
            </span>
            {editingField === "variant1" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField("variant1", editValue)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {product.variants?.[0]?.option1 || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing(
                      "variant1",
                      product.variants?.[0]?.option1 || "",
                    )
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Gemstones (Variant 2) */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Gemstones (Variant 2)
            </span>
            {editingField === "variant2" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField("variant2", editValue)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {product.variants?.[0]?.option2 || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing(
                      "variant2",
                      product.variants?.[0]?.option2 || "",
                    )
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Diamond Shape Details */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Diamond Shape Details
            </span>
            {editingField === "diamondShapeDetails" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#bec36c]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateField("diamondShapeDetails", editValue)
                  }
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8">
                <span className="font-semibold text-[#111111] text-base truncate">
                  {product.diamondShapeDetails || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startEditing(
                      "diamondShapeDetails",
                      product.diamondShapeDetails || "",
                    )
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Product Type (Read-only) */}
          <div className="space-y-1">
            <span className="text-[#868686] text-xs font-semibold uppercase tracking-wider">
              Product Type
            </span>
            <div className="flex justify-between items-center gap-2 border-b border-gray-200/40 pb-1 h-8 text-gray-500 select-none">
              <span className="font-semibold text-gray-800 text-base truncate">
                {product.product_type || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Description
        </h4>
        <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-6 text-sm relative">
          {editingField === "body_html" ? (
            <div className="space-y-3">
              <textarea
                className="border rounded p-3 text-sm bg-white w-full min-h-[150px] focus:outline-none focus:border-[#bec36c]"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateField("body_html", editValue)}
                  className="px-3 py-1.5 bg-[#627426] text-white text-xs font-semibold rounded-[4px] hover:bg-[#627426]/90 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="size-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border text-gray-700 text-xs font-semibold rounded-[4px] transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="size-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group flex justify-between gap-4">
              <p className="whitespace-pre-line text-gray-700 font-sans leading-relaxed">
                {product.body_html || "No description provided."}
              </p>
              <button
                type="button"
                onClick={() =>
                  startEditing("body_html", product.body_html || "")
                }
                className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Diamond and Gemstone Details Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Diamond and Gemstone Details
        </h4>
        <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-6 text-sm relative">
          {editingField === "gemstoneDetails" ? (
            <div className="space-y-3">
              <textarea
                className="border rounded p-3 text-sm bg-white w-full min-h-[150px] focus:outline-none focus:border-[#bec36c]"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateField("gemstoneDetails", editValue)
                  }
                  className="px-3 py-1.5 bg-[#627426] text-white text-xs font-semibold rounded-[4px] hover:bg-[#627426]/90 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="size-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border text-gray-700 text-xs font-semibold rounded-[4px] transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="size-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group flex justify-between gap-4">
              <p className="whitespace-pre-line text-gray-700 font-sans leading-relaxed">
                {product.gemstoneDetails || "No gemstone details provided."}
              </p>
              <button
                type="button"
                onClick={() =>
                  startEditing("gemstoneDetails", product.gemstoneDetails || "")
                }
                className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forms from linesheet, collections, categories */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Linesheet PDF
        </h4>
        <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-5">
          <LinesheetForm
            productId={String(product.id)}
            initialLink={product.linesheetLink || null}
            productName={product.title}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Lab Reports / Certificates PDF
        </h4>
        <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-5">
          <CertificateForm
            productId={String(product.id)}
            initialLink={product.certificatesLink || null}
            productName={product.title}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Collections
        </h4>
        <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-5">
          <ProductCollectionsForm
            productId={String(product.id)}
            initialCollections={product.collections || []}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
          Categories
        </h4>
        <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-5">
          <ProductCategoriesForm
            productId={String(product.id)}
            initialCategories={product.categories || []}
          />
        </div>
      </div>
    </div>
  );
}
