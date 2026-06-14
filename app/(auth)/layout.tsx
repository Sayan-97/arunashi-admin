export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className="flex min-h-svh flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </body>
  );
}
