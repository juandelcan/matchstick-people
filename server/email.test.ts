import { describe, it, expect } from "vitest";
import { Resend } from "resend";
import { ENV } from "./_core/env";
import { buildOrderConfirmationHtmlForTest } from "./email";

describe("Email module — Resend API key validation", () => {
  it("RESEND_API_KEY is configured", () => {
    expect(ENV.resendApiKey).toBeTruthy();
    expect(ENV.resendApiKey.startsWith("re_")).toBe(true);
  });

  it("Resend client can be instantiated with the API key", () => {
    const client = new Resend(ENV.resendApiKey);
    expect(client).toBeDefined();
  });

  it("order confirmation HTML is generated with correct content", () => {
    const html = buildOrderConfirmationHtmlForTest({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      orderId: "TEST-001",
      items: [
        {
          name: "Matchstick People — White Tee",
          size: "M",
          quantity: 1,
          price: "$38.00",
        },
      ],
      total: "$38.00",
      shippingAddress: {
        name: "Jane Doe",
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
      },
    });

    expect(html).toContain("Order Confirmed");
    expect(html).toContain("Jane");
    expect(html).toContain("TEST-001");
    expect(html).toContain("Matchstick People — White Tee");
    expect(html).toContain("$38.00");
    expect(html).toContain("123 Main St");
    expect(html).toContain("thematchstickpeople.com");
  });
});
