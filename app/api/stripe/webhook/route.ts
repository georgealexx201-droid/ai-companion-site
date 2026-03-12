import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (!userId) {
          console.error("No userId found in Stripe metadata");
          break;
        }

        let priceId: string | null = null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          priceId = subscription.items.data[0]?.price?.id ?? null;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            premiumSince: new Date(),
          },
        });

        console.log("User upgraded to premium:", userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const subscriptionId = subscription.id;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        const isPremium =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await prisma.user.updateMany({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
          data: {
            isPremium,
            stripePriceId: subscription.items.data[0]?.price?.id ?? null,
          },
        });

        console.log("Subscription updated:", subscriptionId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const subscriptionId = subscription.id;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        await prisma.user.updateMany({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
          data: {
            isPremium: false,
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        });

        console.log("Subscription cancelled:", subscriptionId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}