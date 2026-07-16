"use client";

import { Link as LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";

interface Magazine {
  id: string;
  link: string;
  image?: string;
  issueNumber?: string | null;
  date: string;
  createdAt: string;
}

export default function MagazinesClient({
  initialMagazines,
}: {
  initialMagazines: Magazine[];
}) {
  const [magazines, setMagazines] = useState<Magazine[]>(initialMagazines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [link, setLink] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMagazines(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load magazines");
    }
  };

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchMagazines only runs once to setup listener
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === "magazines:updated") {
        fetchMagazines();
      }
    };
    window.addEventListener("realtime-sync", handleRealtime);
    return () => {
      window.removeEventListener("realtime-sync", handleRealtime);
    };
  }, []);

  const openEditModal = (mag: Magazine) => {
    const d = new Date(mag.date);
    setMonth((d.getMonth() + 1).toString());
    setYear(d.getFullYear().toString());
    setLink(mag.link);
    setIssueNumber(mag.issueNumber || "");
    setImageFile(null);
    setEditingId(mag.id);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setMonth("");
    setLink("");
    setIssueNumber("");
    setImageFile(null);
    setPdfFile(null);
    setYear(new Date().getFullYear().toString());
  };

  const handleAddMagazine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month || !year) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!editingId && !link && !pdfFile) {
      toast.error("Please select a PDF file or enter a Canva link");
      return;
    }
    if (
      !editingId &&
      !imageFile &&
      !pdfFile &&
      (!link || !link.startsWith("/public/uploads/"))
    ) {
      toast.error(
        "Please select a cover image or upload a PDF to auto-generate one",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const dateStr = `${year}-${month.padStart(2, "0")}-01`;

      const formData = new FormData();
      formData.append("date", dateStr);
      if (issueNumber) formData.append("issueNumber", issueNumber);
      if (pdfFile) {
        formData.append("pdf", pdfFile);
      } else {
        formData.append("link", link);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = editingId ? `/api/magazines/${editingId}` : "/api/magazines";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save magazine");

      toast.success(
        editingId
          ? "Magazine updated successfully"
          : "Magazine added successfully",
      );
      closeAndResetModal();
      fetchMagazines();
    } catch (error) {
      console.error(error);
      toast.error(
        editingId ? "Failed to update magazine" : "Failed to add magazine",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this magazine?")) return;

    try {
      const res = await fetch(`/api/magazines/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Magazine deleted");
      fetchMagazines(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete magazine");
    }
  };

  // Group magazines by year
  const groupedMagazines = magazines.reduce(
    (acc, mag) => {
      const y = new Date(mag.date).getFullYear().toString();
      if (!acc[y]) acc[y] = [];
      acc[y].push(mag);
      return acc;
    },
    {} as Record<string, Magazine[]>,
  );

  // Sort years descending
  const sortedYears = Object.keys(groupedMagazines).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden relative">
      {/* Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-[#111111] font-sans">
            Magazines
          </h1>
          <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#627426] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {magazines.length} Total
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-[6px] bg-[#627426] hover:bg-[#627426]/90 disabled:opacity-50 text-white transition-all text-sm font-semibold cursor-pointer"
          >
            <Plus className="size-4" />
            Add Magazine
          </button>
          <NotificationMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-[#FAF9F6]/30">
        {magazines.length === 0 ? (
          <div className="text-center py-20 text-[#868686]">
            No magazines added yet.
          </div>
        ) : (
          <div className="w-full space-y-12">
            {sortedYears.map((y) => (
              <div key={y} className="space-y-4">
                <h2 className="text-xl font-semibold text-[#111111] border-b border-[#EEEEEE] pb-2">
                  {y}
                </h2>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10">
                  {groupedMagazines[y]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((mag) => {
                      const dateObj = new Date(mag.date);
                      const monthName = dateObj.toLocaleString("default", {
                        month: "long",
                      });

                      return (
                        <div
                          key={mag.id}
                          className="w-full sm:w-[340px] sm:shrink-0 bg-white border border-[#EEEEEE] rounded-[10px] p-5 shadow-sm flex flex-col group hover:shadow-md transition-shadow gap-4"
                        >
                          {mag.image && (
                            <div className="w-full aspect-[3/4] h-auto rounded-md overflow-hidden bg-[#F8F8F8] shrink-0">
                              <img
                                src={
                                  mag.image.startsWith("http")
                                    ? mag.image
                                    : mag.image
                                }
                                alt="Cover"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-medium text-[16px] text-[#111111]">
                                  {monthName} {y}
                                </h3>
                                {mag.issueNumber && (
                                  <p className="text-[12px] text-[#868686] mt-1">
                                    Issue No. {mag.issueNumber}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(mag)}
                                  className="text-[#868686] hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                  title="Edit Magazine"
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
                                  onClick={() => handleDelete(mag.id)}
                                  className="text-[#868686] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                  title="Delete Magazine"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                            <a
                              href={mag.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[14px] text-blue-600 hover:text-blue-800 hover:underline truncate"
                            >
                              <LinkIcon className="size-4 shrink-0" />
                              <span className="truncate">
                                {mag.link.startsWith("/public/uploads/")
                                  ? mag.link.split("/").pop()
                                  : mag.link}
                              </span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAF9F6]">
              <h2 className="text-lg font-semibold text-[#111111]">
                {editingId ? "Edit Magazine" : "Add Magazine"}
              </h2>
              <button
                type="button"
                onClick={closeAndResetModal}
                className="text-[#868686] hover:text-black text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddMagazine} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3a3a3a]">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                    required
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3a3a3a]">
                    Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                    required
                    min="2000"
                    max="2100"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Issue Number (Optional)
                </label>
                <input
                  type="text"
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(e.target.value)}
                  placeholder="e.g. Issue 12"
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Magazine PDF File
                </label>
                {link?.startsWith("/public/uploads/") ? (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-[6px] border border-[#E5E5E5] flex items-center justify-between mb-2">
                    <span className="truncate max-w-[200px]">
                      {link.split("/").pop()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLink("")}
                      className="text-red-600 hover:text-red-800 underline font-medium text-xs cursor-pointer"
                    >
                      Replace File
                    </button>
                  </div>
                ) : null}
                {(!link || !link.startsWith("/public/uploads/")) && (
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPdfFile(e.target.files[0]);
                      }
                    }}
                    className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426] file:border-0 file:bg-transparent file:text-sm file:font-medium file:pt-1.5"
                    required={!editingId && !link}
                  />
                )}
              </div>

              {!pdfFile && (!link || !link.startsWith("/public/uploads/")) && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#3a3a3a]">
                    Or Canva Link
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://canva.link/..."
                    className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#3a3a3a]">
                  Cover Image{" "}
                  {pdfFile || link?.startsWith("/public/uploads/")
                    ? "(Optional - Auto-generated from PDF)"
                    : ""}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                  }}
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E5] rounded-[6px] text-sm text-black focus:outline-none focus:border-[#627426] file:border-0 file:bg-transparent file:text-sm file:font-medium file:pt-1.5"
                  required={
                    !editingId &&
                    !pdfFile &&
                    (!link || !link.startsWith("/public/uploads/"))
                  }
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
                  Save Magazine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
