import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Multick privacy policy. Learn how we handle your data in the Multick app and Chrome extension.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
