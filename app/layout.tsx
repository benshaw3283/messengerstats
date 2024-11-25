import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/QueryProvider";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Messenger Stats",
  description:
    "Automatically request file downloads from Facebook and upload files to see stats for the desired conversation.",

  keywords: [
    "Messenger stats",
    "Facebook Messenger analytics",
    "conversation insights",
    "chat analysis",
    "upload Messenger files",
    "Facebook Messenger stats tool",
    "Facebook Messenger",
    "Facebook messenger stats",
    "Facebook stats",
    "Facebook conversations",
    "Conversation Statistics",
    "FB messenger",
    "FB stats",
  ],
  openGraph: {
    title: "Messenger Stats - Facebook Messenger conversation stats",
    description:
      "Automatically request file downloads from Facebook and upload files to see stats for the desired conversation.",
    url: "https://messengerstats.com",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Messenger Stats",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/logo.svg" type="utf-8" />
      <body
        className={cn(
          "min-h-screen  bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <QueryProvider>
            <main>{children}</main>
          </QueryProvider>
        </Suspense>
        <Toaster />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
