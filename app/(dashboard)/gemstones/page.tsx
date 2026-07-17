import GemstonesClient from "./GemstonesClient";

interface Gemstone {
  id: string;
  name: string;
  link: string;
  createdAt: string;
}

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getGemstones(): Promise<Gemstone[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/gemstones`, {
      next: { revalidate: 60, tags: ["gemstones"] },
    });
    if (!res.ok) throw new Error("Failed to fetch gemstones");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error loading gemstones:", error);
    return [];
  }
}

export default async function GemstonesPage() {
  const gemstones = await getGemstones();
  return <GemstonesClient initialGemstones={gemstones} />;
}
