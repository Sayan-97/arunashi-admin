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

interface Category {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: { url: string } | null;
  productIds: string[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/products/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    fetchCategories();
  }, []);

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

  const openEditModal = (cat: Category) => {
    setName(cat.title);
    setHandle(cat.handle);
    setDescription(cat.description || "");
    setImageFile(null);
    setImagePreview(cat.image?.url || null);
    setEditingId(cat.id);
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) {
      toast.error("Name and handle are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `/api/products/categories/${editingId}`
        : "/api/products/categories";
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
        throw new Error(errorData.message || "Failed to save category");
      }

      toast.success(
        editingId
          ? "Category updated successfully"
          : "Category added successfully",
      );
      closeAndResetModal();
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This will unlink all products.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/products/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const filteredCategoriesList = categories.filter((cat) => {
    const search = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(search) ||
      cat.handle.toLowerCase().includes(search) ||
      cat.description?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <FolderOpen className="size-6 text-[#627426]" />
          <h2 className="text-xl font-medium tracking-wide text-gray-900 font-sans">
            Categories Directory
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <NotificationMenu />
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#627426] hover:bg-[#4F5D1E] text-white text-sm font-semibold tracking-wide px-5 py-3 rounded-[8px] transition-colors"
          >
            <Plus className="size-4" />
            Add Category
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-[#FCFBF8]/40 select-none">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search categories by name, handle, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-[480px] bg-white border border-[#EEEEEE] rounded-[8px] px-4 py-3 text-sm focus:outline-none focus:border-[#627426] placeholder:text-[#A1A1A1] transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-3">
            <Loader2 className="size-8 text-[#627426] animate-spin" />
            <p className="text-sm text-gray-500">Loading categories...</p>
          </div>
        ) : filteredCategoriesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-[#EEEEEE] rounded-[12px] bg-white">
            <FolderOpen className="size-12 text-gray-300 mb-3" />
            <p className="text-gray-900 font-semibold mb-1">
              No Categories Found
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search query."
                : "Get started by adding your first category."}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="bg-[#627426] hover:bg-[#4F5D1E] text-white text-xs font-semibold px-4 py-2.5 rounded-[6px] transition-colors"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategoriesList.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-[#EEEEEE] rounded-[12px] overflow-hidden shadow-sm flex flex-col group hover:border-[#627426]/50 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative h-[200px] bg-[#FAF9F6] border-b border-[#EEEEEE] overflow-hidden flex items-center justify-center">
                  {cat.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[#A1A1A1] gap-2">
                      <ImageIcon className="size-10 stroke-[1.2]" />
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-[2px] text-white text-[11px] font-semibold font-sans px-2.5 py-1 rounded-[20px]">
                    {cat.productIds.length}{" "}
                    {cat.productIds.length === 1 ? "Product" : "Products"}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#627426] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                      Handle: {cat.handle}
                    </p>
                    {cat.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#EEEEEE] pt-4 mt-5">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#627426] font-semibold transition-colors"
                    >
                      <Edit2 className="size-3.5" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="size-8 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
          <div className="bg-white border border-[#EEEEEE] rounded-[16px] w-full max-w-[540px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-[#EEEEEE] flex items-center justify-between">
              <h3 className="font-medium text-lg text-gray-900 font-sans">
                {editingId ? "Edit Category Details" : "Add New Category"}
              </h3>
              <button
                onClick={closeAndResetModal}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveCategory} className="p-8 space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rings, Necklaces, Emeralds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-[8px] px-4 py-3 text-sm focus:outline-none focus:border-[#627426] placeholder:text-[#C1C1C1] transition-colors"
                />
              </div>

              {/* URL Handle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  URL Handle (Slug)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rings"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#EEEEEE] rounded-[8px] px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#627426] font-mono transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe this category profile..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-[8px] px-4 py-3 text-sm focus:outline-none focus:border-[#627426] placeholder:text-[#C1C1C1] leading-relaxed transition-colors resize-none"
                />
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Category Image Banner
                </label>
                <div className="flex gap-5 items-center">
                  <div className="relative size-[100px] bg-[#FAF9F6] border border-[#EEEEEE] rounded-[8px] overflow-hidden flex items-center justify-center text-[#A1A1A1]">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-8 stroke-[1.2]" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      id="category-image-file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="category-image-file"
                      className="inline-block bg-[#FAF9F6] hover:bg-[#EEEEEE] border border-[#EEEEEE] rounded-[6px] text-xs font-semibold px-4 py-2.5 cursor-pointer text-gray-800 transition-colors"
                    >
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Recommended: JPG or PNG, max size 10MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEEEE] mt-6">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  disabled={isSubmitting}
                  className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold border border-[#EEEEEE] px-5 py-3 rounded-[8px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#627426] hover:bg-[#4F5D1E] text-white text-sm font-semibold px-6 py-3 rounded-[8px] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
