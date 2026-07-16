const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

export async function getShopifyProducts(cookieHeader: string) {
  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/products/admin`, {
      headers: {
        Cookie: cookieHeader,
      },
      next: { revalidate: 60, tags: ["shopify-products"] },
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
