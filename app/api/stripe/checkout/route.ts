import { stripe, PLANS, PlanKey } from "@/lib/stripe";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro", "team"]),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PLANS[parsed.data.plan as PlanKey];
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
    }

    const baseUrl = request.headers.get("origin") ?? process.env.AUTH_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${baseUrl}/settings?payment=success`,
      cancel_url: `${baseUrl}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        plan: parsed.data.plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create checkout session", detail: message }, { status: 500 });
  }
}
