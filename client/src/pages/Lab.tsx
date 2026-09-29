/*
 * Lab.tsx — The Matchstick People
 * The experimental corner of the site: works in progress, tests and toys.
 * Design: Cinematic Editorial — Playfair Display for headlines, DM Mono labels,
 * Plus Jakarta Sans for text. Cream #F5F0E8, ink #0D0C0A, red #C8251A.
 *
 * Each experiment is an entry in EXPERIMENTS. The first one is the Endless Climb,
 * a single animated SVG (SMIL, no JavaScript) that loops forever.
 */

import { useEffect, useRef, useState } from "react";

type Experiment = {
  id: string;
  number: string;
  title: string;
  text: string;
  meta: string;
  src: string;
  alt: string;
  aspect: string; // CSS aspect-ratio of the artwork
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "endless-climb",
    number: "01",
    title: "Endless Climb",
    text: "Three matchsticks, one square, two gears. One climbs inside, one walks on top trying not to fall, one hangs underneath. A four-second loop that never ends.",
    meta: "Animated SVG · 2026",
    src: "/media/lab/endless-climb.svg",
    alt: "Three matchstick figures climbing, walking and hanging on a black square turned by two gears",
    aspect: "9 / 16",
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.04 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

const label = { fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" as const };

export default function Lab() {
  useEffect(() => { document.title = "Lab — The Matchstick People"; }, []);

  return (
    <div style={{ backgroundColor: "#F5F0E8", color: "#0D0C0A" }}>
      {/* Intro */}
      <section style={{ padding: "7rem 2.5rem 4rem", maxWidth: "1600px", margin: "0 auto" }}>
        <Reveal>
          <p style={{ ...label, color: "#C8251A", marginBottom: "1.5rem" }}>Lab · Experiments</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.95, letterSpacing: "-0.03em", margin: 0 }}>
            The Lab
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(13,12,10,0.65)", maxWidth: "520px", marginTop: "2rem" }}>
            Tests, toys and works in progress from the studio. Things we are trying before they become films.
          </p>
        </Reveal>
      </section>

      {/* Experiments */}
      {EXPERIMENTS.map((x, i) => (
        <section key={x.id} id={x.id} style={{ borderTop: "1px solid #E0D9CE", padding: "5rem 2.5rem 7rem", maxWidth: "1600px", margin: "0 auto" }}>
          <div className="lab-grid">
            <Reveal delay={i * 80}>
              <div style={{ position: "sticky", top: "96px" }}>
                <p style={{ ...label, color: "rgba(13,12,10,0.45)", marginBottom: "1.25rem" }}>Experiment {x.number}</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0 }}>
                  {x.title}
                </h2>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.75, color: "rgba(13,12,10,0.65)", maxWidth: "380px", marginTop: "1.5rem" }}>
                  {x.text}
                </p>
                <p style={{ ...label, color: "#C8251A", marginTop: "2rem" }}>{x.meta}</p>
              </div>
            </Reveal>
            <Reveal delay={i * 80 + 120}>
              <div className="lab-art" style={{ aspectRatio: x.aspect }}>
                <img src={x.src} alt={x.alt} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <style>{`
        .lab-grid { display: grid; grid-template-columns: minmax(260px, 1fr) 2fr; gap: 4rem; align-items: start; }
        .lab-art { width: 100%; max-width: 560px; max-height: 88vh; margin: 0 auto; }
        @media (max-width: 768px) {
          .lab-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .lab-art { max-width: 100%; max-height: none; }
        }
      `}</style>
    </div>
  );
}
