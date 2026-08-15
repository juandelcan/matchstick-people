/*
 * Contact.tsx — The Matchstick People
 * Design: Cinematic Editorial
 * Contact form wired to tRPC backend → notifyOwner → real email delivery
 * Spam protection: honeypot field + server-side rate limiting
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const inquiryTypes = [
  "Brand Collaboration",
  "Licensing",
  "Press / Media",
  "Commission",
  "General Inquiry",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    type: "",
    message: "",
    website: "", // honeypot — hidden from humans
  });
  const [submitted, setSubmitted] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent. We'll be in touch soon.");
    },
    onError: (err) => {
      if (err.message.includes("Too many")) {
        toast.error("Too many submissions. Please wait a few minutes.");
      } else {
        toast.error("Something went wrong. Please try again or email us directly.");
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      type: form.type || undefined,
      message: form.message,
      website: form.website || undefined,
    });
  };

  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem 0",
    ...sans,
    fontSize: "0.9rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid #E0D9CE",
    color: "#0D0C0A",
    outline: "none",
    transition: "border-color 0.3s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    ...mono,
    fontSize: "0.55rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#6B6560",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "8rem 2.5rem 5rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "none" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <p style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1.5rem" }}>
            Get in touch
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "end" }}>
            <h1 style={{ ...serif, fontSize: "clamp(3.5rem, 7vw, 8rem)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.03em", color: "#0D0C0A", margin: 0 }}>
              Let's<br />
              <em style={{ fontStyle: "italic", color: "#C8251A" }}>talk.</em>
            </h1>
            <div>
              <p style={{ ...sans, fontSize: "0.95rem", color: "#6B6560", lineHeight: 1.8, marginBottom: "2rem" }}>
                We are open to brand collaborations, licensing partnerships,
                commissions, press inquiries, and institutional projects.
                Every message is read personally.
              </p>
              <div>
                <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", marginBottom: "0.5rem" }}>
                  Email directly
                </p>
                <a
                  href="mailto:hello@thematchstickpeople.com"
                  style={{ ...serif, fontSize: "1.1rem", color: "#0D0C0A", textDecoration: "none", borderBottom: "1px solid #C8251A", paddingBottom: "2px" }}
                >
                  hello@thematchstickpeople.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: "1px", backgroundColor: "#E0D9CE", marginTop: "3rem" }} />
      </section>

      {/* Form */}
      <section style={{ padding: "0 2.5rem 8rem", maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "6rem" }}>
          {/* Left sidebar */}
          <div>
            <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1rem" }}>
              Send a message
            </p>
            <div style={{ height: "1px", backgroundColor: "#E0D9CE" }} />
            <div style={{ marginTop: "3rem" }}>
              <p style={{ ...mono, fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6560", marginBottom: "1rem" }}>
                Follow
              </p>
              <a
                href="https://www.instagram.com/juan_delcan/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", ...sans, fontSize: "0.85rem", color: "#6B6560", marginBottom: "0.75rem", textDecoration: "none", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0D0C0A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
              >
                Instagram →
              </a>
              <a
                href="https://www.youtube.com/channel/UCRjQVwyyBD2VpX2u5rFdHkw"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", ...sans, fontSize: "0.85rem", color: "#6B6560", textDecoration: "none", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0D0C0A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
              >
                YouTube →
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {/* Honeypot — hidden from real users, bots fill it */}
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <label style={labelStyle}>Name <span style={{ color: "#C8251A" }}>*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#0D0C0A")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#E0D9CE")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email <span style={{ color: "#C8251A" }}>*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#0D0C0A")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#E0D9CE")}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2.5rem" }}>
                  <div>
                    <label style={labelStyle}>Company / Organization</label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Optional"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#0D0C0A")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#E0D9CE")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Type of Inquiry</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#0D0C0A")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#E0D9CE")}
                    >
                      <option value="">Select one</option>
                      {inquiryTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "2.5rem" }}>
                  <label style={labelStyle}>Message <span style={{ color: "#C8251A" }}>*</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project or inquiry..."
                    rows={6}
                    style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
                    onFocus={(e) => (e.target.style.borderBottomColor = "#0D0C0A")}
                    onBlur={(e) => (e.target.style.borderBottomColor = "#E0D9CE")}
                  />
                </div>

                <div style={{ marginTop: "2.5rem" }}>
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    style={{
                      padding: "1rem 2.5rem",
                      ...mono,
                      fontSize: "0.65rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      backgroundColor: submitMutation.isPending ? "#6B6560" : "#0D0C0A",
                      color: "#F5F0E8",
                      border: "none",
                      cursor: submitMutation.isPending ? "not-allowed" : "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => { if (!submitMutation.isPending) e.currentTarget.style.backgroundColor = "#C8251A"; }}
                    onMouseLeave={(e) => { if (!submitMutation.isPending) e.currentTarget.style.backgroundColor = "#0D0C0A"; }}
                  >
                    {submitMutation.isPending ? "Sending..." : "Send message →"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: "4rem 0" }}>
                <div style={{ borderLeft: "3px solid #C8251A", paddingLeft: "2rem" }}>
                  <h2 style={{ ...serif, fontSize: "clamp(2rem, 4vw, 4rem)", fontWeight: 300, lineHeight: 1.1, color: "#0D0C0A", marginBottom: "1rem" }}>
                    Thank you,<br />
                    <em style={{ fontStyle: "italic", color: "#C8251A" }}>{form.name}.</em>
                  </h2>
                  <p style={{ ...sans, fontSize: "0.95rem", color: "#6B6560", lineHeight: 1.8 }}>
                    Your message has been received. We read every inquiry personally
                    and will be in touch within a few business days.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 2fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
