import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  starter: {
    name: "Starter",
    price: 3,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      "1 user",
      "Up to 3 projects",
      "Manual timers",
      "Claude Code auto-tracking",
      "7-day reports",
    ],
    limits: { projects: 3, reportDays: 7, members: 1 },
  },
  pro: {
    name: "Pro",
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "1 user",
      "Unlimited projects",
      "AI working time metrics",
      "Productivity multiplier",
      "CSV export",
      "Full report history",
    ],
    limits: { projects: Infinity, reportDays: Infinity, members: 1 },
  },
  team: {
    name: "Team",
    price: 14,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      "Per user pricing",
      "Everything in Pro",
      "Invite team members",
      "Team reports & breakdown",
      "Per-member CWD patterns",
      "Priority support",
    ],
    limits: { projects: Infinity, reportDays: Infinity, members: Infinity },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
