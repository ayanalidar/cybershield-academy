import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberShield Academy",
  description: "AI-Powered Cybersecurity Learning Platform",
  keywords: ["CyberShield Academy", "cybersecurity", "AI learning", "network security", "ethical hacking", "certificates"],
  authors: [{ name: "CyberShield Academy" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "CyberShield Academy",
    description: "AI-Powered Cybersecurity Learning Platform",
    url: "https://cybershield.academy",
    siteName: "CyberShield Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberShield Academy",
    description: "AI-Powered Cybersecurity Learning Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
