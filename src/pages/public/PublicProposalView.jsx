import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const STATUS_META = {
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  sent: { label: "Sent", color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
  accepted: { label: "Accepted", color: "#4ade80", bg: "rgba(34,197,94,0.15)" },
  rejected: { label: "Rejected", color: "#f87171", bg: "rgba(239,68,68,0.15)" },
};

export default function PublicProposalView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    fetch(`${supabaseUrl}/functions/v1/view-document?id=${token}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.error) setError(res.error);
        else if (res.document?.type !== "proposal") setError("Document not found.");
        else setData(res.document);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load proposal.");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading proposal…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Proposal Not Found</h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>{error || "This link may have expired or is invalid."}</p>
        </div>
      </div>
    );
  }

  const { proposal, client, settings } = data;
  const content = proposal.content || {};
  const m = STATUS_META[proposal.status] || STATUS_META.draft;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)", color: "#fff", padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {settings?.logo_url && <img src={settings.logo_url} alt="logo" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10, background: "rgba(255,255,255,0.1)", padding: 4 }} />}
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{settings?.full_name || "Harsh Gupta"}</p>
                <p style={{ fontSize: 12, opacity: 0.6 }}>{settings?.company_name || "Frontend Developer & Designer"}</p>
              </div>
            </div>
            <span style={{ padding: "4px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.color}40` }}>{m.label}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, opacity: 0.4, marginBottom: 8 }}>Proposal</p>
              <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, margin: 0 }}>{proposal.title}</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.4, marginBottom: 4 }}>Prepared For</p>
              <p style={{ fontSize: 18, fontWeight: 700 }}>{client?.name || "—"}</p>
              {client?.company && <p style={{ fontSize: 13, opacity: 0.6 }}>{client.company}</p>}
              {proposal.valid_until && (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.4, marginTop: 12, marginBottom: 4 }}>Valid Until</p>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{new Date(proposal.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "-32px auto 60px", background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "48px 56px" }}>

          {/* Executive Summary */}
          {content.overview && (
            <Section number="1" title="Executive Summary">
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#4b5563", whiteSpace: "pre-wrap" }}>{content.overview}</p>
            </Section>
          )}

          {/* Scope of Work */}
          {content.scope?.length > 0 && (
            <Section number="2" title="Scope of Work">
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {content.scope.map((s, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", margin: 0 }}>{s}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Timeline */}
          {content.timeline?.length > 0 && (
            <Section number="3" title="Project Timeline">
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
                {content.timeline.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 24, position: "relative" }}>
                    <div style={{ flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: "#3b82f6", border: "3px solid #fff", boxShadow: "0 0 0 2px #3b82f6", marginTop: 2, zIndex: 1 }} />
                    <div style={{ paddingBottom: 4 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{t.date}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{t.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Investment / Pricing */}
          {content.pricing?.length > 0 && (
            <Section number="4" title="Investment">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "#64748b", letterSpacing: 1 }}>Description</th>
                    <th style={{ textAlign: "right", padding: "12px 0", fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "#64748b", letterSpacing: 1, width: 140 }}>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {content.pricing.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 0", fontSize: 14, color: "#374151" }}>{p.desc || "—"}</td>
                      <td style={{ padding: "14px 0", fontSize: 14, textAlign: "right", fontWeight: 600, color: "#1e293b" }}>₹{Number(p.cost).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "18px 0 8px", fontWeight: 700, fontSize: 16, color: "#0f172a", borderTop: "3px solid #0f172a" }}>Total Estimate</td>
                    <td style={{ padding: "18px 0 8px", textAlign: "right", fontWeight: 900, fontSize: 24, color: "#1d4ed8", borderTop: "3px solid #0f172a" }}>₹{Number(proposal.total_estimate).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </Section>
          )}

          {/* Terms */}
          {content.terms && (
            <Section number="5" title="Terms & Conditions">
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "#6b7280", whiteSpace: "pre-wrap" }}>{content.terms}</p>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "24px 56px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{settings?.full_name || "Harsh Gupta"}</p>
            <p style={{ fontSize: 12, color: "#64748b" }}>{settings?.email}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>{settings?.invoice_footer_note || "Thank you for considering this proposal!"}</p>
          </div>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", paddingBottom: 40 }}>
        Sent securely via {settings?.full_name || "Harsh Gupta"}'s portfolio CRM
      </p>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, borderBottom: "2px solid #f1f5f9", paddingBottom: 14 }}>
        <span style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #0f172a, #1e3a5f)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{number}</span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.3 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
