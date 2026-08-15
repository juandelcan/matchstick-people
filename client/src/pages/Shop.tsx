/*
 * Shop.tsx — The Matchstick People
 * Design: Cinematic Editorial
 * Features: Real t-shirt mockups, product cards with size selector, Stripe checkout
 *           Sold-out size detection via Printify stock API
 */

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// CDN-hosted t-shirt photos
const TSHIRT_WHITE_STREET   = "/media/shop-white-tee-street_502bf470.png";
const TSHIRT_WHITE_DETAIL   = "/media/shop-white-tee-detail_41843c26.png";
const TSHIRT_BLACK_DETAIL   = "/media/shop-black-tee-detail_edd246cf.webp";
const TSHIRT_BLACK_STREET   = "/media/shop-black-tee-street_9ef8a783.png";
const TSHIRT_WHITE_MAN      = "/media/shop-white-tee-man-v2_45648f25.png";
const TSHIRT_BLACK_MAN      = "/media/shop-black-tee-man_5b5c6a7a.png";

// Display sizes (XS/S/M/L/XL/XXL) → Printify size labels (S/M/L/XL/2XL/3XL)
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DISPLAY_TO_PRINTIFY: Record<string, string> = {
  XS: "S",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "2XL",
};

const products = [
  {
    id: "white-tee",
    name: "The Matchstick People",
    variant: "White",
    price: "$38",
    image: TSHIRT_WHITE_STREET,
    hoverImage: TSHIRT_WHITE_MAN,
    gallery: [TSHIRT_WHITE_STREET, TSHIRT_WHITE_MAN, TSHIRT_WHITE_DETAIL],
    galleryPosition: ["center top", "center top", "center top"],
    description: "The iconic Matchstick couple on a premium white tee. Bold graphic, clean silhouette.",
    bgColor: "#F5F0E8",
    labelColor: "#0D0C0A",
  },
  {
    id: "black-tee",
    name: "The Matchstick People",
    variant: "Black",
    price: "$38",
    image: TSHIRT_BLACK_STREET,
    hoverImage: TSHIRT_BLACK_MAN,
    gallery: [TSHIRT_BLACK_MAN, TSHIRT_BLACK_STREET, TSHIRT_BLACK_DETAIL],
    galleryPosition: ["center top", "center 20%", "center top"],
    description: "The iconic Matchstick couple on a premium black tee. White figures, orange flame.",
    bgColor: "#0D0C0A",
    labelColor: "#F5F0E8",
  },
];

