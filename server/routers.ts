import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createCheckoutSession } from "./stripe";
import { getStockLevels } from "./printify";

// Simple in-memory rate limiter: max 3 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 3;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return;
  }
  if (entry.count >= maxRequests) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many submissions. Please wait a few minutes before trying again.",
    });
  }
  entry.count += 1;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          email: z.string().email().max(320),
          company: z.string().max(100).optional(),
          type: z.string().max(60).optional(),
          message: z.string().min(1).max(5000),
          // Honeypot field — bots fill this, humans don't (allow any string, checked in handler)
          website: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Honeypot check — if filled, silently succeed (don't tell bots they were caught)
        if (input.website && input.website.length > 0) {
          return { success: true };
        }

        // Rate limiting by IP
        const ip =
          (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          (ctx.req as any).ip ||
          "unknown";
        checkRateLimit(ip);

        // Build notification content
        const lines = [
          `From: ${input.name} <${input.email}>`,
          input.company ? `Company: ${input.company}` : null,
          input.type ? `Inquiry Type: ${input.type}` : null,
          ``,
          input.message,
        ].filter(Boolean);

        const title = `New Contact Form: ${input.name}${input.type ? ` — ${input.type}` : ""}`;
        const content = lines.join("\n");

        await notifyOwner({ title, content });

        return { success: true };
      }),
  }),

  shop: router({
    getStock: publicProcedure
      .query(async () => {
        // Returns: { "white-tee": { S: true, M: true, ... }, "black-tee": { ... } }
        const stock = await getStockLevels();
        return stock;
      }),

    createCheckout: publicProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              productId: z.string().min(1).max(50),
              productName: z.string().min(1).max(200),
              size: z.string().min(1).max(10),
              quantity: z.number().int().min(1).max(10),
              unitAmountCents: z.number().int().min(100).max(100000),
              imageUrl: z.string().url().optional(),
            })
          ).min(1).max(20),
          origin: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        const successUrl = `${input.origin}/order-confirmed`;
        const cancelUrl = `${input.origin}/shop?order=cancelled`;

        const checkoutUrl = await createCheckoutSession(
          input.items,
          successUrl,
          cancelUrl
        );

        return { checkoutUrl };
      }),
  }),
});

export type AppRouter = typeof appRouter;
