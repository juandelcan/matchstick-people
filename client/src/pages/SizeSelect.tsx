/*
 * SizeSelect.tsx — The Matchstick People
 * Design: Cinematic Editorial (matches Shop.tsx)
 *
 * This page is the interstitial between Instagram/Facebook Shopping and Stripe checkout.
 * Flow:
 *   1. Customer taps "Buy" on Instagram
 *   2. Meta redirects to /api/checkout?products=CONTENT_ID:QTY
 *   3. Server redirects to /shop/select?products=CONTENT_ID:QTY (this page)
 *   4. Customer picks their size(s) and adjusts quantity
 *   5. "Continue to checkout" creates a Stripe session and redirects
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ── CDN Assets ───────────────────────────────────────────────────────────────
const TSHIRT_WHITE_STREET = "/media/shop-white-tee-street_502bf470.png";
const TSHIRT_BLACK_MAN    = "/media/shop-black-tee-man_5b5c6a7a.png";

// ── Product catalogue (mirrors server META_CONTENT_ID_MAP) ───────────────────
const META_CONTENT_ID_MAP: Record<string, {
  productId: string;
  productName: string;
  variant: string;
  imageUrl: string;
}> = {
  "rym4mzxan3": {
    productId: "white-tee",
    productName: "The Matchstick People — White Tee",
    variant: "White",
    imageUrl: TSHIRT_WHITE_STREET,
  },
  "dokwhvxln2": {
    productId: "black-tee",
    productName: "The Matchstick People — Black Tee",
    variant: "Black",
    imageUrl: TSHIRT_BLACK_MAN,
  },
};

// Display sizes → Printify size labels
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DISPLAY_TO_PRINTIFY: Record<string, string> = {
  XS: "S",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "2XL",
};

// ── Gildan 5000 Size Guide Data (inches) ─────────────────────────────────────
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
          Measurements are in inches. Relaxed unisex fit — size down for a slimmer look.
        </p>

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

// ── Single product size + quantity picker ────────────────────────────────────
interface ProductEntry {
  contentId: string;
  quantity: number;
  product: typeof META_CONTENT_ID_MAP[string];
}

function ProductSizePicker({
  entry,
  selectedSize,
  quantity,
  onSizeChange,
  onQuantityChange,
  stockMap,
  onShowSizeGuide,
}: {
  entry: ProductEntry;
  selectedSize: string | null;
  quantity: number;
  onSizeChange: (size: string) => void;
  onQuantityChange: (qty: number) => void;
  stockMap: Record<string, boolean> | undefined;
  onShowSizeGuide: () => void;
}) {
  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const { product } = entry;
  const isBlack = product.variant === "Black";

  const isSizeInStock = (displaySize: string): boolean => {
    if (!stockMap || Object.keys(stockMap).length === 0) return true;
    const printifySize = DISPLAY_TO_PRINTIFY[displaySize] ?? displaySize;
    return stockMap[printifySize] !== false;
  };

  const isRemoved = quantity === 0;

  // Quantity stepper button style
  const stepperBtn = (disabled: boolean): React.CSSProperties => ({
    width: "2.25rem",
    height: "2.25rem",
    border: "1px solid #D5CFC4",
    backgroundColor: "transparent",
    color: disabled ? "#C0B8AE" : "#0D0C0A",
    fontFamily: "'DM Mono', monospace",
    fontSize: "1rem",
    lineHeight: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s ease",
  });

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "3rem",
      alignItems: "start",
      marginBottom: "3rem",
      paddingBottom: "3rem",
      borderBottom: "1px solid #E0D9CE",
      opacity: isRemoved ? 0.4 : 1,
      transition: "opacity 0.2s ease",
    }} className="size-picker-grid">
      {/* Product image */}
      <div style={{
        backgroundColor: isBlack ? "#111" : "#e8e4dc",
        overflow: "hidden",
        aspectRatio: "3/4",
      }}>
        <img
          src={product.imageUrl}
          alt={product.productName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
          }}
        />
      </div>

      {/* Size + quantity picker */}
      <div style={{ paddingTop: "1rem" }}>
        <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "0.5rem" }}>
          {product.variant} Tee
        </p>
        <h2 style={{ ...serif, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 300, lineHeight: 1.1, color: "#0D0C0A", margin: "0 0 0.5rem" }}>
          The Matchstick People
        </h2>
        <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.08em", color: "#C8251A", marginBottom: "2rem" }}>
          $38.00 each
        </p>

        {/* Size selector */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560" }}>
              Select Size
            </p>
            <button
              onClick={onShowSizeGuide}
              style={{
                background: "none", border: "none", cursor: "pointer",
                ...mono, fontSize: "0.48rem", letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#6B6560",
                textDecoration: "underline",
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
                  onClick={() => inStock && onSizeChange(size)}
                  disabled={!inStock}
                  style={{
                    width: "3rem",
                    height: "3rem",
                    border: isSelected ? "2px solid #0D0C0A" : "1px solid #D5CFC4",
                    backgroundColor: isSelected ? "#0D0C0A" : "transparent",
                    color: isSelected ? "#F5F0E8" : inStock ? "#0D0C0A" : "#C0B8AE",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.06em",
                    cursor: inStock ? "pointer" : "not-allowed",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.15s ease",
                  }}
                >
                  {size}
                  {!inStock && (
                    <svg
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                      viewBox="0 0 48 48"
                    >
                      <line x1="4" y1="44" x2="44" y2="4" stroke="#C0B8AE" strokeWidth="1" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sold-out legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <div style={{ position: "relative", width: "1.2rem", height: "1.2rem", border: "1px solid #D5CFC4", flexShrink: 0 }}>
              <svg viewBox="0 0 20 20" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <line x1="2" y1="18" x2="18" y2="2" stroke="#C0B8AE" strokeWidth="1" />
              </svg>
            </div>
            <p style={{ ...mono, fontSize: "0.45rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B948C" }}>
              Sold out
            </p>
          </div>
        </div>

        {/* Quantity selector */}
        <div>
          <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", marginBottom: "0.75rem" }}>
            Quantity
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
            {/* Minus */}
            <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={false}
              style={stepperBtn(false)}
              aria-label="Decrease quantity"
            >
              −
            </button>

            {/* Count display */}
            <div style={{
              width: "3rem",
              height: "2.25rem",
              border: "1px solid #D5CFC4",
              borderLeft: "none",
              borderRight: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
              color: isRemoved ? "#C0B8AE" : "#0D0C0A",
              userSelect: "none",
            }}>
              {quantity}
            </div>

            {/* Plus */}
            <button
              onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
              disabled={quantity >= 10}
              style={stepperBtn(quantity >= 10)}
              aria-label="Increase quantity"
            >
              +
            </button>

            {/* Unit price hint / removed badge */}
            {isRemoved ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "1rem" }}>
                <p style={{ ...mono, fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C8251A" }}>
                  Removed
                </p>
                <button
                  onClick={() => onQuantityChange(1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    ...mono,
                    fontSize: "0.48rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#6B6560",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Add back
                </button>
              </div>
            ) : (
              <p style={{ ...sans, fontSize: "0.78rem", color: "#9B948C", marginLeft: "1rem" }}>
                ${(quantity * 38).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SizeSelect() {
  const [location] = useLocation();
  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  // Parse products from URL query string
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  // Quantities are managed separately so they can be adjusted without re-parsing
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productsParam = params.get("products");
    if (!productsParam) {
      setInvalid(true);
      return;
    }

    const parsed: ProductEntry[] = [];
    const initialQtys: Record<string, number> = {};
    for (const entry of productsParam.split(",")) {
      const [contentId, qtyStr] = entry.split(":");
      const quantity = parseInt(qtyStr ?? "1", 10) || 1;
      const product = META_CONTENT_ID_MAP[contentId];
      if (product) {
        parsed.push({ contentId, quantity, product });
        initialQtys[contentId] = quantity;
      }
    }

    if (parsed.length === 0) {
      setInvalid(true);
      return;
    }

    setEntries(parsed);
    setQuantities(initialQtys);
  }, [location]);

  // Fetch stock levels
  const { data: stockData } = trpc.shop.getStock.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Stripe checkout mutation
  const createCheckout = trpc.shop.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  // Only include products with qty > 0
  const activeEntries = entries.filter((e) => (quantities[e.contentId] ?? e.quantity) > 0);

  const handleBuyNow = () => {
    if (activeEntries.length === 0) {
      toast.error("Please add at least one item to your order.");
      return;
    }
    for (const entry of activeEntries) {
      if (!selectedSizes[entry.contentId]) {
        toast.error(`Please select a size for the ${entry.product.variant} Tee.`);
        return;
      }
    }

    const items = activeEntries.map((entry) => ({
      productId: entry.product.productId,
      productName: entry.product.productName,
      size: selectedSizes[entry.contentId]!,
      quantity: quantities[entry.contentId] ?? entry.quantity,
      unitAmountCents: 3800,
      imageUrl: entry.product.imageUrl,
    }));

    createCheckout.mutate({
      items,
      origin: window.location.origin,
    });
  };

  const totalItems = activeEntries.reduce((sum, e) => sum + (quantities[e.contentId] ?? e.quantity), 0);
  const totalCents = activeEntries.reduce((sum, e) => sum + (quantities[e.contentId] ?? e.quantity) * 3800, 0);

  // ── Invalid / no products ─────────────────────────────────────────────────
  if (invalid) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1rem" }}>
            Nothing to show
          </p>
          <Link href="/shop" style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C8251A", textDecoration: "underline" }}>
            Browse the shop →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F0E8" }}>
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid #E0D9CE", padding: "1.5rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/">
          <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#0D0C0A", cursor: "pointer" }}>
            The Matchstick People
          </p>
        </Link>
        <Link href="/shop">
          <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B6560", cursor: "pointer" }}>
            ← Back to shop
          </p>
        </Link>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2.5rem 6rem" }}>
        {/* Page heading */}
        <div style={{ marginBottom: "3.5rem" }}>
          <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "0.75rem" }}>
            Almost there
          </p>
          <h1 style={{ ...serif, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.02em", color: "#0D0C0A", margin: "0 0 1rem" }}>
            Choose your<br /><em style={{ fontStyle: "italic", color: "#C8251A" }}>size.</em>
          </h1>
          <p style={{ ...sans, fontSize: "0.9rem", color: "#6B6560", lineHeight: 1.7, maxWidth: "480px" }}>
            Gildan 5000 heavyweight cotton. Relaxed unisex fit — size down if you prefer a slimmer look.
          </p>
        </div>

        {/* Product size + quantity pickers */}
        {entries.map((entry) => (
          <ProductSizePicker
            key={entry.contentId}
            entry={entry}
            selectedSize={selectedSizes[entry.contentId] ?? null}
            quantity={quantities[entry.contentId] ?? entry.quantity}
            onSizeChange={(size) => setSelectedSizes((prev) => ({ ...prev, [entry.contentId]: size }))}
            onQuantityChange={(qty) => setQuantities((prev) => ({ ...prev, [entry.contentId]: qty }))}
            stockMap={stockData?.[entry.product.productId]}
            onShowSizeGuide={() => setShowSizeGuide(true)}
          />
        ))}

        {/* Order summary + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }} className="order-cta">
          <div>
            <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", marginBottom: "0.25rem" }}>
              Order summary
            </p>
            <p style={{ ...serif, fontSize: "1.4rem", fontWeight: 400, color: "#0D0C0A" }}>
              {totalItems} item{totalItems !== 1 ? "s" : ""} · ${(totalCents / 100).toFixed(2)}
            </p>
            <p style={{ ...sans, fontSize: "0.78rem", color: "#9B948C", marginTop: "0.25rem" }}>
              Free shipping worldwide
            </p>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={createCheckout.isPending}
            style={{
              padding: "1.1rem 2.5rem",
              backgroundColor: createCheckout.isPending ? "#9B948C" : "#0D0C0A",
              color: "#F5F0E8",
              border: "none",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: createCheckout.isPending ? "wait" : "pointer",
              transition: "background-color 0.2s ease",
              minWidth: "200px",
            }}
            onMouseEnter={(e) => {
              if (!createCheckout.isPending) e.currentTarget.style.backgroundColor = "#C8251A";
            }}
            onMouseLeave={(e) => {
              if (!createCheckout.isPending) e.currentTarget.style.backgroundColor = "#0D0C0A";
            }}
          >
            {createCheckout.isPending ? "Redirecting…" : "Continue to checkout →"}
          </button>
        </div>

        {/* Trust signals */}
        <div style={{ marginTop: "2.5rem", display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
          {[
            "Secure payment via Stripe",
            "Print-on-demand · Ships in 3–5 days",
            "Order confirmation by email",
          ].map((text) => (
            <p key={text} style={{ ...mono, fontSize: "0.48rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B948C" }}>
              ◆ {text}
            </p>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .size-picker-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .order-cta { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
}
