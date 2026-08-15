/*
 * About.tsx — The Matchstick People
 * Design: Cinematic Editorial
 * Full-bleed opening image → large type statement → asymmetric creator portraits → BTS process
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const SUBWAY_IMG          = "/media/about-01.png";
const JUAN_VALENTINA_IMG  = "/media/Juan_Valentina_opt_c46f57f1.jpg";
const VALENTINA_STUDIO_IMG= "/media/about-02.jpg";
const BTS_STUDIO_IMG      = "/media/about-04.jpg";
const BTS_MATCHES_IMG     = "/media/about-03.jpg";
const BURNING_IMG         = "/media/about-05.jpg";
const UKRAINE_IMG         = "/media/about-06.jpg";
const ZIPPO_IMG           = "/media/about-07.jpg";
const CAVEMAN_IMG         = "/media/about-08.jpg";
const NOMAD_IMG           = "/media/nomad_opt_983f63ea.jpg";

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" }) {
  const { ref, visible } = useReveal();
  const transforms: Record<string, string> = { up: "translateY(40px)", left: "translateX(-30px)", right: "translateX(30px)" };
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : transforms[direction], transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

export default function About() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>

      {/* 1. OPENING HERO */}
      <section style={{ position: "relative", width: "100%", height: "80vh", minHeight: "500px", overflow: "hidden" }}>
        <img src={SUBWAY_IMG} alt="Matchstick People in the subway" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,12,10,0.15) 0%, rgba(13,12,10,0) 40%, rgba(13,12,10,0.7) 100%)" }} />
        <div style={{ position: "absolute", bottom: "3.5rem", left: "2.5rem", right: "2.5rem", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(20px)", transition: "opacity 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.65)", marginBottom: "0.75rem" }}>About</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 9rem)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.03em", color: "#F5F0E8", margin: 0, maxWidth: "800px" }}>
            The simplest<br />figure.<br /><em style={{ fontStyle: "italic", color: "rgba(245,240,232,0.7)" }}>Infinite stories.</em>
          </h1>
        </div>
      </section>

      {/* 2. INTRO STATEMENT */}
      <section style={{ padding: "8rem 2.5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div className="about-two-col">
          <Reveal direction="left">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6560", lineHeight: 1.9 }}>
              01 — The Universe<br />New York City<br />Est. 2019
            </p>
          </Reveal>
          <Reveal delay={150}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.8rem)", fontWeight: 300, lineHeight: 1.45, letterSpacing: "-0.01em", color: "#0D0C0A", margin: 0 }}>
              The Matchstick People is an animated universe built around the simplest possible character — a figure made of matchsticks. Through these humble forms, creators <em style={{ fontStyle: "italic" }}>Juan Delcan and Valentina Izaguirre</em> explore the full spectrum of what it means to be human: love, fear, ambition, grief, absurdity, and wonder.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. FULL-WIDTH STATEMENT */}
      <div style={{ borderTop: "1px solid #E0D9CE", padding: "6rem 2.5rem", overflow: "hidden", position: "relative" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", gap: "3rem", flexWrap: "wrap" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 6.5rem)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.03em", color: "#0D0C0A", margin: 0 }}>
              Over 60 films.&nbsp;&nbsp;<em style={{ fontStyle: "italic", color: "#C8251A" }}>One universe.</em>
            </p>
          </div>
        </Reveal>
        <div style={{ height: "1px", backgroundColor: "#E0D9CE", marginTop: "6rem" }} />
      </div>

      {/* 4. CREATORS */}
      <section style={{ padding: "8rem 0", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ padding: "0 2.5rem", marginBottom: "4rem" }}>
          <Reveal>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6560" }}>02 — The Creators</p>
          </Reveal>
        </div>
        <div className="about-creator-grid">
          <Reveal direction="left">
            <div style={{ overflow: "hidden" }}>
              <img src={JUAN_VALENTINA_IMG} alt="Juan Delcan & Valentina Izaguirre" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <Reveal delay={100}>
              <div style={{ overflow: "hidden" }}>
                <img src={VALENTINA_STUDIO_IMG} alt="Valentina Izaguirre painting" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center", display: "block" }} />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ backgroundColor: "#0D0C0A", padding: "3rem 2.5rem" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3.5rem)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#F5F0E8", margin: "0 0 1.5rem" }}>
                  Juan Delcan<br /><em style={{ fontStyle: "italic", color: "rgba(245,240,232,0.5)" }}>&amp; Valentina<br />Izaguirre</em>
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.55)", lineHeight: 1.8, marginBottom: "2rem" }}>
                  New York-based creative duo. Juan is an Emmy Award-winning director and animator. Valentina is a visual artist and creative director. Together they built The Matchstick People from a single sketch into a global animated universe.
                </p>
                <Link href="/work">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.5)", borderBottom: "1px solid rgba(245,240,232,0.25)", paddingBottom: "2px", cursor: "pointer" }}>
                    View All Films →
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. PROCESS */}
      <section style={{ padding: "0 0 8rem" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto 4rem", padding: "0 2.5rem" }}>
          <Reveal>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6560" }}>03 — The Process</p>
          </Reveal>
        </div>
        <div className="about-bts-grid" style={{ marginBottom: "3px" }}>
          <Reveal direction="left">
            <div style={{ overflow: "hidden" }}>
              <img src={BTS_MATCHES_IMG} alt="Working with matches" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
            </div>
          </Reveal>
          <Reveal direction="right" delay={100}>
            <div style={{ overflow: "hidden" }}>
              <img src={BTS_STUDIO_IMG} alt="In the production studio" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
            </div>
          </Reveal>
        </div>
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "5rem 2.5rem" }}>
          <div className="about-three-col">
            {[
              { num: "I", title: "Concept", text: "Every film begins with a single human truth — an emotion, a contradiction, a moment of absurdity. The matchstick figure is the vessel." },
              { num: "II", title: "Animation", text: "Juan animates each film frame by frame, building worlds from the simplest geometry. The constraint is the creative engine." },
              { num: "III", title: "Release", text: "Films are released across platforms, reaching millions of viewers worldwide. Each one stands alone as a complete story." },
            ].map((item, i) => (
              <Reveal key={item.num} delay={i * 120}>
                <div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#C8251A", marginBottom: "1rem" }}>{item.num}</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, color: "#0D0C0A", margin: "0 0 1rem", letterSpacing: "-0.01em" }}>{item.title}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", color: "#6B6560", lineHeight: 1.8 }}>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="about-stills-grid">
          {[
            { src: BURNING_IMG, alt: "Burning the Midnight Oil" },
            { src: UKRAINE_IMG, alt: "Ukraine" },
            { src: ZIPPO_IMG, alt: "Zippo" },
            { src: CAVEMAN_IMG, alt: "Caveman" },
            { src: NOMAD_IMG, alt: "Nomad" },
          ].map((img, i) => (
            <Reveal key={img.alt} delay={i * 60}>
              <div style={{ overflow: "hidden" }}>
                <img src={img.src} alt={img.alt} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "center top", display: "block" }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. CTA */}
      <section style={{ borderTop: "1px solid #E0D9CE", padding: "6rem 2.5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div className="about-cta-grid">
          <Reveal>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 5rem)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.025em", color: "#0D0C0A", margin: 0 }}>
              Work with us.<br /><em style={{ fontStyle: "italic", color: "#6B6560" }}>Tell us your story.</em>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <Link href="/contact">
              <div style={{ display: "inline-block", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#F5F0E8", backgroundColor: "#0D0C0A", padding: "1rem 2rem", cursor: "pointer" }}>
                Get in Touch →
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <style>{`
        .about-two-col { display: grid; grid-template-columns: 1fr 2fr; gap: 5rem; align-items: start; }
        .about-creator-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3px; align-items: start; }
        .about-bts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
        .about-three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4rem; }
        .about-stills-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 3px; }
        .about-cta-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; align-items: center; }
        @media (max-width: 900px) {
          .about-two-col { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .about-creator-grid { grid-template-columns: 1fr !important; }
          .about-bts-grid { grid-template-columns: 1fr !important; }
          .about-three-col { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .about-stills-grid { grid-template-columns: 1fr 1fr !important; }
          .about-cta-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
