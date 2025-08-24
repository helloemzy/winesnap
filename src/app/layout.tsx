import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
// Simplified layout for debugging

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WineSnap - Professional Wine Tasting Journal",
  description: "Professional wine tasting journal with WSET Level 3 systematic approach, voice recording, and social features",
  keywords: ["wine", "tasting", "journal", "WSET", "sommelier", "viticulture"],
  authors: [{ name: "WineSnap" }],
  creator: "WineSnap",
  publisher: "WineSnap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WineSnap",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://winesnap.app",
    title: "WineSnap - Professional Wine Tasting Journal",
    description: "Professional wine tasting journal with WSET Level 3 systematic approach",
    siteName: "WineSnap",
  },
  twitter: {
    card: "summary_large_image",
    title: "WineSnap - Professional Wine Tasting Journal",
    description: "Professional wine tasting journal with WSET Level 3 systematic approach",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dc2626" },
    { media: "(prefers-color-scheme: dark)", color: "#7c2d12" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
