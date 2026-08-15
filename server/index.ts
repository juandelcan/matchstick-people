import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { handleStripeWebhook } from "./webhook";
import { ENV } from "./_core/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.set("trust proxy", 1);

  // Stripe needs the raw body to verify the signature, so this goes first.
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  if (ENV.isProduction) {
    const staticPath = path.resolve(__dirname, "..", "public");
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, ".."),
    });
    app.use(vite.middlewares);
  }

  server.listen(ENV.port, () => {
    console.log(`The Matchstick People running on http://localhost:${ENV.port}/`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
