import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import localFont from "next/font/local";
import "@flaticon/flaticon-uicons/css/all/all.css";
import "./globals.css";
import { cn } from "@/lib/utils";

const fleur = localFont({
  src: "../public/FleurBold.otf",
  variable: "--font-fleur",
});

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
      className={cn("antialiased", fleur.variable, nunito.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
