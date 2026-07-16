import DiamondsClient from "./DiamondsClient";

interface Diamond {
  id: string;
  name: string;
  link: string;
  createdAt: string;
}

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getDiamonds(): Promise<Diamond[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/diamonds`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch diamonds");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error loading diamonds:", error);
    return [];
  }
}

export default async function DiamondsPage() {
  const diamonds = await getDiamonds();
  return <DiamondsClient initialDiamonds={diamonds} />;
}
