"use server";

import { updateTag } from "next/cache";
import { getAuthCookieHeader } from "@/lib/auth";

export async function updateRequestStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
) {
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const res = await fetch(
      `${backendUrl}/api/products/requests/admin/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: await getAuthCookieHeader(),
        },
        body: JSON.stringify({ status }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to update request status" };
    }

    // Revalidate product-requests cache tag to refresh page content
    updateTag("product-requests");
    return { success: true };
  } catch (error) {
    console.error("Update Request Status Action Error:", error);
    return { error: "Failed to connect to backend server" };
  }
}
