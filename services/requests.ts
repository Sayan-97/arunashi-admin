import { cacheLife, cacheTag } from "next/cache";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

export async function getAllProductRequests(cookieHeader: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag("product-requests");

  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/products/requests/admin`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      console.error("Fetch product requests failed with status:", res.status);
      return [];
    }

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching product requests:", error);
    return [];
  }
}
