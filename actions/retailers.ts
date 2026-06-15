"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";

export async function approveRetailer(id: string) {
  const backendUrl = process.env.API_URL || "http://localhost:8000";
  const cookieStore = await cookies();

  try {
    const res = await fetch(
      `${backendUrl}/api/admin/registrations/${id}/approve`,
      {
        method: "POST",
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to approve retailer" };
    }

    updateTag("pending-approvals");
    updateTag("approved-retailers");
    return { success: true };
  } catch (error) {
    console.error("Approve Retailer Action Error:", error);
    return { error: "Failed to connect to authentication server" };
  }
}
