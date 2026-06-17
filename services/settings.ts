const getBackendUrl = () => process.env.API_URL || "http://localhost:8000";

export interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
}

export async function getAuditLogs(cookieHeader: string): Promise<AuditLog[]> {
  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/admin/settings/logs`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      console.error("Fetch audit logs failed with status:", res.status);
      return [];
    }

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}
