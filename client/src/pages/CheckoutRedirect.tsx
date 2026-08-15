import { useEffect } from "react";

/**
 * CheckoutRedirect — handles the /checkout route for Meta Instagram Shopping.
 *
 * Meta opens https://thematchstickpeople.com/checkout?products=...&coupon=...
 * as a fresh browser tab. The React SPA catches this route before Express can
 * process it. This component immediately triggers a full-page reload to the
 * same URL, which bypasses the SPA and lets Express handle the redirect to
 * Stripe.
 */
export default function CheckoutRedirect() {
  useEffect(() => {
    // Force a full server-side navigation so Express can handle the redirect
    const url = window.location.href;
    // Replace the current history entry so the back button works cleanly
    window.location.replace(url + (url.includes("?") ? "&_reload=1" : "?_reload=1"));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        color: "#666",
      }}
    >
      Redirecting to checkout…
    </div>
  );
}
