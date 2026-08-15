/*
 * Press.tsx — The Matchstick People
 * Design: Cinematic Editorial — Playfair Display for headlines, Plus Jakarta Sans for UI
 * Layout: Full-width logo grid with featured articles below
 * Logos: Real PNG images from CDN
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

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

// ── Vimeo Lightbox ─────────────────────────────────────────────────────────
function VimeoLightbox({ id, onClose }: { id: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(13,12,10,0.95)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", animation: "fadeIn 0.3s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "1100px", aspectRatio: "16/9", position: "relative", animation: "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <iframe src={`https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&badge=0&dnt=1`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Press Video" />
      </div>
      <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.6)", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>×</span> Close
      </button>
    </div>
  );
}

// CDN logo URLs — dark logos with transparent backgrounds
const PROMPT_IMG = "/media/Prompt_24d3be50.png";

const LOGOS: Record<string, string> = {
  "Prompt Magazine": PROMPT_IMG,
  CNN:                "/media/cnn_8a10905c.png",
  Artnet:             "/media/artnet_7e39c811.png",
  Dezeen:             "/media/dezeen_884ebe78.png",
  PBS:                "/media/pbs_770d3db8.png",
  HuffPost:           "/media/huffpost_7cb6dc41.png",
  Globo:              "/media/globo_de498790.png",
  BuzzFeed:           "/media/buzzfeed_4cfa3901.png",
  TODAY:              "/media/today-show_ec105a3f.png",
  ZDF:                "/media/zdf_41eb73a0.png",
  Telemundo:          "/media/telemundo_6623d93d.png",
  "Los Angeles":      "/media/la-magazine_3b6dc787.png",
  "The New York Times":"/media/nyt_2903e77f.png",
  "Excite / Neut":    "/media/neut_275cecba.png",
};

const pressOutlets = [
  { name: "Prompt Magazine", url: "#",                                                                                                          article: "\"Technology doesn't make art colder, it makes the flame reach further\" — Juan Delcan interviewed by Braw Haus",                type: "Magazine" },
  { name: "CNN",              url: "#",  vimeoId: "1169006399",                                                                           article: "Matchstick People animations capture the human experience in its simplest form",               type: "Television / Digital" },
  { name: "Artnet",           url: "https://news.artnet.com/art-world/artists-viral-match-video-coronavirus-1805979",                           article: "Artists Created a Viral Matchstick Video to Promote Coronavirus Social Distancing",            type: "Art Publication" },
  { name: "Dezeen",           url: "#",                                                                                                          article: "Animated matchstick figures explore universal human emotions",                                 type: "Design Publication" },
  { name: "PBS",              url: "https://www.pbs.org/newshour/",                                                                             article: "Art in the Age of Isolation: The Matchstick People",                                          type: "Television / Digital" },
  { name: "HuffPost",         url: "https://www.huffpost.com/entry/solidarity-coronavirus_n_5e7151e1c5b6eab7793e3d97",                          article: "Solidarity in the Time of Coronavirus",                                                       type: "Digital Media" },
  { name: "Globo",            url: "https://globoplay.globo.com/e-de-casa/t/XKFkSFB7cS/",                                                       article: "As pessoas-fósforo que conquistaram o mundo",                                                  type: "Television / Digital" },
  { name: "BuzzFeed",         url: "https://www.buzzfeed.com/jonmichaelpoff/stop-coronavirus-high-risk-people-social-distancing",               article: "This Matchstick Animation Shows Why Social Distancing Is So Important",                       type: "Digital Media" },
  { name: "TODAY",            url: "https://www.today.com/health/viral-match-video-shows-how-social-distancing-can-save-lives-t176068",         article: "Viral match video shows how social distancing can save lives",                                type: "Television" },
  { name: "ZDF",              url: "#",                                                                                                          article: "Streichholzmenschen: Die kleinen Figuren mit der großen Botschaft",                           type: "Television" },
  { name: "Telemundo",        url: "#",                                                                                                          article: "El artista que convirtió una cerilla en un universo",                                         type: "Television" },
  { name: "Los Angeles",      url: "https://lamag.com/celebrity/stars-of-quarantine/",                                                          article: "Stars of Quarantine",                                                                         type: "Magazine" },
  { name: "The New York Times",url: "#",                                                                                                         article: "Coverage of The Matchstick People",                                                           type: "Newspaper" },
  { name: "Excite / Neut",    url: "https://www.excite.co.jp/news/article/NeutMagazine_2020_04_17_59926/",                                      article: "マッチ棒の人々が語る、人間の普遍的な物語",                                                    type: "Magazine" },
];

function LogoCell({ outlet, onOpenVideo }: { outlet: typeof pressOutlets[0]; onOpenVideo: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const logoSrc = LOGOS[outlet.name];
  const isClickable = outlet.url !== "#" || !!outlet.vimeoId;
  const handleClick = (e: React.MouseEvent) => {
    if (outlet.vimeoId) { e.preventDefault(); onOpenVideo(outlet.vimeoId); }
  };
  return (
    <a
      href={outlet.vimeoId ? "#" : outlet.url}
      target={outlet.url !== "#" && !outlet.vimeoId ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        borderRight: "1px solid #D8D0C4",
        borderBottom: "1px solid #D8D0C4",
        minHeight: "160px",
        textDecoration: "none",
        backgroundColor: hovered && isClickable ? "#EDE8DF" : "transparent",
        transition: "background-color 0.3s ease",
        cursor: isClickable ? "pointer" : "default",
      }}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={outlet.name}
          style={{
            maxHeight: "80px",
            maxWidth: "240px",
            width: "auto",
            objectFit: "contain",
            opacity: hovered ? 1 : 0.65,
            transition: "opacity 0.3s ease",
            display: "block",

          }}
        />
      ) : (
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#0D0C0A",
          opacity: hovered ? 1 : 0.6,
          transition: "opacity 0.3s ease",
        }}>
          {outlet.name}
        </span>
      )}
    </a>
  );
}

export default function Press() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setHeaderVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "8rem 2.5rem 5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "none" : "translateY(20px)", transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6560", marginBottom: "1.5rem" }}>In the Media</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "end" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.5rem, 7vw, 8rem)", fontWeight: 400, lineHeight: 0.92, letterSpacing: "-0.03em", color: "#0D0C0A", margin: 0 }}>
              Press &amp;<br /><em style={{ fontStyle: "italic", color: "#C8251A" }}>Coverage</em>
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", lineHeight: 1.7, color: "#4A4540", maxWidth: "420px", marginBottom: "0.5rem" }}>
              The Matchstick People have been featured in media across four continents — from major television networks to leading art, design, and cultural publications.
            </p>
          </div>
        </div>
      </section>

      {/* Prompt Magazine Featured Spotlight */}
      <section style={{ padding: "0 2.5rem 6rem", maxWidth: "1600px", margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#9B9590", marginBottom: "2rem" }}>Latest Feature</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", border: "1px solid #D8D0C4" }}>
            <div style={{ overflow: "hidden" }}>
              <img
                src={PROMPT_IMG}
                alt="Prompt Magazine — Juan Delcan"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", minHeight: "480px" }}
              />
            </div>
            <div style={{ padding: "4rem 3.5rem", display: "flex", flexDirection: "column" as const, justifyContent: "center", backgroundColor: "#0D0C0A" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.4)", marginBottom: "1.5rem" }}>Magazine — 2025</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 2.5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, color: "#F5F0E8", margin: "0 0 1.5rem", letterSpacing: "-0.01em" }}>
                <em style={{ fontStyle: "italic", color: "#C8251A" }}>"Technology doesn't make art colder,</em><br />it makes the flame reach further"
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", lineHeight: 1.75, color: "rgba(245,240,232,0.55)", margin: "0 0 2.5rem" }}>
                Juan Delcan interviewed by Braw Haus for Prompt Magazine — on the intersection of technology, art, and the universal language of the Matchstick People.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.3)" }}>Prompt Magazine</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Logo Grid */}
      <section style={{ padding: "0 2.5rem 6rem", maxWidth: "1600px", margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#9B9590", marginBottom: "2rem" }}>As Seen In</p>
        </Reveal>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          border: "1px solid #D8D0C4",
          borderRight: "none",
          borderBottom: "none",
        }}>
          {pressOutlets.map((outlet, i) => (
            <Reveal key={outlet.name} delay={i * 35}>
              <LogoCell outlet={outlet} onOpenVideo={setLightboxId} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section style={{ padding: "0 2.5rem 8rem", maxWidth: "1600px", margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid #D8D0C4", paddingTop: "2rem", marginBottom: "3rem" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#9B9590" }}>Featured Articles</p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#9B9590" }}>{pressOutlets.filter(o => o.url !== "#").length} Links</p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
          {pressOutlets.filter(o => o.url !== "#" || o.vimeoId).map((outlet, i) => (
            <Reveal key={outlet.name} delay={i * 50}>
              <ArticleCard outlet={outlet} index={i} onOpenVideo={setLightboxId} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Media Inquiries CTA */}
      <section style={{ backgroundColor: "#0D0C0A", padding: "6rem 2.5rem" }}>
        <Reveal>
          <div style={{ maxWidth: "1600px", margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.4)", marginBottom: "1.5rem" }}>Media Inquiries</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 5rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "0.01em", color: "#F5F0E8", margin: "0 0 1rem" }}>
                Press &amp;<br /><em style={{ fontStyle: "italic", color: "rgba(245,240,232,0.4)" }}>Licensing</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "rgba(245,240,232,0.45)", lineHeight: 1.8 }}>
                For press inquiries, image requests, or licensing information, please reach out directly.
              </p>
            </div>
            <Link href="/contact">
              <div style={{ display: "inline-block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#F5F0E8", border: "1px solid rgba(245,240,232,0.3)", padding: "1rem 2rem", cursor: "pointer" }}>
                Contact us →
              </div>
            </Link>
          </div>
        </Reveal>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .press-header { display: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
      {lightboxId && <VimeoLightbox id={lightboxId} onClose={() => setLightboxId(null)} />}
    </div>
  );
}

function ArticleCard({ outlet, index, onOpenVideo }: { outlet: typeof pressOutlets[0]; index: number; onOpenVideo: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const handleClick = (e: React.MouseEvent) => {
    if (outlet.vimeoId) { e.preventDefault(); onOpenVideo(outlet.vimeoId); }
  };
  return (
    <a
      href={outlet.vimeoId ? "#" : outlet.url}
      target={outlet.vimeoId ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        padding: "2rem 2.5rem",
        borderBottom: "1px solid #D8D0C4",
        borderRight: index % 2 === 0 ? "1px solid #D8D0C4" : "none",
        textDecoration: "none",
        backgroundColor: hovered ? "#EDE8DF" : "transparent",
        transition: "background-color 0.3s ease",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        {LOGOS[outlet.name] ? (
          <img
            src={LOGOS[outlet.name]}
            alt={outlet.name}
            style={{ maxHeight: "48px", maxWidth: "180px", width: "auto", objectFit: "contain", display: "block" }}
          />
        ) : (
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#C8251A", fontWeight: 600 }}>{outlet.name}</span>
        )}
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#9B9590" }}>{outlet.type}</span>
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.45, color: "#0D0C0A", margin: 0 }}>
        {outlet.article}
      </p>
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: hovered ? "#C8251A" : "#9B9590", transition: "color 0.3s ease" }}>Read Article</span>
        <span style={{ color: hovered ? "#C8251A" : "#9B9590", fontSize: "0.7rem", transition: "color 0.3s ease" }}>→</span>
      </div>
    </a>
  );
}
