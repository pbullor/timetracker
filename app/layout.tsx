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

export const metadata: Metadata = {
  title: "Multick — AI Dev Time Tracking",
  description: "Track your development time with AI-assisted insights. Measure manual hours vs AI-assisted hours per project. Know exactly where your dev time goes.",
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

  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
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
