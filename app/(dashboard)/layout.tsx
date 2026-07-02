import { Suspense } from "react";
import RealtimeSyncListener from "@/components/dashboard/RealtimeSyncListener";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster />
      <RealtimeSyncListener />
      <div className="flex h-screen overflow-hidden bg-white">
        <Suspense
          fallback={
            <div className="w-[280px] shrink-0 border-r border-[#EEEEEE] flex flex-col h-screen bg-white" />
          }
        >
          <Sidebar />
        </Suspense>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </>
  );
}
