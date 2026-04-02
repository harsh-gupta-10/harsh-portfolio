export default function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0f172a",
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        gap: 24,
      }}
    >
      {/* Animated initials ring */}
      <div style={{ position: "relative", width: 64, height: 64 }}>
        {/* Spinning ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid rgba(59,130,246,0.1)",
            borderTopColor: "#3b82f6",
            animation: "pgSpin 0.8s linear infinite",
          }}
        />
        {/* Inner initials */}
        <div
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: "50%",
            background: "rgba(30,41,59,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: -1,
              background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HG
          </span>
        </div>
      </div>

      {/* Loading text */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#475569",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          animation: "pgPulse 1.5s ease-in-out infinite",
        }}
      >
        Loading…
      </p>

      <style>{`
        @keyframes pgSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes pgPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
