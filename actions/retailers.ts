"use server";

import { updateTag } from "next/cache";
import { getAuthCookieHeader } from "@/lib/auth";

export async function approveRetailer(id: string) {
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const res = await fetch(
      `${backendUrl}/api/admin/registrations/${id}/approve`,
      {
        method: "POST",
        headers: {
          Cookie: await getAuthCookieHeader(),
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

export async function resendActivationEmail(id: string) {
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const res = await fetch(
      `${backendUrl}/api/admin/registrations/${id}/resend-activation`,
      {
        method: "POST",
        headers: {
          Cookie: await getAuthCookieHeader(),
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to resend activation link" };
    }

    updateTag("pending-approvals");
    return { success: true };
  } catch (error) {
    console.error("Resend Activation Email Action Error:", error);
    return { error: "Failed to connect to authentication server" };
  }
}
