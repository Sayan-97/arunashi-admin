export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-white min-h-screen">{children}</div>;
}
