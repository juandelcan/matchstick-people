import type { Request, Response } from "express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

/**
 * Request context.
 *
 * The original Manus build resolved `user` from a Manus OAuth session cookie.
 * Nothing on this site is gated behind a login — the shop, contact form and
 * stock lookup are all public — so `user` is always null here. If you ever want
 * real accounts, plug your own auth in at this one spot.
 */
export type Context = {
  req: Request;
  res: Response;
  user: null;
};

export function createContext({ req, res }: CreateExpressContextOptions): Context {
  return { req, res, user: null };
}

/** Alias kept for the original test files. */
export type TrpcContext = Context;
