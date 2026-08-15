function required(name: string, value: string): string {
  if (!value && process.env.NODE_ENV === "production") {
    console.warn(`[env] ${name} is not set — the feature that uses it will fail.`);
  }
  return value;
}

export const ENV = {
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 3000),

  // Stripe
  stripeSecretKey: required("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY ?? ""),
  stripeWebhookSecret: required("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET ?? ""),

  // Printify
  printifyApiToken: required("PRINTIFY_API_TOKEN", process.env.PRINTIFY_API_TOKEN ?? ""),
  printifyShopId: required("PRINTIFY_SHOP_ID", process.env.PRINTIFY_SHOP_ID ?? ""),

  // Resend (order confirmations + owner notifications)
  resendApiKey: required("RESEND_API_KEY", process.env.RESEND_API_KEY ?? ""),
  fromAddress: process.env.FROM_ADDRESS ?? "The Matchstick People <onboarding@resend.dev>",
  ownerEmail: process.env.OWNER_EMAIL ?? "juandelcan@gmail.com",

  cookieSecret: process.env.JWT_SECRET ?? "",
};
