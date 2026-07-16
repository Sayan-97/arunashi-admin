import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { cn } from "@/lib/utils";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arunashi Admin",
  description: "Arunashi Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", nunito.variable)}
    >
      <body>
        <NextTopLoader color="#627426" showSpinner={false} height={3} />
        {children}
      </body>
    </html>
  );
}
