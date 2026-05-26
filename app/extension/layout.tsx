import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chrome Extension",
  description:
    "Download the Multick Chrome extension to start and stop project timers from your browser.",
};

export default function ExtensionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
