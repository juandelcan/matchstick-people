/*
 * Layout.tsx — The Matchstick People
 * Design: Cinematic Editorial
 * Nav: Transparent over hero, solidifies on scroll. Logo left, links right.
 * No rounded corners. No shadows. No borders except single bottom line when solid.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

const LOGO_FLAT = "/media/nav-logo.png";

const navItems = [
  { href: "/work",    label: "Work" },
  { href: "/about",   label: "About" },
  { href: "/press",   label: "Press" },
  { href: "/shop",    label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isHome = location === "/";
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorHovered, setCursorHovered] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    let curX = 0, curY = 0;
    let raf: number;
    const onMove = (e: MouseEvent) => {
      curX = e.clientX;
      curY = e.clientY;
    };
    const animate = () => {
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animate);
    };
    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'A' || t.tagName === 'BUTTON' || t.closest('a') || t.closest('button')) {
        setCursorHovered(true);
      }
    };
    const onLeave = () => setCursorHovered(false);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (y / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const navBg = isHome && !scrolled ? "transparent" : "rgba(245,240,232,0.96)";
  const navBorder = isHome && !scrolled ? "none" : "1px solid #E0D9CE";
  const linkColor = isHome && !scrolled ? "#F5F0E8" : "#0D0C0A";
  const logoFilter = isHome && !scrolled ? "invert(1) brightness(10)" : "none";

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>
      {/* Custom cursor — matchstick figure */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="880 90 250 1800"
          style={{
            width: cursorHovered ? "60px" : "48px",
            height: cursorHovered ? "60px" : "48px",
            display: "block",
            transition: "width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* White body + flame */}
          <path fill="#fff" d="M1017.71,282.77s-5.34,16.98-2,27.59c3.08,9.78,14.69,19.35,28.81,12.14,30.07-15.36,137.64-73.29,125.69-217.68,0,0,63.54,158.23,6.86,260.25-37.11,66.79-58.7,117.95-22.41,137.45,44.19,23.75,57.27-36.67,57.27-36.67,0,0,34.48,79.23-39.53,189.93-47.85,71.56,29.13,87.39,29.13,87.39-22.01,85.85-72.24,150.19-167.15,193.26,2.68-9.54,23.46-84.46,23.67-114.52.23-33.81-13.68-70.13-52.66-70.13-38.98,0-52.28,36.55-52.04,70.13.22,31.1,22.19,109.4,23.6,114.4-8.87-6.75-125.49-50.54-153.05-238.23-34.5-234.86,193.83-415.3,193.83-415.3Z"/>
          {/* Orange head */}
          <path fill="#fe4800" d="M1006.28,751.77c-39.17,0-53.16,36.5-52.92,70.48.21,30.21,21.09,105.49,23.79,115.08l57.72-.12c1.42-5.02,23.5-83.71,23.72-114.96.23-33.75-13.13-70.48-52.3-70.48Z"/>
          {/* White body lower */}
          <path fill="#fff" d="M1072.38,1345.62l-13.16-51.85-9.4-37.02c-3.91-15.41-2.87-31.28-2.56-47.18l.5-153.14,78.7,332.45,47.8-10.38c-19.19-80.29-63.92-254.87-89.99-372.8-6-27.14-19.12-38.14-26.64-43.57l.1-.72c-9.35-5.57-13.25-6.53-21.93-6.7v-17.36h-28.79c-.01,4.29-.08,8.8-.17,13.42-.01-4.64-.02-9.11-.04-13.42h-28.79v17.36c-8.67.17-12.58,1.14-21.93,6.7l.1.72c-7.52,5.43-20.64,16.43-26.64,43.57-26.06,117.93-70.8,292.51-89.99,372.8l47.8,10.38,78.7-332.45.5,153.14c.31,15.9,1.35,31.77-2.56,47.18l-9.4,37.02-13.16,51.85-124.28,486.21,63.3-1.38,125.53-445.15s.05-11.51.12-31.02c1.01,19.5,1.75,31.02,1.75,31.02l125.53,445.15,63.3,1.38-124.28-486.21Z"/>
        </svg>
      </div>

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: "2px", width: `${scrollProgress}%`, background: "#C8251A", zIndex: 9999, transition: "width 0.1s linear" }} />

      {/* Navigation */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: navBg, borderBottom: navBorder, backdropFilter: scrolled ? "blur(12px)" : "none", WebkitBackdropFilter: scrolled ? "blur(12px)" : "none", transition: "background-color 0.4s ease, border-color 0.4s ease", height: "64px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "0 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/">
            <img src={LOGO_FLAT} alt="The Matchstick People" style={{ height: "28px", width: "auto", display: "block", filter: logoFilter, transition: "filter 0.4s ease" }} />
          </Link>

          <nav className="hidden-mobile" style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: location === item.href ? "#C8251A" : linkColor, transition: "color 0.3s ease", display: "inline-block", paddingBottom: "2px", borderBottom: location === item.href ? "1px solid #C8251A" : "1px solid transparent" }}>
                  {item.label}
                </span>
              </Link>
            ))}
            {/* Divider */}
            <span style={{ width: "1px", height: "16px", background: linkColor, opacity: 0.25, display: "block" }} />
            {/* Instagram icon */}
            <a href="https://www.instagram.com/juan_delcan/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: "flex", alignItems: "center", color: linkColor, transition: "color 0.3s ease, opacity 0.3s ease", opacity: 0.85 }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </nav>

          <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", padding: "8px", cursor: "pointer", display: "none", flexDirection: "column" as const, gap: "5px" }} aria-label="Toggle menu">
            <span style={{ width: "22px", height: "1px", background: menuOpen ? "#C8251A" : linkColor, display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
            <span style={{ width: "22px", height: "1px", background: linkColor, display: "block", opacity: menuOpen ? 0 : 1, transition: "all 0.3s" }} />
            <span style={{ width: "22px", height: "1px", background: menuOpen ? "#C8251A" : linkColor, display: "block", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, bottom: 0, backgroundColor: "#F5F0E8", zIndex: 999, display: "flex", flexDirection: "column" as const, justifyContent: "center", padding: "3rem 2.5rem" }}>
          {navItems.map((item, i) => (
            <Link key={item.href} href={item.href}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 400, color: location === item.href ? "#C8251A" : "#0D0C0A", padding: "0.75rem 0", borderBottom: "1px solid #E0D9CE", letterSpacing: "-0.02em", lineHeight: 1.1, animation: `pageFadeIn 0.4s ease ${i * 0.06}s both` }}>
                {item.label}
              </div>
            </Link>
          ))}
          <a href="https://www.instagram.com/juan_delcan/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem 0", color: "#0D0C0A", textDecoration: "none", animation: `pageFadeIn 0.4s ease ${navItems.length * 0.06}s both` }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Instagram</span>
          </a>
        </div>
      )}

      {/* Page content */}
      <main style={{ paddingTop: isHome ? "0" : "64px" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#0D0C0A", color: "#F5F0E8", padding: "5rem 2.5rem 3rem" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "4rem", alignItems: "start", paddingBottom: "3rem", borderBottom: "1px solid rgba(245,240,232,0.12)" }}>
            <div>
              <img src={LOGO_FLAT} alt="The Matchstick People" style={{ height: "28px", width: "auto", display: "block", filter: "invert(1) brightness(10)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.45)", maxWidth: "260px", lineHeight: 1.7 }}>
                An animated universe exploring what it means to be human.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.3)", marginBottom: "1.25rem" }}>Navigate</p>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.55)", marginBottom: "0.6rem" }}>{item.label}</div>
                </Link>
              ))}
            </div>
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(245,240,232,0.3)", marginBottom: "1.25rem" }}>Follow</p>
              {[
                { label: "Instagram", href: "https://www.instagram.com/juan_delcan/" },
                { label: "YouTube", href: "https://www.youtube.com/channel/UCRjQVwyyBD2VpX2u5rFdHkw" },
                { label: "Vimeo", href: "https://vimeo.com/juandelcan" },
              ].map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.55)", marginBottom: "0.6rem", textDecoration: "none" }}>{link.label}</a>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "2rem", flexWrap: "wrap" as const, gap: "1rem" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", color: "rgba(245,240,232,0.25)", textTransform: "uppercase" as const }}>© {new Date().getFullYear()} The Matchstick People</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", color: "rgba(245,240,232,0.25)", textTransform: "uppercase" as const }}>Created by Juan &amp; Valentina Delcan</p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (pointer: fine) { *, *::before, *::after { cursor: none !important; } }
        @media (pointer: coarse) { [ref] { display: none !important; } }
      `}</style>
    </div>
  );
}
