/*
 * Work.tsx — The Matchstick People
 * Design: Cinematic Editorial
 * Full-bleed masonry grid. No cards, no borders. Title/year on hover overlay.
 * Click opens Vimeo lightbox.
 */

import { useEffect, useRef, useState } from "react";

const allVideos = [
  { id: "1168677805", title: "Pinball", year: "2022", thumb: "https://i.vimeocdn.com/video/2127145523-b166019bedae4785835d81bb7ff5c8a1658f1fd00523f9540a92ab219460f57a-d_640?region=us" },
  { id: "1168677823", title: "Runaway Matchstick", year: "2023", thumb: "https://i.vimeocdn.com/video/2127145350-05aec29ffd1fd707fb3da3329e6e48fe17bad8630a941adb2baf3a67733ba7b8-d_640?region=us" },
  { id: "1168677609", title: "About Time", year: "2024", thumb: "https://i.vimeocdn.com/video/2127146991-ded40b757e51f9993b3f271741ff3b0127ee5e36955d42086b76e653b4568465-d_640?region=us" },
  { id: "1168677617", title: "Magic Carpet", year: "2024", thumb: "https://i.vimeocdn.com/video/2127146903-6abf4639e4b52e555dc0f2d5b986165a463f1870c660fe24b9bfdee2c2a026a9-d_640?region=us" },
  { id: "1168677627", title: "5+ Minutes", year: "2024", thumb: "https://i.vimeocdn.com/video/2127146771-d684845c546dd87f422d2193952eeccfb0a90a830681e86aff0cfb4f816c08ea-d_640?region=us" },
  { id: "1168677647", title: "13 Rue", year: "2024", thumb: "https://i.vimeocdn.com/video/2127146694-34a953062fd2193293a4685cee7b6c95f1c64e300e86d014b0bf2dd12cfe1e6f-d_640?region=us" },
  { id: "1168677665", title: "Anger Management", year: "2023", thumb: "https://i.vimeocdn.com/video/2127146648-27382b188c2aa3202339ef6649eb59376548f2fd64873d3da337ed37c4617817-d_640?region=us" },
  { id: "1168677686", title: "Free Dance", year: "2023", thumb: "https://i.vimeocdn.com/video/2127146593-5b8e9d19cf122d0c466adaa0fdc8859bf1bcc74d2e9d6a8f82c48048e44bb260-d_640?region=us" },
  { id: "1168677705", title: "I Suck at Meditating", year: "2023", thumb: "https://i.vimeocdn.com/video/2127146459-fddeb369680500aa35e84d292befae1fc477b6523922f65d0526dc54f9635369-d_640?region=us" },
  { id: "1168677722", title: "Little Boxes", year: "2023", thumb: "https://i.vimeocdn.com/video/2127146312-9f7bb55bfbfd4f2731b78dba57e8a1b5573f0baa69a9b6342c5c9bac434be79e-d_640?region=us" },
  { id: "1168677743", title: "Magic Carpet CA", year: "2024", thumb: "https://i.vimeocdn.com/video/2127137209-9a2c9ced630291824a96baa083a57f2aa08f47878550aca8d88db11ec30388eb-d_640?region=us" },
  { id: "1168677760", title: "Match One & Match Two", year: "2021", thumb: "https://i.vimeocdn.com/video/2127146107-33bb7507e3aa039b0f734e7d326b85bbd5295c20ca8ca954380da7eaf235b096-d_640?region=us" },
  { id: "1168677770", title: "Night Tailgating", year: "2023", thumb: "https://i.vimeocdn.com/video/2127145921-13ef3b52760d03ba7e0f3e3e41dd2001bf1c22d3bcb8cb3736d2327f6129d97e-d_640?region=us" },
  { id: "1168677780", title: "One Step at a Time", year: "2023", thumb: "https://i.vimeocdn.com/video/2127145781-b65913ed6708ab40a3a10b3e02665cca7f223a2b4d463fb66037ee1305b1a812-d_640?region=us" },
  { id: "1168677791", title: "Party Scene", year: "2023", thumb: "https://i.vimeocdn.com/video/2127145653-b3ec3f31c6e576ea5b7d03914a4ec6e13f0a987454a4bb1483e14980c3e75df4-d_640?region=us" },
  { id: "1168677818", title: "Recurrent Dream at 3AM", year: "2023", thumb: "https://i.vimeocdn.com/video/2127145431-a85f0904e6029efa4499360047e6000bb8b2e1ea5167bb025e56e73eb9b23ea7-d_640?region=us" },
  { id: "1168677839", title: "Skeleton", year: "2025", thumb: "https://i.vimeocdn.com/video/2127137369-7025584a239baadd0ac82ef0d15bbe5f7757be917c5aab5dfa49144b6097a93f-d_640?region=us" },
  { id: "1168677851", title: "Tailgating", year: "2023", thumb: "https://i.vimeocdn.com/video/2127137386-9f945422c681df364b157a586d470da614b1da6a07a8d83c51e27a75fb678fd1-d_640?region=us" },
  { id: "1168677858", title: "Tango", year: "2022", thumb: "https://i.vimeocdn.com/video/2127145131-6fba4996b95de27c15fff9179a44c973dca0380221e2555b8a5b1dc98c9cd77e-d_640?region=us" },
  { id: "1168677867", title: "Touch", year: "2022", thumb: "https://i.vimeocdn.com/video/2127145029-d5ef706ce0e790420622122b7c4fb083a109c8dcdde25d3b2ec5ecab9ebf0388-d_640?region=us" },
  { id: "1168677881", title: "Will-o'-the-Wisp", year: "2023", thumb: "https://i.vimeocdn.com/video/2127144905-f86ae44150ed47da12e20e863eaf62aad6adbd7923a5b7a3e1538d1c2d27b626-d_640?region=us" },
  { id: "1168677893", title: "Hollywood (WIP)", year: "2025", thumb: "https://i.vimeocdn.com/video/2127144081-127373e2550730b8948cb6faef5b2e7e28e8e542a317a94ceb251f586b9e10d9-d_640?region=us" },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FilmCell({ id, title, year, thumb, onOpen, delay = 0 }: {
  id: string; title: string; year: string; thumb: string;
  onOpen: (id: string) => void; delay?: number;
}) {
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onClick={() => onOpen(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", overflow: "hidden", cursor: "pointer", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}
    >
      <img src={thumb} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,12,10,0.85) 0%, rgba(13,12,10,0.05) 50%, transparent 100%)", opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: hovered ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.7)", opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)", width: "52px", height: "52px", border: "1px solid rgba(245,240,232,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#F5F0E8"><polygon points="6,3 20,12 6,21" /></svg>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem 0.875rem", transform: hovered ? "translateY(0)" : "translateY(8px)", opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 500, color: "#F5F0E8", margin: 0, lineHeight: 1.2 }}>{title}</p>
      </div>
    </div>
  );
}

