import { cacheLife, cacheTag } from "next/cache";

const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

export async function getPendingApprovals(cookieHeader: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag("pending-approvals");

  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/admin/registrations/pending`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      console.error("Fetch pending approvals failed with status:", res.status);
      return [];
    }

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return [];
  }
}

export async function getApprovedRetailers(cookieHeader: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag("approved-retailers");

  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/admin/retailers/approved`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      console.error("Fetch approved retailers failed with status:", res.status);
      return [];
    }

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching approved retailers:", error);
    return [];
  }
}
