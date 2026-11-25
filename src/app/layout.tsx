import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BRAND_NAME
    ? `${process.env.NEXT_PUBLIC_BRAND_NAME} — Pipeline Dashboard`
    : "IG Pipeline Dashboard",
  description: "Instagram-to-client pipeline tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid #262626",
              color: "#fafafa",
            },
          }}
        />
      </body>
    </html>
  );
}
