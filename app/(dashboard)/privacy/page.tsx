"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";

export default function PrivacyAdminPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrivacy = () => {
    fetch("/api/privacy")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setContent(json.data.content);
        }
      })
      .catch((err) => console.error("Error fetching privacy policy:", err))
      .finally(() => setLoading(false));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPrivacy runs on mount
  useEffect(() => {
    fetchPrivacy();
  }, []);

  // Listen to realtime updates in admin page
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPrivacy is stable
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === "privacy:updated") {
        fetchPrivacy();
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
      const res = await fetch("/api/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Privacy Policy updated successfully!");
      } else {
        toast.error(data.error || "Failed to update privacy policy");
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
    let listItems: React.ReactNode[] = [];
    let inList = false;

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={key}
            className="list-disc pl-6 mb-6 space-y-2 text-[#868686] text-[15px] font-light"
          >
            {listItems}
          </ul>,
        );
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        inList = true;
        const text = line.substring(2);
        listItems.push(<li key={`li-${i}`}>{text}</li>);
      } else {
        if (inList) {
          flushList(`list-${i}`);
          inList = false;
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
              className="text-[16px] font-bold text-[#111] uppercase mt-10 mb-4 tracking-widest font-sans border-b border-black/5 pb-2"
            >
              {text}
            </h3>,
          );
        } else {
          // Identify if paragraph starts with a bold key-value prefix, e.g. **Foo**: Bar
          const boldMatch = line.match(/^\*\*(.*?)\*\*:\s*(.*)/);
          if (boldMatch) {
            elements.push(
              <p
                key={`p-${i}`}
                className="text-[#868686] text-[15px] leading-[1.75] mb-6 font-light"
              >
                <strong className="font-bold text-[#111]">
                  {boldMatch[1]}:
                </strong>{" "}
                {boldMatch[2]}
              </p>,
            );
          } else {
            elements.push(
              <p
                key={`p-${i}`}
                className="text-[#868686] text-[15px] leading-[1.75] mb-6 font-light"
              >
                {line}
              </p>,
            );
          }
        }
      }
    }

    if (inList) {
      flushList("list-end");
    }

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <h1 className="text-2xl font-medium text-[#111111] font-sans">
          Privacy Policy
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
            Loading Privacy Policy...
          </div>
        ) : (
          <>
            {/* Editor Pane (Left) */}
            <div className="w-1/2 h-full border-r border-[#EEEEEE] flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 p-8 outline-none resize-none font-mono text-[14px] leading-relaxed text-[#333] bg-[#FAF9F6]/10 focus:bg-white transition-colors"
                placeholder="Write Privacy Policy using Markdown..."
              />
            </div>

            {/* Live Preview Pane (Right) */}
            <div className="w-1/2 h-full overflow-y-auto p-10 bg-[#FAF9F6]/10">
              <div className="max-w-[720px] mx-auto bg-white p-10 border border-[#EEEEEE] rounded-[8px] shadow-sm select-text">
                {/* Title Preview */}
                <h1 className="text-center font-fleur text-[40px] leading-tight uppercase tracking-wider mb-10 text-foreground">
                  Privacy Policy
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
