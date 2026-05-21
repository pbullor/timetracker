import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for Multick. Starter $3/mo, Pro $9/mo, Team $14/user/mo. 7-day free trial, no credit card required.",
  openGraph: {
    title: "Multick Pricing — Simple plans, no surprises",
    description:
      "Starter $3/mo, Pro $9/mo, Team $14/user/mo. All plans include a 7-day free trial.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
