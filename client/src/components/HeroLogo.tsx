import type { CSSProperties } from "react";

/**
 * Hero wordmark.
 *
 * The original component was not in the Manus export, and the artwork it used
 * lived on Manus's CDN. This renders /media/hero-logo.png and falls back to a
 * typeset wordmark if that file is missing, so the hero never renders empty.
 * Drop the real artwork in at client/public/media/hero-logo.png.
 */
export default function HeroLogo({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ ...style, position: "relative" }}>
      <img
        src="/media/hero-logo.png"
        alt="The Matchstick People"
        style={{ width: "100%", height: "auto", display: "block" }}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const fallback = img.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "block";
        }}
      />
      <div
        style={{
          display: "none",
          color: "#F5F0E8",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 600,
          lineHeight: 0.95,
          fontSize: "clamp(2.5rem, 9vw, 8rem)",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        The Matchstick
        <br />
        People
      </div>
    </div>
  );
}
