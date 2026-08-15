import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the notifyOwner function so tests don't make real HTTP calls
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createTestContext(ip = "127.0.0.1"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": ip },
      ip,
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contact.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success for a valid submission", async () => {
    const ctx = createTestContext("10.0.0.1");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Jane Smith",
      email: "jane@example.com",
      message: "Hello, I am interested in a brand collaboration.",
    });

    expect(result).toEqual({ success: true });
  });

  it("returns success silently when honeypot field is filled (bot detection)", async () => {
    const ctx = createTestContext("10.0.0.2");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Bot Name",
      email: "bot@spam.com",
      message: "Buy cheap pills now",
      website: "http://spam.com", // honeypot filled
    });

    // Should silently succeed without calling notifyOwner
    expect(result).toEqual({ success: true });

    const { notifyOwner } = await import("./_core/notification");
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("includes optional fields in notification when provided", async () => {
    const ctx = createTestContext("10.0.0.3");
    const caller = appRouter.createCaller(ctx);

    await caller.contact.submit({
      name: "John Doe",
      email: "john@agency.com",
      company: "Creative Agency",
      type: "Brand Collaboration",
      message: "We would love to work with you.",
    });

    const { notifyOwner } = await import("./_core/notification");
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("John Doe"),
        content: expect.stringContaining("Creative Agency"),
      })
    );
  });

  it("rejects submissions with invalid email", async () => {
    const ctx = createTestContext("10.0.0.4");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test",
        email: "not-an-email",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  it("rejects submissions with empty name", async () => {
    const ctx = createTestContext("10.0.0.5");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "",
        email: "test@example.com",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  it("rejects submissions with empty message", async () => {
    const ctx = createTestContext("10.0.0.6");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test User",
        email: "test@example.com",
        message: "",
      })
    ).rejects.toThrow();
  });
});
