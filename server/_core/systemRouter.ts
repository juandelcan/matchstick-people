import { publicProcedure, router } from "./trpc";

/**
 * Manus shipped a `systemRouter` with platform-internal endpoints. Nothing in
 * the site's own code calls it, so this is a minimal replacement that keeps the
 * `system.*` namespace alive for health checks.
 */
export const systemRouter = router({
  health: publicProcedure.query(() => ({
    ok: true as const,
    time: new Date().toISOString(),
  })),
});
