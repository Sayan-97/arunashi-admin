import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";
import SettingsClient from "@/components/settings/SettingsClient";
import { getAuthCookieHeader } from "@/lib/auth";
import { getAuditLogs } from "@/services/settings";
import { getUserProfile } from "@/services/user";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <h1 className="text-2xl font-medium text-[#111111] font-sans">
          Settings
        </h1>
        <NotificationMenu />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-6 overflow-y-auto bg-[#FAF9F6]/30">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-[#868686]">
              Loading settings...
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </main>
    </div>
  );
}

async function SettingsContent() {
  const cookieHeader = await getAuthCookieHeader();

  let logs = [];
  try {
    logs = await getAuditLogs(cookieHeader);
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      // Clear administration cookies
      const cookieStore = await cookies();
      cookieStore.delete("arunashiAdminAccessToken");
      cookieStore.delete("arunashiAdminRefreshToken");
      redirect("/login");
    }
    throw err;
  }

  let profile = { name: "Administrator", email: "" };
  try {
    profile = await getUserProfile();
  } catch (err) {
    console.error("Failed to load user profile:", err);
  }

  return <SettingsClient initialLogs={logs} profile={profile} />;
}
