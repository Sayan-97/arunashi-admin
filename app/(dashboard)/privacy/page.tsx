import PrivacyAdminClient from "./PrivacyAdminClient";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getPrivacyContent(): Promise<string> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/privacy`, {
      next: { revalidate: 60, tags: ["privacy"] },
    });
    if (!res.ok) throw new Error("Failed to fetch privacy policy");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data.content || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return "";
  }
}

export default async function PrivacyAdminPage() {
  const content = await getPrivacyContent();
  return <PrivacyAdminClient initialContent={content} />;
}
