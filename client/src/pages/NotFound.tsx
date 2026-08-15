/*
 * NotFound.tsx — 404 page
 * Design: Contemporary Editorial / Kinetic Stillness
 */

import { Link } from "wouter";

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: "#F7F3EE",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div>
        {/* Matchstick SVG */}
        <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "center" }}>
          <svg width="32" height="52" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.4 }}>
            <ellipse cx="10" cy="5" rx="5" ry="5" fill="#CC2B1A" />
            <rect x="9" y="9" width="2" height="23" rx="1" fill="#B8956A" />
          </svg>
        </div>

        <p className="label-sm" style={{ marginBottom: "1.5rem" }}>404 — Not Found</p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 300,
            color: "#1E1B18",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
          }}
        >
          This match<br />
          <em style={{ color: "#CC2B1A" }}>didn't light.</em>
        </h1>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1rem",
            color: "#7A7168",
            lineHeight: 1.8,
            marginBottom: "3rem",
            maxWidth: "360px",
            margin: "0 auto 3rem",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <span
            style={{
              display: "inline-block",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#F7F3EE",
              backgroundColor: "#1E1B18",
              padding: "1rem 2.5rem",
              textDecoration: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#CC2B1A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E1B18")}
          >
            Back to home →
          </span>
        </Link>
      </div>
    </div>
  );
}
