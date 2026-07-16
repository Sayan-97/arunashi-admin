"use client";

import { Link as LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";

interface Diamond {
  id: string;
  name: string;
  link: string;
  createdAt: string;
}

export default function DiamondsClient({
  initialDiamonds,
}: {
  initialDiamonds: Diamond[];
}) {
  const [diamonds, setDiamonds] = useState<Diamond[]>(initialDiamonds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchDiamonds = async () => {
    try {
      const res = await fetch("/api/diamonds");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDiamonds(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load diamonds");
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchDiamonds only runs once to setup listener
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === "diamonds:updated") {
        fetchDiamonds();
      }
    };
    window.addEventListener("realtime-sync", handleRealtime);
    return () => {
      window.removeEventListener("realtime-sync", handleRealtime);
    };
  }, []);

  const openEditModal = (diamond: Diamond) => {
    setName(diamond.name);
    setLink(diamond.link);
    setEditingId(diamond.id);
    setFile(null);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setLink("");
    setFile(null);
  };

  const handleSaveDiamond = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !file) {
      toast.error("Please select a PDF file to upload");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/diamonds/${editingId}` : "/api/diamonds";
      const method = editingId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("name", name);
      if (file) {
        formData.append("pdf", file);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save diamond");
      }

      toast.success(
        editingId
          ? "Diamond updated successfully"
          : "Diamond added successfully",
      );
      closeAndResetModal();
      fetchDiamonds();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error as Error).message ||
          (editingId ? "Failed to update diamond" : "Failed to add diamond"),
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
          <NotificationMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-[#FAF9F6]/30">
        {diamonds.length === 0 ? (
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
                    <span className="truncate">View PDF File</span>
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
                  Diamond Shape / Color Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Derived from PDF name if left blank"
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  PDF File
                </label>
                {editingId && link && !file ? (
                  <div className="border border-[#EEEEEE] rounded-[8px] p-3 bg-[#FAF9F6]/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <svg
                        className="size-5 text-red-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <span className="text-sm text-[#111111] font-medium truncate">
                        {link.split("/").pop()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLink("")}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold shrink-0 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                          // If name is empty, auto fill with parsed filename
                          if (!name) {
                            const rawName = e.target.files[0].name
                              .replace(/^diamond\s+/i, "")
                              .replace(/\.pdf$/i, "")
                              .trim();
                            const derivedName = rawName
                              .split(/\s+/)
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ");
                            setName(derivedName);
                          }
                        }
                      }}
                      className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426] flex items-center pt-1.5"
                      required={!link}
                    />
                    {editingId && (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-[#868686]">
                          Select a new PDF to replace the current one.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const dia = diamonds.find(
                              (d) => d.id === editingId,
                            );
                            if (dia) {
                              setLink(dia.link);
                              setFile(null);
                            }
                          }}
                          className="text-xs text-[#627426] hover:underline cursor-pointer"
                        >
                          Keep original file
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
