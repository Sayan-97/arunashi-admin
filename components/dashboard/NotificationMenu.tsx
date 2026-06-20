"use client";

import { Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("arunashi_admin_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse notifications from localStorage", err);
      }
    }
  }, []);

  // Save to localStorage helper
  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    localStorage.setItem(
      "arunashi_admin_notifications",
      JSON.stringify(updated),
    );
  };

  // Listen to realtime custom browser events
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      let newNotification: NotificationItem | null = null;

      if (detail.type === "retailers:submitted") {
        newNotification = {
          id: detail.data?.id || `retailer-${Date.now()}`,
          type: "retailer_request",
          title: "New Retailer Registration",
          message: `${detail.data?.name || "A retailer"} (${detail.data?.company || "N/A"}) has submitted an onboarding request.`,
          link: "/retailers/pending-approvals",
          createdAt: new Date().toISOString(),
          read: false,
        };
      } else if (detail.type === "requests:submitted") {
        newNotification = {
          id: detail.data?.id || `request-${Date.now()}`,
          type: "product_request",
          title: "New Product Request",
          message: `Product linesheet request submitted by ${detail.data?.user?.company || detail.data?.user?.name || "a retailer"}.`,
          link: "/requests/pending-requests",
          createdAt: new Date().toISOString(),
          read: false,
        };
      }

      if (newNotification) {
        const itemToAdd = newNotification;
        setNotifications((prev) => {
          const updated = [itemToAdd, ...prev];
          localStorage.setItem(
            "arunashi_admin_notifications",
            JSON.stringify(updated),
          );
          return updated;
        });
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

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    const updated = notifications.map((n) =>
      n.id === item.id ? { ...n, read: true } : n,
    );
    saveNotifications(updated);
    setIsOpen(false);
    router.push(item.link);
  };

  const clearAll = () => {
    saveNotifications([]);
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
            {notifications.length === 0 ? (
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
          {notifications.length > 0 && (
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
