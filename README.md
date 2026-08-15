# The Matchstick People — rebuilt off Manus

thematchstickpeople.com, running as an ordinary Node app. No Manus account, no
Manus hosting, no Manus services. Runs anywhere that runs Node 20+.

## Run it

    cp .env.example .env      # fill in your keys
    npm install
    npm run dev               # localhost:3000, Vite HMR
    npm run build && npm start

## What it is

- **Frontend:** React 19, Tailwind 4, wouter routing, Vite
- **Backend:** Express 4 + tRPC 11
- **Payments:** Stripe Checkout
- **Fulfilment:** Printify, auto send-to-production
- **Email:** Resend, order confirmations and owner notifications
- **No database.** The original notes mention Drizzle and MySQL, but nothing in
  the running code touches a database. Stock comes from Printify's API, orders
  live in Stripe and Printify, the contact form emails you. So there's nothing
  to migrate and nothing to pay for.

Pages: `/` `/work` `/about` `/press` `/shop` `/shop/select` `/contact`
`/order-confirmed`

## What I had to rebuild

Manus's export gave you every file it had touched in chat, flattened into one
folder, with no directory structure and no build config. These were missing and
are written from scratch:

- `package.json`, `vite.config.ts`, `tsconfig*.json`, `client/src/main.tsx`
- `server/_core/` — trpc, context, cookies, systemRouter. This was Manus's
  server framework layer. Auth is stubbed to null because nothing on the site is
  behind a login.
- `server/_core/notification.ts` — **rewritten.** It used to POST to Manus's
  internal notification service. It now emails you through Resend.
- `server/webhook.ts` — **reconstructed.** The Stripe webhook handler was not in
  the export. Rebuilt from the flow documented in PROJECT_SUMMARY.md and the
  signatures of `submitPrintifyOrder` and `sendOrderConfirmation`. **Test this
  before trusting it with a real order** (see below).
- `ErrorBoundary`, `ThemeContext`, `HeroLogo`, `ui/tooltip`, `ui/sonner`

Your own page code, the Stripe and Printify integrations, and the email
templates are untouched.

## Test the webhook before going live

The one piece I could not copy, only reconstruct.

    npm run dev
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    stripe trigger checkout.session.completed

Then put a real order through in Stripe test mode and confirm three things: the
Printify order appears in your dashboard, the customer confirmation email
arrives, and you get the owner notification.

One thing to watch: fulfilment reads `productId` and `size` from Stripe product
metadata, which `createCheckoutSession` sets. If you ever change how checkout
line items are built, keep that metadata or the Printify mapping breaks.

## Deploying

It's a normal Express app, so Render, Railway, Fly, or any VPS works. Set the
env vars, run `npm run build`, start with `npm start`.

Netlify and Vercel need the Express app wrapped in a serverless function
(`serverless-http`), which is more work than it's worth here.

Two things after you deploy:

1. Point `thematchstickpeople.com` at the new host. Right now Namecheap has
   CNAME `www` → `matchstickpeo-bdcgaejc.manus.space`. That record is what keeps
   the site on Manus.
2. Add the webhook endpoint in Stripe at `https://yourdomain/api/stripe/webhook`
   for `checkout.session.completed`, then put the signing secret in
   `STRIPE_WEBHOOK_SECRET`.

## Manus dependencies: none

Verified by grep and by loading every page in a headless browser. 98 images
across 8 pages, zero broken, zero requests to any Manus domain. See `ASSETS.md`.

The only outbound requests left are Vimeo (your films), Google Fonts, and
Instagram links.
