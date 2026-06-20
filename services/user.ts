import { getAuthCookieHeader } from "@/lib/auth";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

export async function getUserProfile() {
  const backendUrl = getBackendUrl();
  const authHeader = await getAuthCookieHeader();

  const res = await fetch(`${backendUrl}/api/user/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authHeader,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch user profile");
  }

  const result = await res.json();
  return result.data;
}
