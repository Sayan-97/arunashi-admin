"use server";

import { cookies } from "next/headers";

export async function changePassword(payload: any) {
  const backendUrl = process.env.API_URL || "http://localhost:8000";
  const cookieStore = await cookies();

  try {
    const res = await fetch(
      `${backendUrl}/api/admin/settings/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to change password" };
    }

    return { success: true };
  } catch (error) {
    console.error("Change Password Action Error:", error);
    return { error: "Failed to connect to authentication server" };
  }
}
