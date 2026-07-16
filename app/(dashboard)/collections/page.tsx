import { getAuthCookieHeader } from "@/lib/auth";
import CollectionsClient from "./CollectionsClient";

interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: { url: string } | null;
  productIds: string[];
}

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getCollections(): Promise<Collection[]> {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${getBackendUrl()}/api/products/collections`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch collections");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error loading collections:", error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();
  return <CollectionsClient initialCollections={collections} />;
}
