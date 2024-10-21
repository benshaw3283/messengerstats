import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/QueryProvider";
import Footer from "@/components/Footer";
import logo from "@/public/logo.svg";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Messenger Stats",
  description:
    "Automatically request file downloads from Facebook and upload files to see stats for the desired conversation.",
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
        <QueryProvider>
          <main>{children}</main>
        </QueryProvider>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
