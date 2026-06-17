import { cacheLife, cacheTag } from "next/cache";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

export async function getShopifyProducts(cookieHeader: string) {
  "use cache";
  cacheLife("days");
  cacheTag("shopify-products");

  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/products/admin`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      console.error("Fetch shopify products failed with status:", res.status);
      return [];
    }

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching shopify products:", error);
    return [];
  }
}
