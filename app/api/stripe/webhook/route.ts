import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        await db
          .update(users)
          .set({
            plan,
            planStatus: "trialing",
            stripeSubscriptionId: session.subscription as string,
          })
          .where(eq(users.id, userId));
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      const planMap: Record<string, string> = {};
      const item = subscription.items.data[0];
      const priceId = item?.price.id;
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) planMap.plan = "starter";
      else if (priceId === process.env.STRIPE_PRO_PRICE_ID) planMap.plan = "pro";
      else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) planMap.plan = "team";

      const periodEnd = item?.current_period_end;

      if (status === "active" || status === "trialing") {
        const trialEnd = subscription.trial_end;
        await db
          .update(users)
          .set({
            ...planMap,
            planStatus: status,
            planExpiresAt: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
            trialEndsAt: trialEnd
              ? new Date(trialEnd * 1000)
              : null,
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      await db
        .update(users)
        .set({
          plan: "free",
          planStatus: "none",
          stripeSubscriptionId: null,
          planExpiresAt: null,
          trialEndsAt: null,
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
