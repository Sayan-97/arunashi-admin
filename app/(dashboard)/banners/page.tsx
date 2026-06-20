"use client";

import {
  Bell,
  Edit,
  Link as LinkIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Banner {
  id: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners/admin");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBanners(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchBanners only needs to run on mount
  useEffect(() => {
    fetchBanners();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchBanners only runs once to setup listener
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === "banners:updated") {
        fetchBanners();
      }
    };
    window.addEventListener("realtime-sync", handleRealtime);
    return () => {
      window.removeEventListener("realtime-sync", handleRealtime);
    };
  }, []);

  const openEditModal = (banner: Banner) => {
    setLink(banner.link || "");
    setIsActive(banner.isActive);
    setOrder(banner.order.toString());
    setImageFile(null);
    setEditingId(banner.id);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setLink("");
    setIsActive(true);
    setOrder("0");
    setImageFile(null);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !imageFile) {
      toast.error("Please select an image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("link", link);
      formData.append("isActive", isActive.toString());
      formData.append("order", order);
      if (imageFile) formData.append("image", imageFile);

      const url = editingId ? `/api/banners/${editingId}` : "/api/banners";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error response:", text);
        throw new Error(`Failed to save banner: ${text}`);
      }

      toast.success(
        editingId ? "Banner updated successfully" : "Banner added successfully",
      );
      closeAndResetModal();
      fetchBanners();
    } catch (error) {
      console.error(error);
      toast.error(
        editingId ? "Failed to update banner" : "Failed to add banner",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Banner deleted");
      fetchBanners(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/banners/${id}/toggle`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to toggle status");

      toast.success("Status updated");
      fetchBanners(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden relative">
      {/* Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-[#111111] font-sans">
            Banners
          </h1>
          <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#627426] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {banners.length} Total
          </span>
          <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {activeCount} Active
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-[6px] bg-[#627426] hover:bg-[#627426]/90 disabled:opacity-50 text-white transition-all text-sm font-semibold cursor-pointer"
          >
            <Plus className="size-4" />
            Add Banner
          </button>
          <button
            type="button"
            className="p-2 text-[#3a3a3a] hover:text-black transition-colors rounded-full hover:bg-gray-50"
          >
            <Bell className="size-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-[#FAF9F6]/30">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-[#868686]" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 text-[#868686]">
            No banners added yet.
          </div>
        ) : (
          <div className="max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`bg-white border ${
                    banner.isActive
                      ? "border-green-300 shadow-md ring-1 ring-green-100"
                      : "border-[#EEEEEE] shadow-sm"
                  } rounded-[10px] overflow-hidden flex flex-col group transition-all`}
                >
                  {/* Image Container */}
                  <div className="w-full h-40 bg-[#F8F8F8] shrink-0 relative">
                    <img
                      src={
                        banner.image.startsWith("http")
                          ? banner.image
                          : banner.image
                      }
                      alt="Banner"
                      className={`w-full h-full object-cover transition-all ${
                        banner.isActive
                          ? "opacity-100"
                          : "opacity-60 grayscale-[50%]"
                      }`}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(banner.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md transition-colors border ${
                          banner.isActive
                            ? "bg-green-500/90 text-white border-green-600 hover:bg-green-600"
                            : "bg-gray-500/90 text-white border-gray-600 hover:bg-gray-600"
                        }`}
                        title={
                          banner.isActive
                            ? "Click to Deactivate"
                            : "Click to Activate"
                        }
                      >
                        {banner.isActive ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-500">
                        Order: {banner.order}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(banner)}
                          className="text-[#868686] hover:text-blue-600 transition-colors p-1"
                          title="Edit Banner"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner.id)}
                          className="text-[#868686] hover:text-red-600 transition-colors p-1"
                          title="Delete Banner"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[14px] text-blue-600 hover:text-blue-800 hover:underline truncate"
                      >
                        <LinkIcon className="size-4 shrink-0" />
                        <span className="truncate">{banner.link}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-[14px] text-gray-400 truncate">
                        <LinkIcon className="size-4 shrink-0" />
                        <span className="truncate">No Link</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAF9F6]">
              <h2 className="text-lg font-semibold text-[#111111]">
                {editingId ? "Edit Banner" : "Add Banner"}
              </h2>
              <button
                type="button"
                onClick={closeAndResetModal}
                className="text-[#868686] hover:text-black text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddBanner} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Image {editingId && "(Leave empty to keep current)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-[#868686] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EEEEE2] file:text-[#627426] hover:file:bg-[#e4e4d5] cursor-pointer focus:outline-none"
                  required={!editingId}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3a3a3a]">
                    Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                    min="0"
                  />
                </div>

                <div className="flex flex-col justify-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#627426] border-[#E5E5E5] rounded focus:ring-[#627426]"
                    />
                    <span className="text-sm font-medium text-[#3a3a3a]">
                      Active Banner
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EEEEEE] mt-6">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="px-5 h-10 text-sm font-medium text-[#868686] hover:text-black hover:bg-gray-50 rounded-[6px] transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 h-10 text-sm font-medium text-white bg-[#627426] hover:bg-[#627426]/90 rounded-[6px] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {editingId ? "Update Banner" : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
