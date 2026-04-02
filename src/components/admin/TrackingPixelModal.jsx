import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Radar, Copy, Check, X, Loader2, Link2, ExternalLink, FileText, ScrollText, Info } from "lucide-react";

export default function TrackingPixelModal({ isOpen, onClose, recipientEmail, subject, type = "invoice", sourceId, sourceType }) {
  const [generating, setGenerating] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPixel, setCopiedPixel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function generateTracker() {
    setGenerating(true);
    const trackingId = crypto.randomUUID();

    const { data, error } = await supabase.from("email_tracking").insert({
      tracking_id: trackingId,
      recipient_email: recipientEmail,
      subject: subject,
      source_id: sourceId,
      source_type: sourceType,
    }).select().single();

    if (!error && data) {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const pixelUrl = `${baseUrl}/functions/v1/track?id=${trackingId}`;
      const pixelSnippet = `<img src="${pixelUrl}" width="1" height="1" style="display:none; visibility:hidden;" alt="" />`;

      // Public shareable link — opens the branded view page in the client's browser
      const origin = window.location.origin;
      const viewUrl = sourceType === "invoice"
        ? `${origin}/view/invoice/${trackingId}`
        : `${origin}/view/proposal/${trackingId}`;

      setTrackingData({ viewUrl, pixelUrl, pixelSnippet });
    }
    setGenerating(false);
  }

  function copy(text, setter) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  if (!isOpen) return null;

  const TypeIcon = sourceType === "invoice" ? FileText : ScrollText;
  const accentColor = sourceType === "invoice" ? "#3b82f6" : "#a855f7";
  const accentBg = sourceType === "invoice" ? "rgba(59,130,246,0.1)" : "rgba(168,85,247,0.1)";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${accentBg} 0%, transparent 100%)` }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl border" style={{ background: accentBg, borderColor: `${accentColor}30`, color: accentColor }}>
              <Radar size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generate Share Link</h2>
              <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                <TypeIcon size={10} />{sourceType} tracker
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {!trackingData ? (
            <div className="space-y-5">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 flex gap-3 items-start">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Creates a <strong className="text-white">shareable link</strong> for this {sourceType}.
                  When your client opens it in their browser, the view is <strong className="text-white">instantly tracked</strong> — no PDF attachment needed.
                </p>
              </div>

              {recipientEmail && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-400">Tracking <span className="text-white font-medium">{recipientEmail}</span></p>
                </div>
              )}

              <button
                onClick={generateTracker}
                disabled={generating}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${sourceType === "invoice" ? "#6366f1" : "#ec4899"})`, boxShadow: `0 8px 24px ${accentColor}30` }}
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                {generating ? "Generating link…" : "Generate Shareable Link"}
              </button>
            </div>
          ) : (
            <div className="space-y-5" style={{ animation: "modalIn 0.2s ease-out" }}>
              {/* Success Banner */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <Check size={16} className="text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-300 font-medium">Link created! Share it with your client.</p>
              </div>

              {/* Primary: Shareable Link */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  🔗  Share Link (Open in Browser)
                </label>
                <div className="flex gap-2">
                  <div
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-sky-300 overflow-x-auto whitespace-nowrap"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {trackingData.viewUrl}
                  </div>
                  <button
                    onClick={() => copy(trackingData.viewUrl, setCopiedLink)}
                    className={`shrink-0 p-2.5 rounded-xl border transition-all ${copiedLink ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" : "text-slate-400 border-slate-700 bg-slate-800 hover:text-white hover:bg-slate-700"}`}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <a
                    href={trackingData.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                    title="Preview link"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Share this URL via email, WhatsApp, or any messaging app. Every time the client opens it, the view is recorded in your <span className="text-blue-400">Email Tracker</span> dashboard.
                </p>
              </div>

              {/* Advanced: Email pixel (collapsible) */}
              <div>
                <button
                  onClick={() => setShowAdvanced(v => !v)}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <span style={{ transform: showAdvanced ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▶</span>
                  Advanced: Email pixel HTML
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-2" style={{ animation: "modalIn 0.15s ease-out" }}>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Alternatively, embed this hidden image tag in your email to track opens without sharing a link.
                    </p>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {trackingData.pixelSnippet}
                      </div>
                      <button
                        onClick={() => copy(trackingData.pixelSnippet, setCopiedPixel)}
                        className={`shrink-0 p-2.5 rounded-xl border transition-all ${copiedPixel ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" : "text-slate-400 border-slate-700 bg-slate-800 hover:text-white"}`}
                      >
                        {copiedPixel ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
