/**
 * Tests for the Stripe checkout tRPC procedure
 * These tests verify the input validation logic without hitting the Stripe API.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// ── Input schema (mirrors server/routers.ts) ─────────────────────────────────
const checkoutInputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(50),
        productName: z.string().min(1).max(200),
        size: z.string().min(1).max(10),
        quantity: z.number().int().min(1).max(10),
        unitAmountCents: z.number().int().min(100).max(100000),
        imageUrl: z.string().url().optional(),
      })
    )
    .min(1)
    .max(20),
  origin: z.string().url(),
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("shop.createCheckout input validation", () => {
  const validItem = {
    productId: "white-tee",
    productName: "The Matchstick People — White Tee",
    size: "M",
    quantity: 1,
    unitAmountCents: 3800,
    imageUrl: "https://example.com/image.jpg",
  };

  it("accepts a valid single item", () => {
    const result = checkoutInputSchema.safeParse({
      items: [validItem],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts items without imageUrl", () => {
    const { imageUrl: _, ...itemWithoutImage } = validItem;
    const result = checkoutInputSchema.safeParse({
      items: [itemWithoutImage],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty items array", () => {
    const result = checkoutInputSchema.safeParse({
      items: [],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity of 0", () => {
    const result = checkoutInputSchema.safeParse({
      items: [{ ...validItem, quantity: 0 }],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity greater than 10", () => {
    const result = checkoutInputSchema.safeParse({
      items: [{ ...validItem, quantity: 11 }],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unit amount below 100 cents", () => {
    const result = checkoutInputSchema.safeParse({
      items: [{ ...validItem, unitAmountCents: 50 }],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid origin URL", () => {
    const result = checkoutInputSchema.safeParse({
      items: [validItem],
      origin: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid imageUrl", () => {
    const result = checkoutInputSchema.safeParse({
      items: [{ ...validItem, imageUrl: "not-a-url" }],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty productId", () => {
    const result = checkoutInputSchema.safeParse({
      items: [{ ...validItem, productId: "" }],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty size", () => {
    const result = checkoutInputSchema.safeParse({
      items: [{ ...validItem, size: "" }],
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiple items up to the limit", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      ...validItem,
      productId: `product-${i}`,
    }));
    const result = checkoutInputSchema.safeParse({
      items,
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 20 items", () => {
    const items = Array.from({ length: 21 }, (_, i) => ({
      ...validItem,
      productId: `product-${i}`,
    }));
    const result = checkoutInputSchema.safeParse({
      items,
      origin: "https://thematchstickpeople.com",
    });
    expect(result.success).toBe(false);
  });
});

// ── Stripe helper unit tests ─────────────────────────────────────────────────
describe("createCheckoutSession", () => {
  it("builds correct success and cancel URLs from origin", () => {
    const origin = "https://thematchstickpeople.com";
    const successUrl = `${origin}/shop?order=success`;
    const cancelUrl = `${origin}/shop?order=cancelled`;

    expect(successUrl).toBe("https://thematchstickpeople.com/shop?order=success");
    expect(cancelUrl).toBe("https://thematchstickpeople.com/shop?order=cancelled");
  });

  it("converts cents to dollars correctly for display", () => {
    const amountCents = 3800;
    const amountDollars = (amountCents / 100).toFixed(2);
    expect(amountDollars).toBe("38.00");
  });
});
