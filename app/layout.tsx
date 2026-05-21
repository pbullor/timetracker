import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth-config";
import { Navbar } from "@/components/navbar";
import { PublicHeader } from "@/components/public-header";
import { headers } from "next/headers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const BASE_URL = process.env.AUTH_URL ?? "https://multick.dev";

export const metadata: Metadata = {
  title: {
    default: "Multick — AI Dev Time Tracking",
    template: "%s | Multick",
  },
  description:
    "Track your development time with AI-assisted insights. Auto-track Claude Code sessions, measure AI working time, and see your real productivity multiplier.",
  metadataBase: new URL(BASE_URL),
  keywords: [
    "time tracking",
    "developer tools",
    "Claude Code",
    "AI productivity",
    "AI time tracking",
    "coding time tracker",
    "developer productivity",
    "AI ROI",
    "team time tracking",
  ],
  authors: [{ name: "Multick" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Multick",
    title: "Multick — Know exactly where your dev time goes",
    description:
      "Auto-track Claude Code sessions alongside manual timers. See real hours vs AI-assisted hours per project — the metric that matters.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multick — AI Dev Time Tracking",
    description:
      "Auto-track Claude Code sessions. Measure AI working time. See your productivity multiplier.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth not configured yet
  }

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isLandingOrLogin = pathname === "/" || pathname === "/login";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Multick",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: BASE_URL,
    description:
      "AI dev time tracking. Auto-track Claude Code sessions, measure AI working time, and see your productivity multiplier.",
    offers: [
      { "@type": "Offer", name: "Starter", price: "3.00", priceCurrency: "USD", priceValidUntil: "2027-12-31" },
      { "@type": "Offer", name: "Pro", price: "9.00", priceCurrency: "USD", priceValidUntil: "2027-12-31" },
      { "@type": "Offer", name: "Team", price: "14.00", priceCurrency: "USD", priceValidUntil: "2027-12-31" },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {session?.user ? (
          <>
            <Navbar userName={session.user.name} userImage={session.user.image} />
            <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
              {children}
            </main>
          </>
        ) : isLandingOrLogin ? (
          <>{children}</>
        ) : (
          <>
            <PublicHeader />
            <main className="flex-1">
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}
