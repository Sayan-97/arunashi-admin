"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";

export default function AboutAdminPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAbout = () => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setContent(json.data.content);
        }
      })
      .catch((err) => console.error("Error fetching about details:", err))
      .finally(() => setLoading(false));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchAbout runs on mount
  useEffect(() => {
    fetchAbout();
  }, []);

  // Listen to realtime updates in admin page
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchAbout is stable
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === "about:updated") {
        fetchAbout();
      }
    };
    window.addEventListener("realtime-sync", handleRealtime);
    return () => {
      window.removeEventListener("realtime-sync", handleRealtime);
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("About Us page updated successfully!");
      } else {
        toast.error(data.error || "Failed to update about details");
      }
    } catch (_err) {
      toast.error("An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const renderMarkdown = (markdown: string) => {
    if (!markdown) return null;
    const lines = markdown.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }

      if (
        line.startsWith("### ") ||
        line.startsWith("## ") ||
        line.startsWith("# ")
      ) {
        const text = line.replace(/^#+\s+/, "");
        elements.push(
          <h3
            key={`h-${i}`}
            className="text-[15px] font-bold text-[#111] uppercase mt-6 mb-4 tracking-widest font-sans border-b border-black/5 pb-2"
          >
            {text}
          </h3>,
        );
      } else {
        elements.push(
          <p
            key={`p-${i}`}
            className="text-[#555] text-[14px] leading-[1.8] mb-6 font-light"
          >
            {line}
          </p>,
        );
      }
    }

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <h1 className="text-2xl font-medium text-[#111111] font-sans">
          About Us (Why Arunashi)
        </h1>
        <NotificationMenu />
      </header>

      {/* Toolbar / Actions */}
      <div className="h-[64px] border-b border-[#EEEEEE] px-10 flex items-center justify-between shrink-0 bg-[#FAF9F6]/20">
        <div className="text-sm text-[#868686]">
          Edit raw markdown on the left, live preview on the right.
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#627426] hover:bg-[#4d5c1e] text-white px-6 py-2 rounded-[6px] font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>

      {/* Main Split Editor */}
      <div className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#868686]">
            Loading About Us details...
          </div>
        ) : (
          <>
            {/* Editor Pane (Left) */}
            <div className="w-1/2 h-full border-r border-[#EEEEEE] flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 p-8 outline-none resize-none font-mono text-[14px] leading-relaxed text-[#333] bg-[#FAF9F6]/10 focus:bg-white transition-colors"
                placeholder="Write About Us details using Markdown..."
              />
            </div>

            {/* Live Preview Pane (Right) */}
            <div className="w-1/2 h-full overflow-y-auto p-10 bg-[#FAF9F6]/10">
              <div className="max-w-[760px] mx-auto bg-white p-10 border border-[#EEEEEE] rounded-[8px] shadow-sm select-text">
                {/* Title Preview */}
                <h1 className="text-center font-nunito text-[36px] leading-tight uppercase tracking-wider mb-10 text-foreground">
                  About Us
                </h1>

                {/* Body Preview */}
                <div className="pt-2">{renderMarkdown(content)}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
