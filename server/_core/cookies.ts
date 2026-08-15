import type { Request } from "express";
import type { CookieOptions } from "express";

export function getSessionCookieOptions(req: Request): CookieOptions {
  const isHttps =
    req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
  };
}
