"use client";

import { Bell, Link as LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Diamond {
  id: string;
  name: string;
  link: string;
  createdAt: string;
}

export default function DiamondsPage() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [link, setLink] = useState("");

  const fetchDiamonds = async () => {
    try {
      const res = await fetch("/api/diamonds");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDiamonds(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load diamonds");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchDiamonds only needs to run on mount
  useEffect(() => {
    fetchDiamonds();
  }, []);

  const openEditModal = (diamond: Diamond) => {
    setName(diamond.name);
    setLink(diamond.link);
    setEditingId(diamond.id);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setLink("");
  };

  const handleSaveDiamond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !link) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/diamonds/${editingId}` : "/api/diamonds";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, link }),
      });

      if (!res.ok) throw new Error("Failed to save diamond");

      toast.success(
        editingId
          ? "Diamond updated successfully"
          : "Diamond added successfully",
      );
      closeAndResetModal();
      fetchDiamonds();
    } catch (error) {
      console.error(error);
      toast.error(
        editingId ? "Failed to update diamond" : "Failed to add diamond",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this diamond shape?")) return;

    try {
      const res = await fetch(`/api/diamonds/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Diamond shape deleted");
      fetchDiamonds();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete diamond");
    }
  };

  const sortedDiamonds = [...diamonds].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden relative">
      {/* Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-[#111111] font-sans">
            Diamonds
          </h1>
          <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#627426] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {diamonds.length} Total
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-[6px] bg-[#627426] hover:bg-[#627426]/90 disabled:opacity-50 text-white transition-all text-sm font-semibold cursor-pointer"
          >
            <Plus className="size-4" />
            Add Diamond
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
        ) : diamonds.length === 0 ? (
          <div className="text-center py-20 text-[#868686]">
            No diamonds added yet.
          </div>
        ) : (
          <div className="max-w-5xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDiamonds.map((diamond) => (
                <div
                  key={diamond.id}
                  className="bg-white border border-[#EEEEEE] rounded-[10px] p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow gap-4"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-[16px] text-[#111111] tracking-wide">
                      {diamond.name}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(diamond)}
                        className="text-[#868686] hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                        title="Edit Diamond"
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(diamond.id)}
                        className="text-[#868686] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                        title="Delete Diamond"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <a
                    href={diamond.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[14px] text-blue-600 hover:text-blue-800 hover:underline truncate mt-auto"
                  >
                    <LinkIcon className="size-4 shrink-0" />
                    <span className="truncate">{diamond.link}</span>
                  </a>
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
                {editingId ? "Edit Diamond" : "Add Diamond"}
              </h2>
              <button
                type="button"
                onClick={closeAndResetModal}
                className="text-[#868686] hover:text-black text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveDiamond} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Diamond Shape / Color Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diamond Ashoka Cut"
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Canva Link (Embed or Share URL)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://www.canva.com/design/..."
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="h-10 px-5 rounded-[6px] border border-[#E5E5E5] text-[#3a3a3a] hover:bg-gray-50 transition-all text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-[6px] bg-[#627426] hover:bg-[#627426]/90 disabled:opacity-50 text-white transition-all text-sm font-semibold cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Save Diamond
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
