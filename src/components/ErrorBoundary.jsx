import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

function DefaultErrorUI({ error, onReset }) {
  const isProd = typeof import.meta !== "undefined" && import.meta.env?.PROD;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        padding: 24,
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          textAlign: "center",
          padding: "40px 32px",
          borderRadius: 20,
          background: "rgba(30,41,59,0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(148,163,184,0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <AlertTriangle size={26} color="#f87171" />
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#f1f5f9",
            margin: "0 0 8px",
            letterSpacing: "-0.3px",
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            margin: "0 0 20px",
            lineHeight: 1.5,
          }}
        >
          An unexpected error occurred. This section failed to render.
        </p>

        {/* Error message (hidden in production) */}
        {!isProd && error?.message && (
          <div
            style={{
              textAlign: "left",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(148,163,184,0.1)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              overflowX: "auto",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Error Details
            </p>
            <code
              style={{
                fontSize: 12,
                color: "#f87171",
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.5,
              }}
            >
              {error.message}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => {
              if (onReset) onReset();
              else window.location.reload();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.3)";
            }}
          >
            <RotateCcw size={14} /> Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(51,65,85,0.5)",
              color: "#cbd5e1",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(51,65,85,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(51,65,85,0.5)")}
          >
            <Home size={14} /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info?.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultErrorUI error={this.state.error} onReset={this.reset} />
      );
    }
    return this.props.children;
  }
}
