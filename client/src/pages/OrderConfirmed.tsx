/**
 * OrderConfirmed.tsx — Post-checkout thank you page
 * Shown after a successful Stripe payment.
 * Stripe redirects to /order-confirmed?session_id=...
 *
 * Design: Editorial hero with the matchstick character rising in.
 * The character stands large and proud — hands on hips, flame blazing.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";

const SINGLE_MATCH = "/media/Single_Match_c99d9095.png";

const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
const mono: React.CSSProperties  = { fontFamily: "'DM Mono', monospace" };
const sans: React.CSSProperties  = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function OrderConfirmed() {
  const [phase, setPhase] = useState(0);
  // phase 0 → invisible
  // phase 1 → character rises in (300ms delay)
  // phase 2 → text fades in (900ms delay)
  // phase 3 → buttons appear (1400ms delay)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#F5F0E8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem 5rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Nav bar (minimal — just logo link) */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          right: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: phase >= 3 ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <Link href="/">
          <span
            style={{
              ...mono,
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8B7355",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            The Matchstick People
          </span>
        </Link>
        <Link href="/shop">
          <span
            style={{
              ...mono,
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8B7355",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Shop
          </span>
        </Link>
      </div>

      {/* Eyebrow label */}
      <p
        style={{
          ...mono,
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#E8400C",
          marginBottom: "1.5rem",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        Order Confirmed
      </p>

      {/* Headline — top line */}
      <h1
        style={{
          ...serif,
          fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
          fontWeight: 400,
          color: "#0D0C0A",
          lineHeight: 1.0,
          margin: 0,
          textAlign: "center",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        Thank you.
      </h1>

      {/* Character hero — rises up */}
      <div
        style={{
          margin: "2.5rem 0 2rem",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(60px)",
          transition: "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <img
          src={SINGLE_MATCH}
          alt="The Matchstick Person"
          style={{
            width: "clamp(140px, 22vw, 220px)",
            height: "auto",
            display: "block",
          }}
        />
      </div>

      {/* Headline — bottom line */}
      <h2
        style={{
          ...serif,
          fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "#5C4A32",
          lineHeight: 1.2,
          margin: "0 0 2rem",
          textAlign: "center",
          maxWidth: "520px",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
        }}
      >
        Your tee is heading to production.
      </h2>

      {/* Divider */}
      <div
        style={{
          width: "40px",
          height: "1px",
          backgroundColor: "#C8B89A",
          marginBottom: "2rem",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease 0.2s",
        }}
      />

      {/* Body copy */}
      <p
        style={{
          ...sans,
          fontSize: "0.95rem",
          color: "#6B5A3E",
          lineHeight: 1.75,
          maxWidth: "420px",
          marginBottom: "0.6rem",
          textAlign: "center",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease 0.25s",
        }}
      >
        You'll receive a shipping notification with tracking details once it's on its way.
      </p>

      <p
        style={{
          ...sans,
          fontSize: "0.82rem",
          color: "#9B8B73",
          marginBottom: "3rem",
          textAlign: "center",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 0.7s ease 0.3s",
        }}
      >
        Questions?{" "}
        <a
          href="mailto:orders@thematchstickpeople.com"
          style={{ color: "#E8400C", textDecoration: "none" }}
        >
          orders@thematchstickpeople.com
        </a>
      </p>

      {/* CTA buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.875rem",
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <Link href="/shop">
          <button
            style={{
              ...mono,
              fontSize: "0.6rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              backgroundColor: "#0D0C0A",
              color: "#F5F0E8",
              border: "none",
              padding: "1rem 2.5rem",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E8400C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0D0C0A"; }}
          >
            Back to Shop
          </button>
        </Link>
        <Link href="/">
          <button
            style={{
              ...mono,
              fontSize: "0.6rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              backgroundColor: "transparent",
              color: "#0D0C0A",
              border: "1.5px solid #0D0C0A",
              padding: "1rem 2.5rem",
              cursor: "pointer",
              transition: "border-color 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8400C"; e.currentTarget.style.color = "#E8400C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#0D0C0A"; e.currentTarget.style.color = "#0D0C0A"; }}
          >
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
