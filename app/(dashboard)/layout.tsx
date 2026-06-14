import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body>
      <Toaster />
      <div className="flex min-h-svh flex-col bg-background">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </body>
  );
}
