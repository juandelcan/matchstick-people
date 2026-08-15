import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F0E8", color: "#0D0C0A",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "2rem", textAlign: "center",
        fontFamily: "'Playfair Display', Georgia, serif",
      }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", margin: 0 }}>Something went wrong.</h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B6560", marginTop: "1rem" }}>
          Try reloading the page.
        </p>
        <button
          onClick={() => window.location.assign("/")}
          style={{
            marginTop: "2rem", padding: "0.85rem 2rem", background: "#C8391B",
            color: "#fff", border: "none", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: "0.75rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}
        >
          Back home
        </button>
      </div>
    );
  }
}
