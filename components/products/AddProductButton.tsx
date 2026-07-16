"use client";

import {
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function AddProductButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [msrp, setMsrp] = useState("");
  const [inventory, setInventory] = useState("0");
  const [variant1, setVariant1] = useState("");
  const [variant2, setVariant2] = useState("");
  const [description, setDescription] = useState("");
  const [gemstoneDetails, setGemstoneDetails] = useState("");
  const [diamondShapeDetails, setDiamondShapeDetails] = useState("");
  const [status, setStatus] = useState("draft");

  // Collections & Categories state
  const [allCollections, setAllCollections] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Linesheet file state
  const [linesheetFile, setLinesheetFile] = useState<File | null>(null);
  const linesheetInputRef = useRef<HTMLInputElement>(null);

  // Media files state
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Fetch collections and categories on open
  useEffect(() => {
    if (isOpen) {
      fetch("/api/products/collections")
        .then((res) => res.json())
        .then((json) => setAllCollections(json.data || []))
        .catch((err) => console.error("Error fetching collections:", err));

      fetch("/api/products/categories")
        .then((res) => res.json())
        .then((json) => setAllCategories(json.data || []))
        .catch((err) => console.error("Error fetching categories:", err));
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setSku("");
    setMsrp("");
    setInventory("0");
    setVariant1("");
    setVariant2("");
    setDescription("");
    setGemstoneDetails("");
    setDiamondShapeDetails("");
    setStatus("draft");
    setSelectedCollections([]);
    setSelectedCategories([]);
    setLinesheetFile(null);
    setImages([]);
    setVideos([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos([...videos, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleRemoveVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sku || !msrp) {
      toast.error("Please fill in all required fields (Title, SKU, MSRP)");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Creating product...");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("sku", sku);
      formData.append("msrp", msrp);
      formData.append("inventory", inventory);
      formData.append("variant1", variant1);
      formData.append("variant2", variant2);
      formData.append("body_html", description);
      formData.append("gemstoneDetails", gemstoneDetails);
      formData.append("diamondShapeDetails", diamondShapeDetails);
      formData.append("status", status);
      if (linesheetFile) {
        formData.append("linesheet", linesheetFile);
      }
      formData.append("collectionIds", JSON.stringify(selectedCollections));
      formData.append("categoryIds", JSON.stringify(selectedCategories));

      // Append files
      for (const img of images) {
        formData.append("images", img);
      }
      for (const vid of videos) {
        formData.append("videos", vid);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const _responseData = await res.json();
      toast.success("Product created successfully", { id: toastId });
      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#627426] hover:bg-[#627426]/90 text-white rounded-full text-sm font-semibold shadow-sm transition-all cursor-pointer border border-transparent"
      >
        <Plus className="size-4" />
        <span>Add Product</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="h-[84px] px-8 border-b border-[#EEEEEE] flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900 font-sans">
                  Create New Product
                </h3>
                <p className="text-xs text-gray-500">
                  Manually add a product to the catalog
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
            >
              {/* Row 1: Title & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lotus Flower Diamond Bracelet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    SKU / Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LFD-BRAC-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Row 2: MSRP, Wholesale, Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    MSRP Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5200"
                    value={msrp}
                    onChange={(e) => setMsrp(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Inventory Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Metal & Gemstones (Variants) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Metal (Variant 1)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18K Yellow Gold"
                    value={variant1}
                    onChange={(e) => setVariant1(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Gemstones (Variant 2)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White Diamond & Blue Sapphire"
                    value={variant2}
                    onChange={(e) => setVariant2(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Gemstone Details & Diamond Shape Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Gemstone Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sapphire, Tsavorite"
                    value={gemstoneDetails}
                    onChange={(e) => setGemstoneDetails(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Diamond Shape Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asscher Cut, Emerald Cut"
                    value={diamondShapeDetails}
                    onChange={(e) => setDiamondShapeDetails(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Collections & Categories Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                    Collections
                  </label>
                  <div className="border rounded p-3 bg-white max-h-[140px] overflow-y-auto space-y-2 scrollbar-thin">
                    {allCollections.length > 0 ? (
                      allCollections.map((col: any) => (
                        <label
                          key={col.id}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCollections.includes(col.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCollections([
                                  ...selectedCollections,
                                  col.id,
                                ]);
                              } else {
                                setSelectedCollections(
                                  selectedCollections.filter(
                                    (id: string) => id !== col.id,
                                  ),
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-[#627426] focus:ring-[#627426]"
                          />
                          <span>{col.title}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">
                        Loading collections...
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                    Categories
                  </label>
                  <div className="border rounded p-3 bg-white max-h-[140px] overflow-y-auto space-y-2 scrollbar-thin">
                    {allCategories.length > 0 ? (
                      allCategories.map((cat: any) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([
                                  ...selectedCategories,
                                  cat.id,
                                ]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter(
                                    (id: string) => id !== cat.id,
                                  ),
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-[#627426] focus:ring-[#627426]"
                          />
                          <span>{cat.title}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">
                        Loading categories...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm bg-white font-medium"
                >
                  <option value="draft">Draft (Hidden from storefront)</option>
                  <option value="active">Active (Visible on storefront)</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Enter details of the product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm bg-white min-h-[100px]"
                />
              </div>

              {/* Linesheet Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Linesheet PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  ref={linesheetInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const selected = e.target.files[0];
                      if (selected.type !== "application/pdf") {
                        toast.error(
                          "Only PDF files are allowed for linesheets",
                        );
                        return;
                      }
                      setLinesheetFile(selected);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => linesheetInputRef.current?.click()}
                    className="h-10 px-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[6px] text-xs font-semibold text-gray-700 inline-flex items-center transition cursor-pointer select-none"
                  >
                    Choose PDF
                  </button>
                  <span className="text-xs text-gray-500 truncate flex-1">
                    {linesheetFile
                      ? linesheetFile.name
                      : "No linesheet PDF selected"}
                  </span>
                  {linesheetFile && (
                    <button
                      type="button"
                      onClick={() => setLinesheetFile(null)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Media File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="h-10 border border-dashed border-gray-300 rounded-[6px] hover:border-gray-400 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition bg-white select-none cursor-pointer"
                    >
                      <Upload className="size-4" />
                      <span>Select Images</span>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {images.map((_img, idx) => (
                        <div
                          key={idx}
                          className="relative size-12 bg-gray-50 border rounded flex items-center justify-center p-1 group"
                        >
                          <ImageIcon className="size-5 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Videos Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Product Videos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="h-10 border border-dashed border-gray-300 rounded-[6px] hover:border-gray-400 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition bg-white select-none cursor-pointer"
                    >
                      <Upload className="size-4" />
                      <span>Select Videos</span>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {videos.map((_vid, idx) => (
                        <div
                          key={idx}
                          className="relative size-12 bg-gray-50 border rounded flex items-center justify-center p-1 group"
                        >
                          <VideoIcon className="size-5 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(idx)}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="h-[84px] px-8 border-t border-[#EEEEEE] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                disabled={isSaving}
                className="px-4 py-2 border rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 select-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2 bg-[#627426] hover:bg-[#627426]/90 text-white rounded-full text-sm font-semibold shadow-sm transition disabled:opacity-50 select-none cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
