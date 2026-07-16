"use client";

import {
  Edit2,
  FolderOpen,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";

const getBackendUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: { url: string } | null;
  productIds: string[];
}

export default function CollectionsClient({
  initialCollections,
}: {
  initialCollections: Collection[];
}) {
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/products/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      const data = await res.json();
      setCollections(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load collections");
    }
  };

  // Sync handle dynamically from name when creating (not editing)
  useEffect(() => {
    if (!editingId) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setHandle(slug);
    }
  }, [name, editingId]);

  const openAddModal = () => {
    setName("");
    setHandle("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setName(col.title);
    setHandle(col.handle);
    setDescription(col.description || "");
    setImageFile(null);
    setImagePreview(col.image?.url || null);
    setEditingId(col.id);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setHandle("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) {
      toast.error("Name and handle are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `/api/products/collections/${editingId}`
        : "/api/products/collections";
      const method = editingId ? "PATCH" : "POST";

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("handle", handle.trim());
      formData.append("description", description.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save collection");
      }

      toast.success(
        editingId
          ? "Collection updated successfully"
          : "Collection added successfully",
      );
      closeAndResetModal();
      fetchCollections();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this collection? This will unlink all products.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/products/collections/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete collection");

      toast.success("Collection deleted successfully");
      fetchCollections();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete collection");
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden relative">
      {/* Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-[#111111] font-sans">
            Collections
          </h1>
          <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#627426] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {collections.length} Total
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationMenu />
          <button
            type="button"
            onClick={openAddModal}
            className="h-10 px-4 bg-[#627426] hover:bg-[#627426]/90 text-white font-semibold rounded-[6px] text-[14px] flex items-center gap-2 transition-all cursor-pointer select-none"
          >
            <Plus className="size-4" />
            Add Collection
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-[72px] shrink-0 px-10 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAF9F6]/40 select-none">
        <div className="w-80">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 border border-[#EEEEEE] rounded-[6px] text-sm focus:outline-none focus:border-[#627426] transition-colors placeholder:text-gray-400 bg-white"
          />
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#FAF9F6]/20">
        {filteredCollections.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-[#EEEEEE]">
              <FolderOpen className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No collections found
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {searchQuery
                ? "No collections match your search filter."
                : "Create your first collection to organize your products."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((col) => (
              <div
                key={col.id}
                className="bg-white border border-[#EEEEEE] rounded-[12px] overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                {/* Image Section */}
                <div className="aspect-[4/3] bg-[#FAF9F6] border-b border-[#EEEEEE] relative overflow-hidden flex items-center justify-center group-hover:opacity-95 transition-opacity">
                  {col.image?.url ? (
                    <img
                      src={
                        col.image.url.startsWith("http")
                          ? col.image.url
                          : `${getBackendUrl()}${col.image.url}`
                      }
                      alt={col.title}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-1.5 select-none">
                      <ImageIcon className="size-10 stroke-1" />
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-[#EEEEEE] text-[#627426] text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {col.productIds?.length || 0} Products
                  </span>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {col.title}
                    </h3>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Handle: {col.handle}
                    </p>
                    {col.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                        {col.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 border-t border-[#EEEEEE] pt-4 mt-auto">
                    <button
                      type="button"
                      onClick={() => openEditModal(col)}
                      className="flex-1 h-9 border border-[#EEEEEE] hover:bg-gray-50 text-gray-700 rounded-[6px] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                    >
                      <Edit2 className="size-3.5" />
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(col.id)}
                      className="h-9 w-9 border border-red-100 hover:bg-red-50 text-red-600 rounded-[6px] inline-flex items-center justify-center transition-colors cursor-pointer select-none"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EEEEEE] rounded-[16px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <header className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAF9F6]">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Collection" : "Add Collection"}
              </h2>
              <button
                type="button"
                onClick={closeAndResetModal}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold select-none cursor-pointer"
              >
                ✕
              </button>
            </header>
            <form onSubmit={handleSaveCollection} className="p-6 space-y-5">
              {/* Image Uploader */}
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Collection Banner Image
                </span>
                <div className="flex gap-4 items-center">
                  <div className="size-24 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[8px] overflow-hidden flex items-center justify-center relative">
                    {imagePreview ? (
                      <img
                        src={
                          imagePreview.startsWith("http") ||
                          imagePreview.startsWith("data:")
                            ? imagePreview
                            : `${getBackendUrl()}${imagePreview}`
                        }
                        alt="Preview"
                        decoding="async"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-8 text-gray-300 stroke-1" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="collection-image-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="collection-image-input"
                      className="h-9 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[6px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                    >
                      Choose Image
                    </label>
                    <p className="text-[10px] text-gray-400">
                      Supports JPG, PNG, WEBP, or GIF (max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Collection Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lotus Blossom Collection"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-4 border border-[#EEEEEE] rounded-[6px] text-sm focus:outline-none focus:border-[#627426] transition-colors"
                  required
                />
              </div>

              {/* Handle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  URL Handle (Slug)
                </label>
                <input
                  type="text"
                  placeholder="e.g. lotus-blossom-collection"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full h-10 px-4 border border-[#EEEEEE] rounded-[6px] text-sm focus:outline-none focus:border-[#627426] transition-colors bg-gray-50/50 font-mono"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Description
                </label>
                <textarea
                  placeholder="Introduce the signature elements of this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-3 border border-[#EEEEEE] rounded-[6px] text-sm focus:outline-none focus:border-[#627426] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Footer */}
              <footer className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEEEE] mt-6">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="h-10 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[6px] text-sm font-semibold select-none cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-[#627426] hover:bg-[#627426]/90 text-white font-semibold rounded-[6px] text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Create Collection"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
