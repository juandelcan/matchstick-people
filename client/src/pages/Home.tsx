/*
 * Home.tsx — The Matchstick People
 * Design: Cinematic Editorial
 *
 * Structure:
 *   1. Full-viewport Vimeo background video hero (autoplay, muted, loop, no controls)
 *   2. Scrolling ticker strip
 *   3. Asymmetric editorial image grid (masonry-style, no cards, no borders)
 *   4. Statement quote section
 *   5. Featured films strip
 *   6. CTA section
 *
 * References: RadicalMedia, CanadaCanada, TheGreatDiscontent
 */

import { useEffect, useState, useRef } from "react";
import HeroLogo from "@/components/HeroLogo";
import { Link } from "wouter";

// ── CDN Assets ──────────────────────────────────────────────────────────────
const CAVEMAN_IMG       = "/media/about-08.jpg";
const TAILGATING_IMG    = "/media/tailgating_thumb_81d55605.png";
const HOLLYWOOD_IMG     = "/media/hollywood_thumb_ef1cf724.jpg";
const BURNING_IMG       = "/media/about-05.jpg";
const MATCHBOX_IMG      = "/media/LOGO_MATCHBOX_02_4b035b3e.png";
const ZIPPO_IMG         = "/media/about-07.jpg";
const SUBWAY_IMG        = "/media/subway_thumb_9da8f43a.png";
const LOVERS_IMG        = "/media/Lovers_opt_7c31bcff.jpg";
const NOMAD_IMG         = "/media/nomad_opt_983f63ea.jpg";
const TANGO_IMG         = "/media/Tango_opt_46172487.jpg";
const BTS_MATCHES_IMG   = "/media/about-03.jpg";

// ── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Reveal Wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "scale" }) {
  const { ref, visible } = useReveal();
  const transforms: Record<string, string> = {
    up:    "translateY(50px)",
    left:  "translateX(-40px)",
    scale: "scale(0.94)",
  };
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Image Item ───────────────────────────────────────────────────────────────
function ImgItem({ src, alt, aspect, delay = 0, title, objectPosition = "center", fillHeight = false }: { src: string; alt: string; aspect: string; delay?: number; title?: string; objectPosition?: string; fillHeight?: boolean }) {
  const { ref, visible } = useReveal(0.08);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(40px)",
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        overflow: "hidden",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          ...(fillHeight ? { height: "100%" } : { aspectRatio: aspect }),
          objectFit: "cover",
          objectPosition,
          display: "block",
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      {title && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,12,10,0.75) 0%, transparent 55%)", opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem 0.875rem", transform: hovered ? "translateY(0)" : "translateY(8px)", opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 500, color: "#F5F0E8", margin: 0, lineHeight: 1.2 }}>{title}</p>

          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Show hero text immediately
    const t1 = setTimeout(() => setHeroVisible(true), 100);
    // Delay Vimeo iframe injection until after first paint — keeps page load instant
    const t2 = setTimeout(() => setShowVideo(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const tickerText = "The Matchstick People · Animation · Juan Delcan · Valentina Izaguirre · New York · ";
  const tickerRepeated = tickerText.repeat(6);

  return (
    <div style={{ backgroundColor: "#F5F0E8" }}>

      {/* ── 1. VIDEO HERO ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: "600px", overflow: "hidden", backgroundColor: "#0D0C0A" }}>

        {/* Static hero image — shows instantly */}
        <img
          src={BURNING_IMG}
          alt="The Matchstick People"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: videoLoaded ? 0 : 0.55,
            transition: "opacity 1.5s ease",
          }}
        />

        {/* Vimeo background embed — injected after page paint */}
        {showVideo && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <iframe
              src="https://player.vimeo.com/video/402423439?autoplay=1&muted=1&loop=1&background=1&controls=0&playsinline=1"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "177.78vh",
                height: "100vh",
                minWidth: "100%",
                minHeight: "56.25vw",
                transform: "translate(-50%, -50%)",
                border: "none",
                pointerEvents: "none",
                opacity: videoLoaded ? 1 : 0,
                transition: "opacity 1.5s ease",
              }}
              allow="autoplay; fullscreen"
              onLoad={() => setVideoLoaded(true)}
              title="The Matchstick People reel"
            />
          </div>
        )}

        {/* Dark overlay — ensures white logo is always readable */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundColor: "rgba(13,12,10,0.45)" }} />

        {/* Hero logo — large, centered, over the video */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4vw",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(20px) scale(0.98)",
            transition: "opacity 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          <HeroLogo
            style={{
              width: "min(88vw, 1100px)",
              height: "auto",
              display: "block",
              filter: "drop-shadow(0 4px 60px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "2.5rem",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 1s ease 1s",
          }}
        >
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,240,232,0.5)", writingMode: "vertical-rl" }}>Scroll</p>
          <div style={{ width: "1px", height: "40px", background: "rgba(245,240,232,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "40%", background: "rgba(245,240,232,0.8)", animation: "scrollDrop 2s ease infinite" }} />
          </div>
        </div>
      </section>

      {/* ── 2. TICKER STRIP ───────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#0D0C0A", padding: "0.85rem 0", overflow: "hidden", borderTop: "1px solid rgba(245,240,232,0.08)" }}>
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "ticker 35s linear infinite",
          }}
        >
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)", whiteSpace: "nowrap", paddingRight: "0" }}>
              {tickerRepeated}
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. ASYMMETRIC IMAGE GRID ──────────────────────────────────── */}
      <section style={{ padding: "6rem 0 0" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 2.5rem" }}>
          <Reveal delay={0}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1.5rem" }}>
              01 — Selected Works
            </p>
          </Reveal>
        </div>

        {/* Row 1: 60/40 split — Caveman is portrait, Burning fills height */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3px", marginBottom: "3px", alignItems: "stretch" }}>
          <div style={{ overflow: "hidden", position: "relative" }}>
            <img src={BURNING_IMG} alt="Burning the Midnight Oil" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
          <ImgItem src={CAVEMAN_IMG} alt="Caveman" aspect="3/4" delay={100} title="Caveman" objectPosition="center top" />
        </div>

        {/* Row 2: 3 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "3px", marginBottom: "3px" }}>
          <ImgItem src={MATCHBOX_IMG} alt="Matchbox" aspect="4/5" delay={0} title="Matchbox" />
          <ImgItem src={ZIPPO_IMG} alt="Zippo" aspect="4/5" delay={80} title="Zippo" />
          <ImgItem src={HOLLYWOOD_IMG} alt="Hollywood" aspect="4/5" delay={160} title="Hollywood" />
        </div>

        {/* Row 3: full width */}
        <div style={{ marginBottom: "3px" }}>
          <ImgItem src={TAILGATING_IMG} alt="Tailgating" aspect="21/9" delay={0} title="Tailgating" objectPosition="center top" />
        </div>

        {/* Row 4: 40/60 split (reversed) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "3px", alignItems: "stretch" }}>
          <ImgItem src={SUBWAY_IMG} alt="Subway" aspect="4/5" delay={0} title="Subway" fillHeight />
          <ImgItem src={BTS_MATCHES_IMG} alt="Behind the Scenes" aspect="4/5" delay={100} title="The Process" />
        </div>
      </section>

      {/* ── 4. STATEMENT SECTION ──────────────────────────────────────── */}
      <section style={{ padding: "10rem 2.5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", alignItems: "end" }}>
          <Reveal direction="left" delay={0}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", lineHeight: 1.8 }}>
              02 — Studio<br />New York City<br />Est. 2019
            </p>
          </Reveal>
          <Reveal delay={150}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 5.5vw, 6.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                color: "#0D0C0A",
                margin: 0,
              }}
            >
              Small figures.<br />
              <em style={{ fontStyle: "italic", color: "#6B6560" }}>Enormous</em> stories.<br />
              The full spectrum<br />of what it means<br />to be human.
            </h2>
          </Reveal>
        </div>

        <div style={{ marginTop: "5rem", display: "flex", justifyContent: "flex-end" }}>
          <Reveal delay={200}>
            <Link href="/about">
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#0D0C0A",
                  borderBottom: "1px solid #0D0C0A",
                  paddingBottom: "3px",
                  transition: "color 0.3s, border-color 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C8251A"; (e.currentTarget as HTMLElement).style.borderColor = "#C8251A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#0D0C0A"; (e.currentTarget as HTMLElement).style.borderColor = "#0D0C0A"; }}
              >
                About the Studio →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── 5. SECOND IMAGE GRID ──────────────────────────────────────── */}
      <section style={{ padding: "0 0 0" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 2.5rem", marginBottom: "1.5rem" }}>
          <Reveal>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560" }}>
              03 — Universe
            </p>
          </Reveal>
        </div>

        {/* Row: 3 equal columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "3px", marginBottom: "3px" }}>
          <ImgItem src={LOVERS_IMG} alt="Lovers" aspect="4/5" delay={0} title="Lovers" />
          <ImgItem src={TANGO_IMG} alt="Tango" aspect="4/5" delay={80} title="Tango" />
          <ImgItem src={NOMAD_IMG} alt="Nomad" aspect="4/5" delay={160} title="Nomad" />
        </div>
      </section>

      {/* ── 6. WORK CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2.5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "4rem", alignItems: "center" }}>
          <Reveal delay={0}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4.5vw, 5.5rem)",
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: "0.01em",
                color: "#0D0C0A",
                margin: 0,
              }}
            >
              Over 60 short films.<br />
              Each one a world<br />
              <em style={{ fontStyle: "italic", color: "#C8251A" }}>unto itself.</em>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#6B6560", lineHeight: 1.75, marginBottom: "2.5rem" }}>
                From a caveman discovering fire to matchstick figures navigating the modern world — every film is a meditation on the human condition.
              </p>
              <Link href="/work">
                <div
                  style={{
                    display: "inline-block",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#F5F0E8",
                    backgroundColor: "#0D0C0A",
                    padding: "1rem 2rem",
                    transition: "background-color 0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#C8251A"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#0D0C0A"; }}
                >
                  View All Films →
                </div>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 7. PRESS STRIP ────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid #E0D9CE", borderBottom: "1px solid #E0D9CE", padding: "3rem 2.5rem" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "2rem" }}>
              As Seen In
            </p>
          </Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "center" }}>
            {["The New York Times", "CNN", "BBC", "The Guardian", "Dezeen", "PBS", "Telemundo", "CGTN"].map((pub, i) => (
              <Reveal key={pub} delay={i * 60}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 400, color: "#B0A89E", letterSpacing: "-0.01em", fontStyle: "italic" }}>
                  {pub}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollDrop {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(250%); }
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1.5fr"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
          section > div[style*="grid-template-columns: 1fr 1.5fr"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: 1fr 2fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
