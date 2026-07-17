import TermsAdminClient from "./TermsAdminClient";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

async function getTermsContent(): Promise<string> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/terms`, {
      next: { revalidate: 60, tags: ["terms"] },
    });
    if (!res.ok) throw new Error("Failed to fetch terms");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data.content || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching terms:", error);
    return "";
  }
}

export default async function TermsAdminPage() {
  const content = await getTermsContent();
  return <TermsAdminClient initialContent={content} />;
}
