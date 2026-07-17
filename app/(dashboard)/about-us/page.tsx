import AboutAdminClient from "./AboutAdminClient";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getAboutContent(): Promise<string> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/about`, {
      next: { revalidate: 60, tags: ["about"] },
    });
    if (!res.ok) throw new Error("Failed to fetch about details");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data.content || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching about details:", error);
    return "";
  }
}

export default async function AboutAdminPage() {
  const content = await getAboutContent();
  return <AboutAdminClient initialContent={content} />;
}
