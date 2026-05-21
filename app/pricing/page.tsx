"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: 3,
    period: "/ month",
    description: "For individual devs getting started",
    features: [
      "1 user",
      "Up to 3 projects",
      "Manual timers",
      "Claude Code auto-tracking",
      "7-day reports",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 9,
    period: "/ month",
    description: "For devs who want the full picture",
    features: [
      "1 user",
      "Unlimited projects",
      "AI working time metrics",
      "Productivity multiplier",
      "CSV export",
      "Full report history",
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    key: "team",
    name: "Team",
    price: 14,
    period: "/ user / month",
    description: "For teams measuring AI ROI",
    features: [
      "Everything in Pro",
      "Invite team members",
      "Team reports & breakdown",
      "Per-member CWD patterns",
      "Shared project dashboard",
      "Priority support",
    ],
    cta: "Start Team",
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "Unauthorized") {
        window.location.href = "/login";
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple pricing.{" "}
            <span className="text-muted-foreground">No surprises.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Start tracking in minutes. Upgrade when you need more.
            Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={
                plan.popular
                  ? "border-2 border-primary relative"
                  : "border-border/50"
              }
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading !== null}
                >
                  {loading === plan.key ? "Redirecting..." : plan.cta}
                  {loading !== plan.key && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground space-y-1">
          <p>All plans include a 7-day free trial. No credit card required to sign up.</p>
          <p>Prices in USD. Billed monthly. Cancel anytime from your billing portal.</p>
        </div>
      </div>
    </div>
  );
}
