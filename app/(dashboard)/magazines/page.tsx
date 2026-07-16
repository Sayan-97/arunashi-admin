import MagazinesClient from "./MagazinesClient";

interface Magazine {
  id: string;
  link: string;
  image?: string;
  issueNumber?: string | null;
  date: string;
  createdAt: string;
}

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getMagazines(): Promise<Magazine[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/magazines`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch magazines");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error loading magazines:", error);
    return [];
  }
}

export default async function MagazinesPage() {
  const magazines = await getMagazines();
  return <MagazinesClient initialMagazines={magazines} />;
}
