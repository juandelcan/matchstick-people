import Stripe from "stripe";
import { ENV } from "./_core/env";

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia",
});

export interface CheckoutLineItem {
  productId: string;   // e.g. "white-tee" | "black-tee"
  productName: string; // e.g. "The Matchstick Couple — White Tee"
  size: string;
  quantity: number;
  unitAmountCents: number; // price in cents, e.g. 3800 for $38
  imageUrl?: string;
}

export async function createCheckoutSession(
  items: CheckoutLineItem[],
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.productName,
        description: `Size: ${item.size} · Free shipping included`,
        images: item.imageUrl ? [item.imageUrl] : [],
        metadata: {
          productId: item.productId,
          size: item.size,
        },
      },
      unit_amount: item.unitAmountCents,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "SE", "NO", "DK", "FI", "PT", "BE", "AT", "CH", "NZ", "JP", "MX", "BR", "AR"],
    },
    allow_promotion_codes: true,
    metadata: {
      source: "matchstick-people-shop",
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}
