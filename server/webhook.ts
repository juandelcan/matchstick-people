import type { Request, Response } from "express";
import type Stripe from "stripe";
import { stripe } from "./stripe";
import { ENV } from "./_core/env";
import { submitPrintifyOrder, normalizeSizeForPrintify, type PrintifyLineItem } from "./printify";
import { sendOrderConfirmation } from "./email";
import { notifyOwner } from "./_core/notification";

/**
 * Stripe webhook: checkout.session.completed
 *
 * NOTE: the original handler was not included in the Manus export, so this is a
 * reconstruction built from the documented flow in PROJECT_SUMMARY.md and the
 * signatures of submitPrintifyOrder / sendOrderConfirmation. Behaviour matches
 * what the docs describe: verify signature, pull line items, push the order to
 * Printify, email the customer, notify the owner.
 *
 * Test it with the Stripe CLI before trusting it with a real order:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 *   stripe trigger checkout.session.completed
 *
 * This route must receive the RAW body, so it is mounted before express.json().
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!ENV.stripeWebhookSecret) {
    console.error("[Stripe] STRIPE_WEBHOOK_SECRET is not set — refusing to process webhook");
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature as string,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Stripe] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Acknowledge immediately. Printify's send-to-production retry loop takes up to
  // ~60s and Stripe times webhooks out at 20s, so fulfilment runs after the reply.
  res.json({ received: true });

  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    await fulfillOrder(session);
  } catch (err: any) {
    console.error("[Fulfilment] Failed for session", session.id, err);
    await notifyOwner({
      title: `ORDER NEEDS ATTENTION — ${session.id}`,
      content: [
        `Fulfilment threw an error and the order may not have reached Printify.`,
        ``,
        `Stripe session: ${session.id}`,
        `Customer: ${session.customer_details?.email ?? "unknown"}`,
        `Amount: ${formatAmount(session.amount_total, session.currency)}`,
        ``,
        `Error: ${err?.message ?? String(err)}`,
        ``,
        `Check the Stripe dashboard and place the Printify order by hand if needed.`,
      ].join("\n"),
    }).catch(() => {});
  }
}

function formatAmount(amount: number | null, currency: string | null): string {
  if (amount == null) return "unknown";
  return `${(amount / 100).toFixed(2)} ${(currency ?? "usd").toUpperCase()}`;
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "line_items.data.price.product"],
  });

  const details = full.customer_details;
  const shipping = (full as any).collected_information?.shipping_details
    ?? (full as any).shipping_details;
  const addr = shipping?.address ?? details?.address;

  if (!addr) throw new Error("No shipping address on the Stripe session");

  const fullName: string = shipping?.name ?? details?.name ?? "Customer";
  const [firstName, ...restName] = fullName.trim().split(/\s+/);
  const lastName = restName.join(" ") || firstName;

  const items: PrintifyLineItem[] = [];
  const emailItems: Array<{ name: string; size: string; quantity: number; price: string }> = [];

  for (const li of full.line_items?.data ?? []) {
    const product = li.price?.product as Stripe.Product | undefined;
    const productId = product?.metadata?.productId;
    const size = product?.metadata?.size;
    const quantity = li.quantity ?? 1;

    if (!productId || !size) {
      throw new Error(
        `Line item "${li.description}" is missing productId/size metadata — cannot map it to a Printify variant`
      );
    }

    items.push({ productId, size: normalizeSizeForPrintify(size), quantity });
    emailItems.push({
      name: product?.name ?? li.description ?? "Item",
      size,
      quantity,
      price: formatAmount(li.amount_total, full.currency),
    });
  }

  if (items.length === 0) throw new Error("Stripe session had no line items");

  const externalOrderId = full.id;

  const result = await submitPrintifyOrder(
    externalOrderId,
    {
      first_name: firstName,
      last_name: lastName,
      email: details?.email ?? "",
      phone: details?.phone ?? undefined,
      country: addr.country ?? "",
      region: addr.state ?? "",
      address1: addr.line1 ?? "",
      address2: addr.line2 ?? undefined,
      city: addr.city ?? "",
      zip: addr.postal_code ?? "",
    },
    items
  );

  if (!result.success) {
    throw new Error(`Printify rejected the order: ${result.error}`);
  }

  if (details?.email) {
    await sendOrderConfirmation({
      customerName: fullName,
      customerEmail: details.email,
      orderId: result.orderId ?? externalOrderId,
      items: emailItems,
      total: formatAmount(full.amount_total, full.currency),
      shippingAddress: {
        name: fullName,
        line1: addr.line1 ?? "",
        line2: addr.line2 ?? undefined,
        city: addr.city ?? "",
        state: addr.state ?? "",
        zip: addr.postal_code ?? "",
        country: addr.country ?? "",
      },
    }).catch((e) => console.error("[Email] Order confirmation failed:", e));
  }

  await notifyOwner({
    title: `New Order Fulfilled — ${formatAmount(full.amount_total, full.currency)}`,
    content: [
      `Customer: ${details?.email ?? "unknown"}`,
      `Shipping: ${fullName}, ${addr.line1}, ${addr.city}, ${addr.country}`,
      `Printify Order: ${result.orderId}`,
      `Stripe Session: ${full.id}`,
      result.error ? `\nWARNING: ${result.error}` : "",
    ].filter(Boolean).join("\n"),
  }).catch(() => {});

  console.log(`[Fulfilment] Done. Stripe ${full.id} -> Printify ${result.orderId}`);
}
