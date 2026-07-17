import { getAuthCookieHeader } from "@/lib/auth";
import BannersClient from "./BannersClient";

interface Banner {
  id: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getBanners(): Promise<Banner[]> {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${getBackendUrl()}/api/banners/admin`, {
      headers: {
        Cookie: cookieHeader,
      },
      next: { revalidate: 60, tags: ["banners"] },
    });
    if (!res.ok) throw new Error("Failed to fetch banners");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error loading banners:", error);
    return [];
  }
}

export default async function BannersPage() {
  const banners = await getBanners();
  return <BannersClient initialBanners={banners} />;
}
