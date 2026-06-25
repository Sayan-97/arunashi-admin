"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { revalidateRealtimeTags } from "@/actions/realtime";

export default function RealtimeSyncListener() {
  const router = useRouter();

  useEffect(() => {
    // Determine the SSE URL (direct connection in development to bypass Next.js middleware buffering)
    const getSseUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return `${process.env.NEXT_PUBLIC_API_URL}/api/realtime/stream`;
      }
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        return "http://localhost:8000/api/realtime/stream";
      }
      return "/api/realtime/stream";
    };

    const eventSource = new EventSource(getSseUrl());

    eventSource.onopen = () => {
      console.log("Real-time synchronization channel established.");
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        // Filter out keep-alive pings and connection handshakes
        if (payload.type === "ping" || payload.type === "connected") {
          return;
        }

        console.log("Real-time sync event received:", payload);

        // Identify cache tags to invalidate on Next.js server
        const tagsToRevalidate: string[] = [];
        if (payload.type === "retailers:submitted") {
          tagsToRevalidate.push("pending-approvals");
        } else if (payload.type === "retailers:approved") {
          tagsToRevalidate.push("pending-approvals", "approved-retailers");
        } else if (payload.type === "retailers:activated") {
          tagsToRevalidate.push("pending-approvals", "approved-retailers");
        } else if (
          payload.type === "requests:submitted" ||
          payload.type === "requests:updated"
        ) {
          tagsToRevalidate.push("product-requests");
        } else if (payload.type === "products:updated") {
          tagsToRevalidate.push("shopify-products");
        }

        // 1. Toast notifications for admin dashboard actions
        if (payload.type === "retailers:submitted") {
          toast.info(
            `New retailer registration request received from: ${payload.data?.email || "onboarding"}.`,
            {
              action: {
                label: "View Request",
                onClick: () => router.push("/retailers/pending-approvals"),
              },
            },
          );
        } else if (payload.type === "retailers:activated") {
          toast.success(
            `Retailer ${payload.data?.email || "onboarding"} has completed account activation.`,
            {
              action: {
                label: "View Retailer",
                onClick: () => router.push("/retailers/approved-retailers"),
              },
            },
          );
        } else if (payload.type === "requests:submitted") {
          toast.info(
            `A new product linesheet request has been submitted by ${payload.data?.user?.email || "a retailer"}.`,
            {
              action: {
                label: "View Request",
                onClick: () => router.push("/requests/pending-requests"),
              },
            },
          );
        } else if (payload.type === "requests:updated") {
          toast.success(
            `Product request status updated to: ${payload.data?.status || "processed"}.`,
          );
        }

        // 2. Trigger cache invalidation on server, then reload layout Server Components
        const refreshData = () => {
          router.refresh();
          // Dispatch a custom browser event so Client Components can trigger custom logic/data re-fetches
          const syncEvent = new CustomEvent("realtime-sync", {
            detail: payload,
          });
          window.dispatchEvent(syncEvent);
        };

        if (tagsToRevalidate.length > 0) {
          revalidateRealtimeTags(tagsToRevalidate).then(refreshData);
        } else {
          refreshData();
        }
      } catch (error) {
        console.error("Failed to parse realtime message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Real-time synchronization channel error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  return null;
}