function Lightbox({ id, onClose }: { id: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(13,12,10,0.95)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", animation: "fadeIn 0.3s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "1100px", aspectRatio: "16/9", position: "relative", animation: "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <iframe src={`https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&badge=0&dnt=1`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Film" />
      </div>
      <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.6)", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>×</span> Close
      </button>
    </div>
  );
}

export default function Work() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeaderVisible(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>
      <section style={{ padding: "8rem 2.5rem 4rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "none" : "translateY(20px)", transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6560", marginBottom: "1.5rem" }}>01 — The Animations</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "end" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.5rem, 7vw, 8rem)", fontWeight: 400, lineHeight: 0.92, letterSpacing: "-0.03em", color: "#0D0C0A", margin: 0 }}>
              All<br /><em style={{ fontStyle: "italic", color: "#C8251A" }}>Works</em>
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#6B6560", lineHeight: 1.8, maxWidth: "380px" }}>
              Every animation is a short story — a moment of human experience distilled into its simplest possible form. {allVideos.length} films and counting.
            </p>
          </div>
        </div>
        <div style={{ height: "1px", backgroundColor: "#E0D9CE", marginTop: "3rem" }} />
      </section>

      <section style={{ padding: "0 0 8rem" }}>
        <div className="work-grid">
          {allVideos.map((v, i) => (
            <FilmCell key={v.id} {...v} onOpen={setActiveId} delay={(i % 4) * 80} />
          ))}
        </div>
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "3rem 2.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#6B6560" }}>{allVideos.length} films</p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#6B6560" }}>Click any film to watch</p>
        </div>
      </section>

      {activeId && <Lightbox id={activeId} onClose={() => setActiveId(null)} />}

      <style>{`
        .work-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
        .work-grid > div { aspect-ratio: 4/3; }
        .work-grid > div:nth-child(7n+1) { grid-column: span 2; aspect-ratio: 16/7; }
        .work-grid > div:nth-child(7n+4) { aspect-ratio: 2/3; }
        .work-grid > div:nth-child(13n+7) { grid-column: span 3; aspect-ratio: 21/8; }
        @media (max-width: 900px) {
          .work-grid { grid-template-columns: repeat(2, 1fr); }
          .work-grid > div:nth-child(7n+1) { grid-column: span 2; aspect-ratio: 16/9; }
          .work-grid > div:nth-child(7n+4) { aspect-ratio: 16/10; }
        }
        @media (max-width: 600px) {
          .work-grid { grid-template-columns: 1fr; }
          .work-grid > div:nth-child(7n+1) { grid-column: span 1; aspect-ratio: 16/9; }
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
