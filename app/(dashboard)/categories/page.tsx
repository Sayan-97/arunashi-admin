import { getAuthCookieHeader } from "@/lib/auth";
import CategoriesClient from "./CategoriesClient";

interface Category {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: { url: string } | null;
  productIds: string[];
}

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getCategories(): Promise<Category[]> {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${getBackendUrl()}/api/products/categories`, {
      headers: {
        Cookie: cookieHeader,
      },
      next: { revalidate: 60, tags: ["categories"] },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
