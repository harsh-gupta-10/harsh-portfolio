import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UPIPayment from "../../components/admin/UPIPayment";

const STATUS_META = {
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  sent: { label: "Sent", color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
  paid: { label: "Paid", color: "#4ade80", bg: "rgba(34,197,94,0.15)" },
  overdue: { label: "Overdue", color: "#f87171", bg: "rgba(239,68,68,0.15)" },
  cancelled: { label: "Cancelled", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
};

export default function PublicInvoiceView() {
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
        else if (res.document?.type !== "invoice") setError("Document not found.");
        else setData(res.document);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load invoice.");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading invoice…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Invoice Not Found</h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>{error || "This link may have expired or is invalid."}</p>
        </div>
      </div>
    );
  }

  const { invoice, items, client, project, settings } = data;
  const m = STATUS_META[invoice.status] || STATUS_META.draft;
  const subtotal = Number(invoice.subtotal || 0);
  const taxAmt = Number(invoice.tax_amount || 0);
  const total = Number(invoice.total || 0);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%)", padding: "40px 16px", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Brand Strip */}
      <div style={{ maxWidth: 760, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {settings?.logo_url && (
            <img src={settings.logo_url} alt="logo" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8 }} />
          )}
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", lineHeight: 1.2 }}>{settings?.full_name || "Harsh Gupta"}</p>
            <p style={{ fontSize: 11, color: "#64748b" }}>{settings?.company_name || "Frontend Developer"}</p>
          </div>
        </div>
        <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.color}40` }}>{m.label}</span>
      </div>

      {/* Invoice Card */}
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", padding: "40px 48px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, margin: 0 }}>INVOICE</h1>
              <p style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>{invoice.invoice_number}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {settings?.logo_url && <img src={settings.logo_url} alt="logo" style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 10, marginBottom: 8 }} />}
              <p style={{ fontWeight: 700, fontSize: 18 }}>{settings?.full_name || "Harsh Gupta"}</p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>{settings?.company_name}</p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>{settings?.email}</p>
              {settings?.phone && <p style={{ fontSize: 12, opacity: 0.6 }}>{settings.phone}</p>}
            </div>
          </div>
        </div>

        {/* Bill To + Dates */}
        <div style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
          <div>
            <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 6 }}>Bill To</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 2 }}>{client?.name || "—"}</p>
            {client?.company && <p style={{ fontSize: 13, color: "#6b7280" }}>{client.company}</p>}
            {client?.email && <p style={{ fontSize: 13, color: "#6b7280" }}>{client.email}</p>}
            {client?.city && <p style={{ fontSize: 13, color: "#6b7280" }}>{client.city}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            {[
              { label: "Invoice Date", value: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
              { label: "Due Date", value: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
              project && { label: "Project", value: project.title },
              settings?.gstin && { label: "GSTIN", value: settings.gstin },
            ].filter(Boolean).map(r => (
              <div key={r.label} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>{r.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginTop: 2 }}>{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div style={{ padding: "0 48px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "14px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>Description</th>
                <th style={{ textAlign: "center", padding: "14px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", width: 60 }}>Qty</th>
                <th style={{ textAlign: "right", padding: "14px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", width: 100 }}>Rate</th>
                <th style={{ textAlign: "right", padding: "14px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", width: 110 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 0", fontSize: 14, color: "#1e293b" }}>{item.description}</td>
                  <td style={{ padding: "14px 0", fontSize: 14, textAlign: "center", color: "#64748b" }}>{item.quantity}</td>
                  <td style={{ padding: "14px 0", fontSize: 14, textAlign: "right", color: "#64748b" }}>₹{Number(item.rate).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 0", fontSize: 14, textAlign: "right", fontWeight: 700, color: "#1e293b" }}>₹{Number(item.amount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: "24px 48px 32px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
              <span>Subtotal</span>
              <span style={{ color: "#111", fontWeight: 500 }}>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
              <span>GST ({invoice.tax_percent || 0}%)</span>
              <span style={{ color: "#111", fontWeight: 500 }}>₹{taxAmt.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 8px", fontSize: 22, fontWeight: 900, borderTop: "3px solid #111", marginTop: 4, color: "#111" }}>
              <span>Total</span>
              <span style={{ color: "#1d4ed8" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {(settings?.bank_name || settings?.upi_id) && (
          <div style={{ margin: "0 48px 24px", padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 10 }}>Payment Information</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {settings.bank_name && <div style={{ fontSize: 13 }}><span style={{ color: "#64748b" }}>Bank: </span><strong>{settings.bank_name}</strong></div>}
              {settings.account_number && <div style={{ fontSize: 13 }}><span style={{ color: "#64748b" }}>Account: </span><strong>{settings.account_number}</strong></div>}
              {settings.ifsc_code && <div style={{ fontSize: 13 }}><span style={{ color: "#64748b" }}>IFSC: </span><strong>{settings.ifsc_code}</strong></div>}
              {settings.upi_id && <div style={{ fontSize: 13 }}><span style={{ color: "#64748b" }}>UPI: </span><strong>{settings.upi_id}</strong></div>}
            </div>
          </div>
        )}

        {/* UPI Payment Section */}
        {settings?.upi_id && settings?.show_qr_invoice && (
          <div style={{ padding: "0 48px" }}>
            <UPIPayment invoice={invoice} settings={settings} />
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div style={{ margin: "0 48px 24px" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 6 }}>Notes</p>
            <p style={{ fontSize: 13, color: "#6b7280", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "20px 48px", background: "#f9fafb", textAlign: "center", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>{settings?.invoice_footer_note || "Thank you for your business!"}</p>
          <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>{settings?.email} {settings?.phone ? `• ${settings.phone}` : ""}</p>
        </div>
      </div>

      <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#94a3b8" }}>
        Sent securely via {settings?.full_name || "Harsh Gupta"}'s portfolio CRM
      </p>
    </div>
  );
}