const comingSoonItems = [
  { category: "Prints", description: "Limited edition archival prints. Each piece is numbered and signed.", symbol: "◻" },
  { category: "Objects", description: "Everyday objects reimagined through the Matchstick People universe.", symbol: "◇" },
  { category: "Collectibles", description: "Designer figures and sculptural pieces for collectors.", symbol: "◯" },
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

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Gildan 5000 Size Guide Data (inches) ────────────────────────────────────
const SIZE_GUIDE = [
  { size: "XS", chest: "31–34", length: "27" },
  { size: "S",  chest: "34–37", length: "28" },
  { size: "M",  chest: "38–41", length: "29" },
  { size: "L",  chest: "42–45", length: "30" },
  { size: "XL", chest: "46–49", length: "31" },
  { size: "XXL",chest: "50–53", length: "32" },
];

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(13,12,10,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#F5F0E8",
          maxWidth: "480px", width: "100%",
          padding: "2.5rem",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "1.25rem", right: "1.25rem",
            background: "none", border: "none", cursor: "pointer",
            ...mono, fontSize: "0.65rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#6B6560",
          }}
        >
          Close ✕
        </button>

        <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#C8251A", marginBottom: "0.5rem" }}>
          Size Guide
        </p>
        <h3 style={{ ...serif, fontSize: "1.6rem", fontWeight: 400, color: "#0D0C0A", margin: "0 0 0.4rem" }}>
          Find your fit.
        </h3>
        <p style={{ ...sans, fontSize: "0.8rem", color: "#6B6560", lineHeight: 1.6, marginBottom: "1.75rem" }}>
          Measurements are in inches. This is a relaxed unisex fit — if you prefer a slimmer look, size down.
        </p>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #D5CFC4" }}>
              {["Size", "Chest (in)", "Length (in)"].map((h) => (
                <th key={h} style={{
                  ...mono, fontSize: "0.48rem", letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "#6B6560",
                  textAlign: "left", padding: "0 0 0.75rem",
                  fontWeight: 400,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE.map((row, i) => (
              <tr key={row.size} style={{ borderBottom: i < SIZE_GUIDE.length - 1 ? "1px solid #EDE9E0" : "none" }}>
                <td style={{ ...mono, fontSize: "0.65rem", fontWeight: 600, color: "#0D0C0A", padding: "0.75rem 0" }}>{row.size}</td>
                <td style={{ ...sans, fontSize: "0.82rem", color: "#4A4540", padding: "0.75rem 0" }}>{row.chest}</td>
                <td style={{ ...sans, fontSize: "0.82rem", color: "#4A4540", padding: "0.75rem 0" }}>{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ ...sans, fontSize: "0.72rem", color: "#9B948C", marginTop: "1.5rem", lineHeight: 1.6 }}>
          Gildan 5000 — 100% cotton, 5.3 oz/yd². Unisex regular fit.
        </p>
      </div>
    </div>
  );
}

// ── ProductCard ──────────────────────────────────────────────────────────────
// stockMap: Printify size label → inStock boolean (e.g. { S: true, M: false, ... })
// If stockMap is undefined (still loading), all sizes are treated as available.
function ProductCard({
  product,
  stockMap,
}: {
  product: typeof products[0];
  stockMap: Record<string, boolean> | undefined;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  const isBlack = product.variant === "Black";
  const gallery = product.gallery ?? [product.image];

  const createCheckout = trpc.shop.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const totalCents = quantity * 3800;

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size before continuing.");
      return;
    }
    createCheckout.mutate({
      items: [{
        productId: product.id,
        productName: `The Matchstick People — ${product.variant} Tee`,
        size: selectedSize,
        quantity,
        unitAmountCents: 3800,
        imageUrl: gallery[0],
      }],
      origin: window.location.origin,
    });
  };

  // Determine if a display size is in stock.
  // If stockMap is undefined (loading) or empty, assume all sizes are in stock.
  const isSizeInStock = (displaySize: string): boolean => {
    if (!stockMap || Object.keys(stockMap).length === 0) return true;
    const printifySize = DISPLAY_TO_PRINTIFY[displaySize] ?? displaySize;
    // If the key doesn't exist in the map, treat as in stock (unknown = available)
    return stockMap[printifySize] !== false;
  };

  return (
    <Reveal>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Image */}
        <div
          style={{
            overflow: "hidden",
            backgroundColor: isBlack ? "#111" : "#e8e4dc",
            position: "relative",
            cursor: "pointer",
          }}
        >
          {/* Gallery images */}
          {gallery.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${product.name} — ${product.variant} view ${i + 1}`}
              style={{
                width: "100%",
                aspectRatio: "3/4",
                objectFit: "cover",
                objectPosition: product.galleryPosition?.[i] ?? "center top",
                display: "block",
                position: i === 0 ? "relative" : "absolute",
                top: 0,
                left: 0,
                transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                opacity: activeIdx === i ? 1 : 0,
                transform: activeIdx === i ? "scale(1)" : "scale(1.03)",
                pointerEvents: "none",
              }}
            />
          ))}
          {/* NEW badge */}
          <div style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            padding: "0.35rem 0.75rem",
            backgroundColor: "#C8251A",
            color: "#F5F0E8",
            ...mono,
            fontSize: "0.5rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}>
            New
          </div>
        </div>

        {/* Gallery thumbnail dots */}
        {gallery.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 0 0" }}>
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: "48px",
                  height: "48px",
                  padding: 0,
                  border: activeIdx === i ? "2px solid #C8251A" : "2px solid transparent",
                  cursor: "pointer",
                  overflow: "hidden",
                  background: "none",
                  transition: "border-color 0.2s ease",
                  flexShrink: 0,
                }}
                aria-label={`View ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Product info */}
        <div style={{ padding: "1.75rem 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
            <p style={{ ...serif, fontSize: "1.1rem", fontWeight: 500, color: "#0D0C0A", margin: 0 }}>
              {product.name}
            </p>
            <p style={{ ...mono, fontSize: "0.75rem", color: "#0D0C0A", margin: 0 }}>{product.price}</p>
          </div>
          <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1rem" }}>
            {product.variant} Tee — Unisex
          </p>
          <p style={{ ...sans, fontSize: "0.85rem", color: "#6B6560", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            {product.description}
          </p>

          {/* Size Guide Modal */}
          {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

          {/* Size selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", margin: 0 }}>
                Select Size
              </p>
              <button
                onClick={() => setShowSizeGuide(true)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  ...mono, fontSize: "0.48rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#C8251A",
                  textDecoration: "underline", textUnderlineOffset: "3px",
                  padding: 0,
                }}
              >
                Size Guide
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {SIZES.map((size) => {
                const inStock = isSizeInStock(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => inStock && setSelectedSize(size)}
                    disabled={!inStock}
                    title={!inStock ? "Sold out" : undefined}
                    style={{
                      position: "relative",
                      width: "2.5rem",
                      height: "2.5rem",
                      border: isSelected
                        ? "1px solid #0D0C0A"
                        : inStock
                          ? "1px solid #D5CFC4"
                          : "1px solid #E0D9CE",
                      backgroundColor: isSelected
                        ? "#0D0C0A"
                        : "transparent",
                      color: isSelected
                        ? "#F5F0E8"
                        : inStock
                          ? "#6B6560"
                          : "#C5BFB5",
                      ...mono,
                      fontSize: "0.55rem",
                      letterSpacing: "0.08em",
                      cursor: inStock ? "pointer" : "not-allowed",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                    }}
                  >
                    {size}
                    {/* Diagonal strikethrough line for sold-out sizes */}
                    {!inStock && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          viewBox="0 0 40 40"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                          aria-hidden="true"
                        >
                          <line x1="4" y1="4" x2="36" y2="36" stroke="#C5BFB5" strokeWidth="1" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Sold-out legend — only shown if at least one size is sold out */}
            {stockMap && SIZES.some((s) => !isSizeInStock(s)) && (
              <p style={{ ...mono, fontSize: "0.42rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B948C", marginTop: "0.6rem" }}>
                ╲ Sold out
              </p>
            )}
          </div>

          {/* Quantity stepper + Buy Now */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
            {/* Stepper — only shown once item is added */}
            {quantity > 0 && <div style={{ display: "flex", alignItems: "center", border: "1px solid #D5CFC4", flexShrink: 0 }}>
              <button
                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                disabled={quantity <= 0}
                aria-label="Decrease quantity"
                style={{
                  width: "2.25rem",
                  height: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: quantity <= 0 ? "not-allowed" : "pointer",
                  ...mono,
                  fontSize: "1rem",
                  color: quantity <= 0 ? "#C0B8AE" : "#0D0C0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s ease",
                }}
              >−</button>
              <div style={{
                width: "2.5rem",
                borderLeft: "1px solid #D5CFC4",
                borderRight: "1px solid #D5CFC4",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...mono,
                fontSize: "0.75rem",
                color: "#0D0C0A",
                userSelect: "none",
              }}>{quantity}</div>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
                style={{
                  width: "2.25rem",
                  height: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: quantity >= 10 ? "not-allowed" : "pointer",
                  ...mono,
                  fontSize: "1rem",
                  color: quantity >= 10 ? "#C0B8AE" : "#0D0C0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s ease",
                }}>+</button>
            </div>}

            {/* Buy Now button or Add to order state */}
            {quantity === 0 ? (
              <button
                onClick={() => setQuantity(1)}
                style={{
                  flex: 1,
                  padding: "1rem",
                  backgroundColor: "transparent",
                  color: "#0D0C0A",
                  border: "1px solid #0D0C0A",
                  ...mono,
                  fontSize: "0.6rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease, color 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0D0C0A"; e.currentTarget.style.color = "#F5F0E8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#0D0C0A"; }}
              >
                Add to Order
              </button>
            ) : (
              <button
                onClick={handleBuyNow}
                disabled={createCheckout.isPending}
                style={{
                  flex: 1,
                  padding: "1rem",
                  backgroundColor: createCheckout.isPending ? "#6B6560" : "#0D0C0A",
                  color: "#F5F0E8",
                  border: "none",
                  ...mono,
                  fontSize: "0.6rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  cursor: createCheckout.isPending ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!createCheckout.isPending) e.currentTarget.style.backgroundColor = "#C8251A"; }}
                onMouseLeave={(e) => { if (!createCheckout.isPending) e.currentTarget.style.backgroundColor = "#0D0C0A"; }}
              >
                {createCheckout.isPending
                  ? "Redirecting…"
                  : `Buy Now — $${(totalCents / 100).toFixed(0)}`}
              </button>
            )}
          </div>

          {/* Free shipping reassurance — always visible */}
          <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 0L7.5 4.5H12L8.25 7.5L9.75 12L6 9L2.25 12L3.75 7.5L0 4.5H4.5L6 0Z" fill="#C8251A"/>
            </svg>
            <span style={{ ...mono, fontSize: "0.48rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#C8251A" }}>
              Free shipping on all orders
            </span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 0L7.5 4.5H12L8.25 7.5L9.75 12L6 9L2.25 12L3.75 7.5L0 4.5H4.5L6 0Z" fill="#C8251A"/>
            </svg>
          </div>

          {/* Bundle upsell prompt — only show when product is not removed */}
          {quantity > 0 && (
            <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
              <a
                href="/shop/select?products=rym4mzxan3:1,dokwhvxln2:1"
                style={{
                  ...mono,
                  fontSize: "0.5rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6B6560",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  cursor: "pointer",
                }}
              >
                {product.variant === "White"
                  ? "Get the Black Tee too — shop both →"
                  : "Get the White Tee too — shop both →"}
              </a>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function Shop() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  // Fetch stock levels from Printify (cached for 5 minutes via tRPC)
  const { data: stockData } = trpc.shop.getStock.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Show toast on return from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    if (order === "success") {
      toast.success("Order confirmed! You'll receive an email confirmation shortly.");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (order === "cancelled") {
      toast("Checkout cancelled. Your cart is still waiting.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitted(true);
    toast.success("You're on the list. We'll be in touch.");
  };

  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2.5rem 5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "none" : "translateY(20px)", transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
          <p style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1.5rem" }}>The Shop</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "end" }} className="shop-header-grid">
            <h1 style={{ ...serif, fontSize: "clamp(3.5rem, 7vw, 8rem)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.03em", color: "#0D0C0A", margin: 0 }}>
              Wear the<br /><em style={{ fontStyle: "italic", color: "#C8251A" }}>story.</em>
            </h1>
            <p style={{ ...sans, fontSize: "0.95rem", color: "#6B6560", lineHeight: 1.8, maxWidth: "380px" }}>
              The first Matchstick People collection — minimal apparel
              that carries the story quietly. Two tees, one graphic,
              two colors. Each piece limited and considered.
            </p>
          </div>
        </div>
        {/* Free Shipping Banner */}
        <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E0D9CE" }} />
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1.25rem",
            border: "1px solid #C8251A",
            flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 4H8V2.5C8 1.12 6.88 0 5.5 0C4.12 0 3 1.12 3 2.5V4H1.5C0.67 4 0 4.67 0 5.5V10.5C0 11.33 0.67 12 1.5 12H9.5C10.33 12 11 11.33 11 10.5V5.5C11 4.67 10.33 4 9.5 4ZM5.5 9C4.67 9 4 8.33 4 7.5C4 6.67 4.67 6 5.5 6C6.33 6 7 6.67 7 7.5C7 8.33 6.33 9 5.5 9ZM4 4V2.5C4 1.67 4.67 1 5.5 1C6.33 1 7 1.67 7 2.5V4H4Z" fill="#C8251A"/>
            </svg>
            <span style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#C8251A", whiteSpace: "nowrap" }}>
              Free Shipping on All Orders
            </span>
          </div>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E0D9CE" }} />
        </div>
      </section>

      {/* ── PRODUCT GRID ────────────────────────────────────────────── */}
      <section style={{ padding: "0 2.5rem 8rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560" }}>01 — Apparel</p>
              <span style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#C8251A" }}>Now Available</span>
            </div>
          </Reveal>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }} className="product-grid">
          {products.map((product, i) => (
            <div key={product.id} style={{ animationDelay: `${i * 100}ms` }}>
              <ProductCard
                product={product}
                stockMap={stockData?.[product.id]}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B6560" }}>
            Unisex fit · Sizes XS–XXL · Free shipping on all orders
          </p>
        </div>
      </section>

      {/* ── WHAT'S COMING ───────────────────────────────────────────── */}
      <section style={{ padding: "4rem 2.5rem 6rem", maxWidth: "1600px", margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "5rem", alignItems: "start", marginBottom: "4rem" }} className="coming-header-grid">
            <div>
              <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1rem" }}>02 — Also coming</p>
              <div style={{ height: "1px", backgroundColor: "#E0D9CE" }} />
            </div>
            <p style={{ ...serif, fontSize: "clamp(1.2rem, 2vw, 1.8rem)", fontWeight: 300, lineHeight: 1.5, color: "#0D0C0A" }}>
              Objects that carry the weight of a small, human story.
              Each piece in the Matchstick People shop will be limited,
              considered, and made to last.
            </p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }} className="coming-grid">
          {comingSoonItems.map((item, i) => (
            <Reveal key={item.category} delay={i * 80}>
              <div style={{ borderTop: "1px solid #E0D9CE", paddingTop: "1.5rem" }}>
                <p style={{ ...serif, fontSize: "2rem", color: "#C8251A", marginBottom: "1rem", fontWeight: 300 }}>{item.symbol}</p>
                <p style={{ ...serif, fontSize: "1.2rem", fontWeight: 500, color: "#0D0C0A", marginBottom: "0.75rem" }}>{item.category}</p>
                <p style={{ ...sans, fontSize: "0.875rem", color: "#6B6560", lineHeight: 1.7 }}>{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── EMAIL WAITLIST ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0D0C0A", padding: "7rem 2.5rem" }}>
        <Reveal>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <p style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)", marginBottom: "1.5rem" }}>Stay in the loop</p>
            <h2 style={{ ...serif, fontSize: "clamp(2.5rem, 5vw, 6rem)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.03em", color: "#F5F0E8", margin: "0 0 1.5rem" }}>
              More is<br /><em style={{ fontStyle: "italic", color: "rgba(245,240,232,0.45)" }}>coming.</em>
            </h2>
            <p style={{ ...sans, fontSize: "0.9rem", color: "rgba(245,240,232,0.45)", lineHeight: 1.8, marginBottom: "3rem" }}>
              Sign up to be first to know about new releases, limited editions, and everything else from the Matchstick People universe.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0", maxWidth: "520px" }} className="waitlist-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "1rem 1.25rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", backgroundColor: "rgba(245,240,232,0.06)", border: "1px solid rgba(245,240,232,0.15)", borderRight: "none", color: "#F5F0E8", outline: "none" }}
                />
                <button
                  type="submit"
                  style={{ padding: "1rem 1.5rem", backgroundColor: "#C8251A", color: "#F5F0E8", border: "none", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a01e15")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C8251A")}
                >
                  Notify me
                </button>
              </form>
            ) : (
              <div style={{ padding: "1.5rem", border: "1px solid rgba(200,37,26,0.4)", backgroundColor: "rgba(200,37,26,0.08)", maxWidth: "520px" }}>
                <p style={{ ...serif, fontSize: "1.2rem", color: "#F5F0E8", fontWeight: 400 }}>You're on the list. ◆</p>
                <p style={{ ...sans, fontSize: "0.85rem", color: "rgba(245,240,232,0.45)", marginTop: "0.5rem" }}>We'll be in touch when the shop opens.</p>
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .shop-header-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .product-grid { grid-template-columns: 1fr !important; }
          .coming-header-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .coming-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .coming-grid { grid-template-columns: 1fr !important; }
          .waitlist-form { flex-direction: column !important; }
          .waitlist-form input { border-right: 1px solid rgba(245,240,232,0.15) !important; border-bottom: none !important; }
        }
      `}</style>
    </div>
  );
}
