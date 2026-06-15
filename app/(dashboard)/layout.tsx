import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body>
      <Toaster />
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </body>
  );
}
