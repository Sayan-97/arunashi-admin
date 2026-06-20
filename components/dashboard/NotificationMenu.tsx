"use client";

import { Bell, BellOff, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NotificationItem {
  id: string;
  type: "retailer_request" | "product_request";
  title: string;
  message: string;
  link: string;
  createdAt: string;
  read: boolean;
}

export function NotificationMenu() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications from database on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      } catch (err) {
        console.error("Failed to load notifications from database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Listen to realtime custom browser events (SSE broadcasts)
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      // When a new database notification is created and broadcasted by the server
      if (detail.type === "notification:created") {
        const newNotification = detail.data;
        if (newNotification) {
          setNotifications((prev) => {
            // Prevent duplicate entries in the list
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });
        }
      }
    };

    window.addEventListener("realtime-sync", handleRealtime);
    return () => {
      window.removeEventListener("realtime-sync", handleRealtime);
    };
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    // Optimistic update
    const original = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setNotifications(original);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const original = [...notifications];

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    );
    setIsOpen(false);
    router.push(item.link);

    if (!item.read) {
      try {
        const res = await fetch(`/api/notifications/${item.id}/read`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to mark notification as read");
      } catch (err) {
        console.error(err);
        // Revert if API fails
        setNotifications(original);
      }
    }
  };

  const clearAll = async () => {
    // Optimistic update
    const original = [...notifications];
    setNotifications([]);

    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to clear notification history");
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setNotifications(original);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#3a3a3a] hover:text-black transition-colors rounded-full hover:bg-gray-50 cursor-pointer select-none"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-[#EEEEEE] rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#EEEEEE] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#111111]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#627426] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-[#627426] hover:text-[#627426]/80 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
              >
                <CheckCheck className="size-3" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto bg-[#FAF9F6]/20 divide-y divide-[#EEEEEE]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-[#868686]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <BellOff className="size-8 text-[#868686] opacity-40 mb-2" />
                <p className="text-xs text-[#868686] font-medium">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex gap-2.5 hover:bg-gray-50/70 transition-colors cursor-pointer text-left relative group ${
                    !item.read ? "bg-[#EEEEE2]/25" : ""
                  }`}
                >
                  {/* Unread Indication Dot */}
                  {!item.read && (
                    <span className="absolute top-4 right-4 size-2 rounded-full bg-[#627426]" />
                  )}

                  <div className="flex-1 min-w-0 pr-3">
                    <p
                      className={`text-xs font-semibold text-[#111111] truncate ${
                        !item.read ? "font-bold text-[#627426]" : ""
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#3a3a3a] mt-0.5 leading-relaxed break-words line-clamp-2">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-[#868686] mt-1.5 font-medium">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-[#EEEEEE] flex items-center justify-center bg-white">
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-[#868686] hover:text-red-500 font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="size-3" />
                Clear all history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationMenu;
