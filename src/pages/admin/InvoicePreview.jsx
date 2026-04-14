import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { BlobProvider } from "@react-pdf/renderer";
import {
  ArrowLeft, Download, Mail, CheckCircle2, Pencil, Send, Printer, Radar
} from "lucide-react";
import InvoicePDF from "./InvoicePDF";
import TrackingPixelModal from "../../components/admin/TrackingPixelModal";
import UPIPayment from "../../components/admin/UPIPayment";
import { buildUPILink } from "../../lib/upi";
import QRCode from "qrcode";

const STATUS_META = {
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  sent: { label: "Sent", color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
  paid: { label: "Paid", color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
  overdue: { label: "Overdue", color: "#f87171", bg: "rgba(239,68,68,0.1)" },
  cancelled: { label: "Cancelled", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);

  useEffect(() => { fetchInvoice(); }, [id]);

  async function fetchInvoice() {
    const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (!inv) { setLoading(false); return; }
    setInvoice(inv);

    const { data: { user } } = await supabase.auth.getUser();
    const [itemsRes, clientRes, projRes, settingsRes] = await Promise.all([
      supabase.from("invoice_items").select("*").eq("invoice_id", id),
      inv.client_id ? supabase.from("clients").select("*").eq("id", inv.client_id).single() : Promise.resolve({ data: null }),
      inv.project_id ? supabase.from("projects").select("id, title").eq("id", inv.project_id).single() : Promise.resolve({ data: null }),
      user ? supabase.from("settings").select("*").eq("user_id", user.id).single() : Promise.resolve({ data: null }),
    ]);
    if (itemsRes.data) setItems(itemsRes.data);
    if (clientRes.data) setClient(clientRes.data);
    if (projRes.data) setProject(projRes.data);
    if (settingsRes.data) {
      setSettings(settingsRes.data);
      if (settingsRes.data.upi_id && settingsRes.data.show_qr_pdf) {
        const upiLink = buildUPILink({
          amount: inv.total,
          invoiceNumber: inv.invoice_number,
          upiId: settingsRes.data.upi_id,
          name: settingsRes.data.upi_name || settingsRes.data.full_name
        });
        QRCode.toDataURL(upiLink, { margin: 2, width: 200 }).then(setQrCodeDataUrl);
      }
    }
    setLoading(false);
  }

  async function markPaid() {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
    setInvoice(prev => ({ ...prev, status: "paid" }));
  }

  async function markSent() {
    await supabase.from("invoices").update({ status: "sent" }).eq("id", id);
    setInvoice(prev => ({ ...prev, status: "sent" }));
  }

  function handleEmailSend() {
    if (!client?.email) { alert("Client has no email address."); return; }
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number} from Harsh Gupta`);
    const body = encodeURIComponent(`Hi ${client.name},\n\nPlease find attached invoice ${invoice.invoice_number} for ₹${Number(invoice.total).toLocaleString()}.\n\nDue date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}\n\nThank you,\nHarsh Gupta`);
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!invoice) return <div className="text-center py-20"><p className="text-sm" style={{ color: "#94a3b8" }}>Invoice not found.</p></div>;

  const m = STATUS_META[invoice.status] || STATUS_META.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/invoices")} className="p-2 rounded-lg hover:bg-white/10" style={{ color: "#94a3b8" }}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-white">{invoice.invoice_number}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: m.bg, color: m.color }}>{m.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/admin/invoices/${id}/edit`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-all" style={{ color: "#94a3b8", border: "1px solid #334155" }}><Pencil size={14} />Edit</Link>
          {invoice.status === "draft" && (
            <button onClick={markSent} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all" style={{ color: "#60a5fa", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}><Send size={14} />Mark Sent</button>
          )}
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <button onClick={markPaid} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all" style={{ color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}><CheckCircle2 size={14} />Mark Paid</button>
          )}
          <button 
            onClick={() => setShowTracker(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all" 
            style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
            title="Generate Tracking Pixel"
          >
            <Radar size={14} />Track
          </button>
          <button onClick={handleEmailSend} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all" style={{ color: "#94a3b8", border: "1px solid #334155" }}><Mail size={14} />Email</button>
          <BlobProvider document={<InvoicePDF invoice={invoice} items={items} client={client} project={project} settings={settings} qrCodeDataUrl={qrCodeDataUrl} />}>
            {({ url, loading }) => (
              <a
                href={url}
                download={`${invoice.invoice_number || 'Invoice'}.pdf`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Download size={14} />{loading ? "Generating..." : "Download PDF"}
              </a>
            )}
          </BlobProvider>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="rounded-2xl overflow-hidden mx-auto max-w-3xl print:w-full print:shadow-none print:rounded-none" style={{ background: "#fff", color: "#111", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", padding: "40px 48px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>INVOICE</h2>
              <p style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{invoice.invoice_number}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{settings?.full_name || "Harsh Gupta"}</h3>
              <p style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{settings?.company_name || "Frontend Developer & Designer"}</p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>{settings?.email || "harshgupta24716@gmail.com"}</p>
            </div>
          </div>
        </div>

        {/* Bill To + Dates */}
        <div style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
          <div>
            <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", letterSpacing: 1 }}>Bill To</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{client?.name || "—"}</p>
            {client?.company && <p style={{ fontSize: 13, color: "#6b7280" }}>{client.company}</p>}
            {client?.email && <p style={{ fontSize: 13, color: "#6b7280" }}>{client.email}</p>}
            {client?.city && <p style={{ fontSize: 13, color: "#6b7280" }}>{client.city}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            {[
              { label: "Issue Date", value: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("en-IN") : "—" },
              { label: "Due Date", value: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN") : "—" },
              { label: "Project", value: project?.title || "—" },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", letterSpacing: 1 }}>{r.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div style={{ padding: "0 48px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "12px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", letterSpacing: 1 }}>Description</th>
                <th style={{ textAlign: "center", padding: "12px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", width: 60 }}>Qty</th>
                <th style={{ textAlign: "right", padding: "12px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", width: 90 }}>Rate</th>
                <th style={{ textAlign: "right", padding: "12px 0", fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", width: 100 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 0", fontSize: 14 }}>{item.description}</td>
                  <td style={{ padding: "14px 0", fontSize: 14, textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "14px 0", fontSize: 14, textAlign: "right" }}>₹{Number(item.rate).toLocaleString()}</td>
                  <td style={{ padding: "14px 0", fontSize: 14, textAlign: "right", fontWeight: 600 }}>₹{Number(item.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: "24px 48px 32px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#6b7280" }}>
              <span>Subtotal</span><span style={{ color: "#111", fontWeight: 500 }}>₹{Number(invoice.subtotal || 0).toLocaleString()}</span>
            </div>
            {!settings?.hide_gst && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#6b7280" }}>
                <span>GST ({invoice.tax_percent}%)</span><span style={{ color: "#111", fontWeight: 500 }}>₹{Number(invoice.tax_amount || 0).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 18, fontWeight: 700, borderTop: "2px solid #111", marginTop: 8 }}>
              <span>Total</span><span>₹{Number(invoice.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* UPI Payment Section */}
        {settings?.upi_id && settings?.show_qr_invoice && (
          <div style={{ padding: "0 48px" }}>
            <UPIPayment invoice={invoice} settings={settings} />
          </div>
        )}

        <div style={{ padding: "20px 48px", background: "#f9fafb", textAlign: "center", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>{settings?.invoice_footer_note || "Thank you for your business!"} • {settings?.full_name || "Harsh Gupta"} • {settings?.email || "harshgupta24716@gmail.com"}</p>
        </div>
      </div>

      {/* Print CSS Injection */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          .print\\:w-full, .print\\:w-full * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:w-full { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: auto;
            overflow: visible !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <TrackingPixelModal 
        isOpen={showTracker}
        onClose={() => setShowTracker(false)}
        recipientEmail={client?.email || ""}
        subject={`Invoice ${invoice.invoice_number} from Harsh Gupta`}
        type="invoice"
        sourceId={id}
        sourceType="invoice"
      />
    </div>
  );
}
